import React, { useState, useEffect, useRef } from 'react';
import { Database, Download, Upload, FileText, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import { getAuditLogs, exportAuditLogsToFile, exportDatabaseBackup, importDatabaseBackup } from '../../utils/auditLogger';

const DatabaseLogsPage = () => {
  const project = useProjectStore(state => state.project);
  const loadProjectList = useProjectStore(state => state.loadProjectList);
  const loadProject = useProjectStore(state => state.loadProject);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const fetchLogs = async () => {
    if (!project || !project.id) return;
    setLoading(true);
    const data = await getAuditLogs(project.id);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [project?.id]);

  const handleExportLogs = () => {
    exportAuditLogsToFile(project, logs);
  };

  const handleExportBackup = () => {
    exportDatabaseBackup(project, logs);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (content) {
        const res = await importDatabaseBackup(content, { loadProjectList, loadProject });
        if (res.success) {
          setImportStatus({ type: 'success', message: `Database loaded successfully for ${res.project.areaName}` });
          fetchLogs();
        } else {
          setImportStatus({ type: 'error', message: res.error || 'Failed to load database' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#F8F9FA] flex flex-col font-inter space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#0D6B6E] p-2.5 rounded-xl text-white shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">
              LOGS & DATABASE MANAGEMENT
            </h1>
            <p className="text-slate-500 text-xs md:text-sm">
              Real-time Entry Logging, Backup Exports, and Database Import System
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportLogs}
            className="btn-press px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#F15A24]" />
            Export LOGS (.json)
          </button>

          <button
            onClick={handleExportBackup}
            className="btn-press px-4 py-2 bg-[#F15A24] hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download DB Backup (.json)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-press px-4 py-2 bg-[#0D6B6E] hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Load / Restore Database
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold ${
          importStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {importStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{importStatus.message}</span>
          </div>
          <button onClick={() => setImportStatus(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Real-time Logs List Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="font-outfit text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>Audit Entry Log History</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-mono font-normal">
              {logs.length} entries recorded
            </span>
          </h3>
          <button 
            onClick={fetchLogs} 
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading log database...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No audit log entries recorded yet. Test actions will auto-save entry logs here.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Inspector</th>
                  <th className="py-2.5 px-3">Entry Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {log.formattedTime || log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#F15A24]">
                      {log.actionType}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {log.inspectorName || 'Engineer'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseLogsPage;
