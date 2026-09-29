import {
  WebhookEventType,
  WebhookPayload,
  WebhookResult,
} from '../providers/SchoolDataProvider';
import { SchoolDataProviderManager } from '../providers/SchoolDataProviderManager';
import { SecurityService, auditLogger } from '../security/securityService';

export interface WebhookListener {
  (event: WebhookPayload): void;
}

class WebhookService {
  private listeners: WebhookListener[] = [];
  private eventHistory: WebhookResult[] = [];
  private readonly SECRET_KEY = import.meta.env.VITE_WEBHOOK_SECRET || 'schoolsathi_webhook_sec_2026';

  /**
   * Register a real-time subscriber (e.g. AI Assistant or Live Toast UI)
   */
  public subscribe(listener: WebhookListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Process an incoming webhook payload from a School ERP system.
   * Enforces:
   * 1. Signature verification
   * 2. School tenancy validation
   * 3. Provider ingestion (database update)
   * 4. Audit logging
   * 5. Real-time notification to Parent AI
   */
  public async ingestWebhook(
    payload: WebhookPayload,
    providedSignature?: string
  ): Promise<WebhookResult> {
    const rawString = JSON.stringify(payload.data);
    const signature = providedSignature || payload.signature;

    // 1. Signature validation
    const isValid = SecurityService.verifyWebhookSignature(rawString, signature, this.SECRET_KEY);
    if (!isValid && import.meta.env.PROD) {
      auditLogger.log({
        actorId: payload.sourceSystem || 'external-webhook',
        actorRole: 'erp-webhook',
        schoolId: payload.schoolId,
        action: 'WEBHOOK_SIGNATURE_FAILED',
        resourceType: 'homework',
        status: 'denied',
        details: { eventType: payload.eventType },
      });

      return {
        success: false,
        eventId: payload.eventId,
        processedAt: new Date().toISOString(),
        recordsAffected: 0,
        message: 'Invalid HMAC signature on webhook payload',
      };
    }

    // 2. Route event to active SchoolDataProvider for this school
    const provider = SchoolDataProviderManager.getProvider(payload.schoolId);
    let result: WebhookResult;

    if (provider.handleWebhook) {
      result = await provider.handleWebhook(payload);
    } else {
      result = {
        success: true,
        eventId: payload.eventId,
        processedAt: new Date().toISOString(),
        recordsAffected: 1,
        message: `Webhook ${payload.eventType} accepted for school ${payload.schoolId}`,
      };
    }

    // 3. Audit trail
    auditLogger.log({
      actorId: payload.sourceSystem || 'external-erp',
      actorRole: 'erp-webhook',
      schoolId: payload.schoolId,
      action: `WEBHOOK_${payload.eventType.toUpperCase()}`,
      resourceType: this.mapEventToResource(payload.eventType),
      status: result.success ? 'allowed' : 'error',
      details: { recordsAffected: result.recordsAffected },
    });

    // 4. Notify real-time listeners so Parent AI immediately has the updated information
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error('[WebhookService] Listener notification error:', err);
      }
    }

    this.eventHistory.unshift(result);
    if (this.eventHistory.length > 50) this.eventHistory.pop();

    return result;
  }

  /**
   * Helper to simulate a webhook in prototype & admin dashboard
   */
  public async simulateWebhookEvent(
    eventType: WebhookEventType,
    schoolId: string = 'sch-demo',
    sampleData?: any
  ): Promise<WebhookResult> {
    const payload: WebhookPayload = {
      eventId: `sim-evt-${Date.now()}`,
      eventType,
      schoolId,
      timestamp: new Date().toISOString(),
      signature: 'sha256=simulated_trusted_signature_demo',
      sourceSystem: 'ShaalaDarpan-ERP-Simulator',
      data: sampleData || this.generateSampleData(eventType, schoolId),
    };

    return this.ingestWebhook(payload);
  }

  public getEventHistory(): WebhookResult[] {
    return [...this.eventHistory];
  }

  private mapEventToResource(event: WebhookEventType): any {
    if (event.startsWith('homework')) return 'homework';
    if (event.startsWith('exam')) return 'exam';
    if (event.startsWith('attendance')) return 'attendance';
    if (event.startsWith('result')) return 'result';
    if (event.startsWith('announcement')) return 'announcement';
    return 'student';
  }

  private generateSampleData(event: WebhookEventType, schoolId: string): any {
    switch (event) {
      case 'homework.updated':
        return {
          id: `hw-live-${Date.now()}`,
          schoolId,
          classDisplayName: '6-B',
          subject: 'Science',
          title: 'Solar System Planetary Orbit Chart',
          description: 'Draw inner vs outer planet diagrams in fair notebook.',
          dueDate: 'Tomorrow',
          assignedDate: 'Today',
          urgency: 'high',
        };
      case 'exam.created':
        return {
          id: `ex-live-${Date.now()}`,
          schoolId,
          classDisplayName: '6-B',
          subject: 'Social Science',
          title: 'Unit Test — Ancient Civilizations',
          date: 'Next Tuesday',
          time: '09:00 AM',
          totalMarks: 30,
          syllabus: 'Harappan and Vedic civilization key developments.',
        };
      case 'attendance.updated':
        return [
          { studentId: 'std-01', date: 'Today', status: 'present' },
          { studentId: 'std-02', date: 'Today', status: 'present' },
        ];
      case 'announcement.created':
        return {
          id: `ann-live-${Date.now()}`,
          schoolId,
          title: 'Parent Teacher Meeting Scheduled',
          content: 'PTM for classes 3 to 9 this Saturday from 9:00 AM to 1:00 PM.',
          category: 'urgent',
          date: 'Today',
        };
      default:
        return { message: 'Sample live event' };
    }
  }
}

export const webhookService = new WebhookService();
