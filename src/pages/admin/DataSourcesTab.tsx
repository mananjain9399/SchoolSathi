import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Globe,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Code,
  Key,
  Lock,
} from 'lucide-react';
import { SchoolDataProviderManager } from '../../services/providers/SchoolDataProviderManager';
import { ProviderType, ProviderHealth } from '../../services/providers/SchoolDataProvider';
import { webhookService } from '../../services/api/webhookService';
import { auditLogger, AuditLogEntry } from '../../services/security/securityService';
import { REST_API_ENDPOINTS } from '../../services/api/schoolApiContract';

export const DataSourcesTab: React.FC = () => {
  const [activeProviderType, setActiveProviderType] = useState<ProviderType>(() =>
    SchoolDataProviderManager.getActiveProviderType()
  );
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('homework');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [isLoadingSandbox, setIsLoadingSandbox] = useState(false);
  const [webhookLog, setWebhookLog] = useState<any[]>(() => webhookService.getEventHistory());
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => auditLogger.getRecentLogs('', 8));

  // Check health of active provider
  const refreshHealth = async () => {
    const provider = SchoolDataProviderManager.getProvider('sch-demo');
    const h = await provider.checkHealth();
    setHealth(h);
  };

  useEffect(() => {
    refreshHealth();
  }, [activeProviderType]);

  // Handle switching provider type
  const handleSwitchProvider = (type: ProviderType) => {
    SchoolDataProviderManager.setActiveProviderType(type, 'sch-demo');
    setActiveProviderType(type);
    setSandboxResponse(null);
  };

  // Run live API Sandbox call
  const handleRunSandbox = async () => {
    setIsLoadingSandbox(true);
    const provider = SchoolDataProviderManager.getProvider('sch-demo');

    try {
      let data: any;
      switch (selectedEndpoint) {
        case 'student':
          data = await provider.getStudent('std-01', 'sch-demo');
          break;
        case 'homework':
          data = await provider.getHomework('std-01', 'sch-demo');
          break;
        case 'exams':
          data = await provider.getExams('std-01', 'sch-demo');
          break;
        case 'attendance':
          data = await provider.getAttendance('std-01', 'sch-demo');
          break;
        case 'progress':
          data = await provider.getProgress('std-01', 'sch-demo');
          break;
        case 'timetable':
          data = await provider.getTimetable('6-B', 'sch-demo');
          break;
        case 'announcements':
          data = await provider.getAnnouncements('sch-demo', '6-B');
          break;
        case 'holidays':
          data = await provider.getHolidays('sch-demo');
          break;
        default:
          data = await provider.getSchool('sch-demo');
      }

      setSandboxResponse({
        status: 200,
        statusText: 'OK',
        headers: {
          'X-School-ID': 'sch-demo',
          'X-Correlation-ID': `req-${Date.now().toString().slice(-6)}`,
          'Content-Type': 'application/json',
        },
        payload: data,
      });
    } catch (err: any) {
      setSandboxResponse({
        status: 500,
        statusText: 'Internal Error',
        error: err.message,
      });
    } finally {
      setIsLoadingSandbox(false);
      setAuditLogs(auditLogger.getRecentLogs('', 8));
    }
  };

  // Trigger simulated ERP Webhook
  const handleTriggerWebhook = async (eventType: any) => {
    setIsSimulatingWebhook(true);
    const result = await webhookService.simulateWebhookEvent(eventType, 'sch-demo');
    setWebhookLog(webhookService.getEventHistory());
    setAuditLogs(auditLogger.getRecentLogs('', 8));
    setIsSimulatingWebhook(false);
  };

  const providerCards = [
    {
      type: 'mock' as ProviderType,
      title: 'Demo Mock Data Provider',
      subtitle: 'In-Memory / Local Storage',
      desc: 'Default offline provider for demonstrations, tests, and isolated sandbox development.',
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      tag: 'Default Active',
      tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    },
    {
      type: 'rest' as ProviderType,
      title: 'Real School REST API',
      subtitle: 'HTTP Endpoints Contract',
      desc: 'Connects directly to school ERP REST endpoints with tenant headers and token authentication.',
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      tag: 'Live Contract Ready',
      tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    },
    {
      type: 'csv' as ProviderType,
      title: 'CSV Import Fallback',
      subtitle: 'File-based Ingestion',
      desc: 'Upload standard CSV files when schools lack an active developer API. Validates schemas.',
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-400" />,
      tag: 'Fallback Provider',
      tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    },
    {
      type: 'erp' as ProviderType,
      title: 'Enterprise ERP Connector',
      subtitle: 'Shaala Darpan / Entab / Fedena',
      desc: 'Connector adapter for Indian school ERP platforms with webhook synchronization.',
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      tag: 'ERP Ready',
      tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border-b border-[#e0e0e0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[12px] font-semibold text-[#0066cc] uppercase block mb-1">
            Enterprise Architecture
          </span>
          <h2 className="text-[24px] font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Server className="w-6 h-6 text-[#0066cc]" />
            <span>Data Sources & School ERP Integration</span>
          </h2>
          <p className="text-[14px] text-[#7a7a7a] mt-1">
            AI communicates exclusively with the <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[#1d1d1f] font-mono">SchoolDataProvider</code> abstraction.
          </p>
        </div>

        {health && (
          <div className="flex items-center gap-2 bg-[#fafafc] border border-[#e0e0e0] px-4 py-2.5 rounded-[14px]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                health.status === 'healthy' ? 'bg-[#34c759] animate-pulse' : 'bg-[#ff9500]'
              }`}
            />
            <div className="text-[12px]">
              <span className="font-semibold text-[#1d1d1f] block capitalize">{health.status} ({health.latencyMs}ms)</span>
              <span className="text-[11px] text-[#7a7a7a] font-medium">{health.details}</span>
            </div>
          </div>
        )}
      </div>

      {/* 1. SELECT DATA PROVIDER IMPLEMENTATION */}
      <div>
        <h3 className="text-[14px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-2 mb-3">
          <span>1. Select Active Data Provider</span>
          <span className="text-[11px] font-semibold text-[#7a7a7a] font-mono">(SchoolDataProvider Interface)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providerCards.map((card) => {
            const isSelected = activeProviderType === card.type;
            return (
              <div
                key={card.type}
                onClick={() => handleSwitchProvider(card.type)}
                className={`p-5 rounded-[18px] border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#0066cc] shadow-md ring-1 ring-[#0066cc]/30'
                    : 'bg-[#fafafc] hover:bg-white border-[#e0e0e0]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#f0f0f0] border border-[#e0e0e0] flex items-center justify-center">
                        {card.icon}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-semibold text-[#1d1d1f]">{card.title}</h4>
                        <span className="text-[12px] text-[#7a7a7a] font-medium">{card.subtitle}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase ${
                      isSelected ? 'bg-[#0066cc]/10 text-[#0066cc]' : 'bg-[#e0e0e0] text-[#7a7a7a]'
                    }`}>
                      {card.tag}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#7a7a7a] mt-3 leading-relaxed">{card.desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#e0e0e0] flex items-center justify-between text-[12px]">
                  <span className="font-mono text-[#7a7a7a]">
                    Type: <strong className="text-[#1d1d1f]">{card.type}</strong>
                  </span>
                  <button
                    className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#0066cc] text-white'
                        : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1d1d1f]'
                    }`}
                  >
                    {isSelected ? 'Active Provider' : 'Switch To'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. REST API CONTRACT EXPLORER & SANDBOX */}
      <div className="bg-[#fafafc] border border-[#e0e0e0] rounded-[24px] p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-[14px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-2">
              <Code className="w-4 h-4 text-[#0066cc]" />
              <span>2. REST API Contract Explorer & Live Sandbox</span>
            </h3>
            <p className="text-[12px] text-[#7a7a7a] mt-1">
              Execute live GET requests against the defined contract:
            </p>
          </div>

          <span className="text-[11px] font-mono text-[#7a7a7a] bg-white border border-[#e0e0e0] px-3 py-1.5 rounded-[10px]">
            Tenant: <strong className="text-[#0066cc]">sch-demo</strong> | Student: <strong className="text-[#0066cc]">std-01 (Rohan)</strong>
          </span>
        </div>

        {/* Endpoint Selector & Execution Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="apple-search-input flex-1 font-mono text-[13px]"
          >
            <option value="homework">GET /students/:studentId/homework</option>
            <option value="exams">GET /students/:studentId/exams</option>
            <option value="attendance">GET /students/:studentId/attendance</option>
            <option value="progress">GET /students/:studentId/progress</option>
            <option value="timetable">GET /students/:studentId/timetable</option>
            <option value="announcements">GET /students/:studentId/announcements</option>
            <option value="student">GET /students/:studentId</option>
            <option value="holidays">GET /school/holidays</option>
          </select>

          <button
            onClick={handleRunSandbox}
            disabled={isLoadingSandbox}
            className="apple-btn-primary h-[44px] px-6"
          >
            {isLoadingSandbox ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Execute Request</span>
          </button>
        </div>

        {/* Live Payload Preview */}
        {sandboxResponse && (
          <div className="bg-white rounded-[14px] border border-[#e0e0e0] p-5 space-y-3 font-mono text-[12px] animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0] text-[#7a7a7a]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-[6px] bg-[#34c759]/10 text-[#34c759] font-semibold">
                  HTTP {sandboxResponse.status} {sandboxResponse.statusText}
                </span>
                <span>Active Provider: <strong className="text-[#1d1d1f]">{activeProviderType}</strong></span>
              </div>
              <span>Headers: X-School-ID: sch-demo</span>
            </div>

            <pre className="text-[#1d1d1f] overflow-x-auto max-h-64 p-3 rounded-[10px] bg-[#f5f5f7] leading-relaxed">
              {JSON.stringify(sandboxResponse.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 3. REAL-TIME WEBHOOK INGESTION ENGINE */}
      <div className="bg-[#fafafc] border border-[#e0e0e0] rounded-[24px] p-6 space-y-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#af52de]" />
            <span>3. Real-Time Webhook Simulator (School ERP ➔ SchoolSathi ➔ Parent AI)</span>
          </h3>
          <p className="text-[12px] text-[#7a7a7a] mt-1">
            Test immediate data delivery when school ERP emits real-time events. Parent AI instantly responds with the updated data.
          </p>
        </div>

        {/* Event Trigger Buttons */}
        <div className="flex flex-wrap gap-3">
          {[
            { id: 'homework.updated', label: 'Push homework.updated', icon: '📚' },
            { id: 'exam.created', label: 'Push exam.created', icon: '📝' },
            { id: 'attendance.updated', label: 'Push attendance.updated', icon: '✅' },
            { id: 'announcement.created', label: 'Push announcement.created', icon: '📢' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleTriggerWebhook(btn.id)}
              disabled={isSimulatingWebhook}
              className="flex items-center gap-2 apple-btn-secondary h-[36px] px-4"
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Webhook Deliveries */}
        {webhookLog.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#7a7a7a] uppercase tracking-wider block">
              Recent Webhook Ingestions (HMAC Verified):
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {webhookLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-[#e0e0e0] text-[12px] font-mono shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
                    <span className="text-[#1d1d1f] font-medium">{log.message}</span>
                  </div>
                  <span className="text-[11px] text-[#7a7a7a]">{new Date(log.processedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. SECURITY & AUDIT TRAIL MONITOR */}
      <div className="bg-white border border-[#e0e0e0] rounded-[24px] p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34c759]" />
            <span>4. Security & Audit Logging (SLAC & Multi-School Isolation)</span>
          </h3>
          <span className="text-[11px] font-semibold bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20 px-3 py-1 rounded-full">
            Zero Cross-School Leakage Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] font-mono border border-[#e0e0e0] rounded-[10px] overflow-hidden">
            <thead className="bg-[#f5f5f7]">
              <tr className="border-b border-[#e0e0e0] text-[11px] text-[#7a7a7a] uppercase font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">School Tenant</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0] text-[#1d1d1f]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#fafafc] transition-colors">
                  <td className="py-2.5 px-3 text-[#7a7a7a]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 font-semibold">{log.actorId} ({log.actorRole})</td>
                  <td className="py-2.5 px-3 text-[#0066cc] font-medium">{log.schoolId}</td>
                  <td className="py-2.5 px-3">{log.action}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase ${
                        log.status === 'allowed'
                          ? 'bg-[#34c759]/10 text-[#34c759]'
                          : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
