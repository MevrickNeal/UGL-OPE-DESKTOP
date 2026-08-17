import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Wind,
  RefreshCw,
  Gauge, 
  FileSpreadsheet, 
  Database,
  Menu, 
  X,
  Thermometer,
  Save,
  CheckCircle2,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';
import useAuthStore from '../store/useAuthStore';
import localforage from 'localforage';
import { exportAuditLogsToCSV } from '../utils/auditLogger';

const Dashboard = ({ project, activeSection, onNavigate, onBackToProjects, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { signOut, user } = useAuthStore();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'isolation', label: 'Stages 1-4: Isolation Tests', icon: ShieldCheck },
    { id: 'vertical-air', label: 'Stage 5: Vertical Air Test', icon: Wind },
    { id: 'purging', label: 'Stage 6: Air Purging', icon: RefreshCw },
    { id: 'meters', label: 'Stage 7: LPG Commissioning', icon: Gauge },
    { id: 'reports', label: 'Reports & Certificates', icon: FileSpreadsheet },
    { id: 'database', label: 'Logs & DB Backup', icon: Database },
  ];

  const handleNav = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
    setSidebarOpen(false);
  };

  const handleManualSaveProgress = async () => {
    const currentProj = useProjectStore.getState().project;
    if (currentProj && currentProj.id) {
      const now = Date.now();
      const updated = { ...currentProj, updatedAt: now };
      await localforage.setItem('ugl_active_project', updated);
      await localforage.setItem('ugl_project_' + currentProj.id, updated);
      if (typeof useProjectStore.getState().loadProjectList === 'function') {
        useProjectStore.getState().loadProjectList();
      }
      
      // Auto export CSV audit log file
      exportAuditLogsToCSV(updated);

      const timeStr = new Date().toLocaleTimeString();
      setSaveSuccessMsg(`Progress Saved & CSV Audit Log Exported (${timeStr})`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-inter">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 
        bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100 shrink-0">
          <img src="/logo-square.png" alt="Logo" className="h-10 w-10 mr-3 object-contain" />
          <div>
            <h1 className="font-outfit font-bold text-slate-800 leading-tight">UGL OPE</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#F15A24] font-bold">Commissioning App</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center px-3.5 py-3 rounded-xl transition-all font-medium text-xs md:text-sm cursor-pointer ${
                  isActive 
                    ? 'bg-[#D5EBD7] text-[#0D6B6E] shadow-sm font-bold border-l-4 border-[#0D6B6E] pl-3' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 h-4 md:h-5 md:w-5 mr-3 ${isActive ? 'text-[#0D6B6E]' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Project Info */}
        <div className="p-4 mt-auto space-y-2">
          <button
            onClick={handleManualSaveProgress}
            className="w-full py-2.5 px-3 bg-[#0D6B6E] hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md btn-press cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Project Progress</span>
          </button>

          <div className="bg-slate-100/60 rounded-2xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Site</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                isOnline ? 'bg-[#D5EBD7] text-[#166534] border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isOnline ? 'ONLINE SYNC' : 'OFFLINE MODE'}
              </span>
            </div>
            <p className="font-outfit font-bold text-slate-800 text-sm truncate">{project?.areaName || 'RUAP'}</p>
            <p className="text-xs text-slate-500 truncate">{project?.buildingName || 'Building'}</p>
            {user?.email && (
              <p className="text-[10px] font-semibold text-slate-500 truncate pt-1 border-t border-slate-200/60">
                User: <span className="text-slate-700">{user.email}</span>
              </p>
            )}
            {onBackToProjects && (
              <button
                onClick={onBackToProjects}
                className="w-full text-xs font-bold text-[#F15A24] bg-orange-50 hover:bg-orange-100 border border-orange-200 py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 btn-press cursor-pointer"
              >
                <span>Switch / Setup Project</span>
              </button>
            )}
            {signOut && (
              <button
                onClick={signOut}
                className="w-full text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-outfit font-bold text-slate-800">
                {project?.areaName || 'RUAP'} {project?.buildingName ? `— ${project.buildingName}` : ''}
              </h2>
              <p className="text-xs text-slate-500 font-medium capitalize">
                {navItems.find(i => i.id === activeSection)?.label || activeSection}
              </p>
            </div>
          </div>

          {/* Right Header Bar */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Save Progress Button Header */}
            <button
              onClick={handleManualSaveProgress}
              className="px-3.5 py-2 bg-[#0D6B6E] hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm btn-press cursor-pointer"
              title="Save all current test readings and progress"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Save Progress</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl border border-orange-200">
              <Thermometer className="h-4 w-4 text-[#F15A24]" />
              <span className="text-xs font-bold">{project?.ambientTemp || '32'} °C</span>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{project?.inspectorName || 'Inspector'}</p>
              <p className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[#0D6B6E] flex items-center justify-center text-white font-bold text-xs shadow-md">
              {(project?.inspectorName || 'I').charAt(0)}
            </div>

            {/* Sign Out Button Header */}
            {signOut && (
              <button
                onClick={signOut}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                title="Sign Out of Supabase Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Save Toast Notification Banner */}
        {saveSuccessMsg && (
          <div className="absolute top-22 right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg font-bold text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};

export default Dashboard;
