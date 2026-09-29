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
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
            Enterprise Architecture
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-orange-500" />
            <span>Data Sources & School ERP Integration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            AI communicates exclusively with the <code className="text-orange-300 font-mono">SchoolDataProvider</code> abstraction. Multiple data sources supported without changing parent voice logic.
          </p>
        </div>

        {health && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                health.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <div className="text-xs">
              <span className="font-bold text-white block capitalize">{health.status} ({health.latencyMs}ms)</span>
              <span className="text-[10px] text-slate-400 font-medium">{health.details}</span>
            </div>
          </div>
        )}
      </div>

      {/* 1. SELECT DATA PROVIDER IMPLEMENTATION */}
      <div>
        <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>1. Select Active Data Provider</span>
          <span className="text-[10px] font-bold text-slate-400 font-mono">(SchoolDataProvider Interface)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {providerCards.map((card) => {
            const isSelected = activeProviderType === card.type;
            return (
              <div
                key={card.type}
                onClick={() => handleSwitchProvider(card.type)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-orange-500/80 shadow-lg ring-1 ring-orange-500/30'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                        {card.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{card.title}</h4>
                        <span className="text-[11px] text-slate-400 font-semibold">{card.subtitle}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.tagColor}`}>
                      {card.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{card.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">
                    Type: <strong className="text-slate-200">{card.type}</strong>
                  </span>
                  <button
                    className={`px-3 py-1 rounded-xl font-bold transition-all text-xs ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
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
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-400" />
              <span>2. REST API Contract Explorer & Live Sandbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute live GET requests against the defined contract:
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
            Tenant: <strong className="text-orange-400">sch-demo</strong> | Student: <strong className="text-orange-400">std-01 (Rohan)</strong>
          </span>
        </div>

        {/* Endpoint Selector & Execution Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-white focus:outline-none focus:border-orange-500"
          >
            <option value="homework">GET /students/:studentId/homework (Active Homework)</option>
            <option value="exams">GET /students/:studentId/exams (Exam Datesheet)</option>
            <option value="attendance">GET /students/:studentId/attendance (Attendance Record)</option>
            <option value="progress">GET /students/:studentId/progress (Report Card & Grades)</option>
            <option value="timetable">GET /students/:studentId/timetable (Periods Schedule)</option>
            <option value="announcements">GET /students/:studentId/announcements (Circulars)</option>
            <option value="student">GET /students/:studentId (Student Profile)</option>
            <option value="holidays">GET /school/holidays (Holiday Calendar)</option>
          </select>

          <button
            onClick={handleRunSandbox}
            disabled={isLoadingSandbox}
            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
          >
            {isLoadingSandbox ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Execute Request</span>
          </button>
        </div>

        {/* Live Payload Preview */}
        {sandboxResponse && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2 font-mono text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  HTTP {sandboxResponse.status} {sandboxResponse.statusText}
                </span>
                <span>Active Provider: <strong className="text-white">{activeProviderType}</strong></span>
              </div>
              <span>Headers: X-School-ID: sch-demo</span>
            </div>

            <pre className="text-slate-300 overflow-x-auto max-h-56 p-2 rounded-xl bg-slate-900/60 leading-relaxed text-[11px]">
              {JSON.stringify(sandboxResponse.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 3. REAL-TIME WEBHOOK INGESTION ENGINE */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>3. Real-Time Webhook Simulator (School ERP ➔ SchoolSathi ➔ Parent AI)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test immediate data delivery when school ERP emits real-time events. Parent AI instantly responds with the updated data.
          </p>
        </div>

        {/* Event Trigger Buttons */}
        <div className="flex flex-wrap gap-2">
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <span>{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Webhook Deliveries */}
        {webhookLog.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Recent Webhook Ingestions (HMAC Verified):
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {webhookLog.map((log, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(log.processedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. SECURITY & AUDIT TRAIL MONITOR */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>4. Security & Audit Logging (SLAC & Multi-School Isolation)</span>
          </h3>
          <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Zero Cross-School Leakage Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Actor</th>
                <th className="pb-2">School Tenant</th>
                <th className="pb-2">Action</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2 text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2 text-white font-bold">{log.actorId} ({log.actorRole})</td>
                  <td className="py-2 text-orange-400">{log.schoolId}</td>
                  <td className="py-2">{log.action}</td>
                  <td className="py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'allowed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.status.toUpperCase()}
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
