import React, { useState, useRef } from 'react';
import { Plus, FolderOpen, Play, Calendar, MapPin, Building2, Download, Upload, Trash2, Layers, CheckCircle2, AlertCircle, Shield, User, LogOut } from 'lucide-react';
import { exportDatabaseBackup, importDatabaseBackup } from '../utils/auditLogger';
import localforage from 'localforage';
import useAuthStore from '../store/useAuthStore';

const ProjectSelector = ({ onNewProject, onOpenProject, onRuapPreset, projects = [], onDeleteProject, onReloadProjects }) => {
  const [showSavedList, setShowSavedList] = useState(true);
  const [importStatus, setImportStatus] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const { user, isAdmin, profile, signOut } = useAuthStore();

  const handleExportProject = async (projId) => {
    const projectData = await localforage.getItem('ugl_project_' + projId);
    if (projectData) {
      exportDatabaseBackup(projectData, []);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Loading project file...');
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (content) {
        const res = await importDatabaseBackup(content, { 
          loadProjectList: onReloadProjects, 
          loadProject: onOpenProject 
        });
        if (res.success) {
          setImportStatus(`Successfully loaded project: ${res.project.areaName || 'Site Project'} ${res.project.buildingName ? `(${res.project.buildingName})` : ''}`);
          if (onReloadProjects) await onReloadProjects();
          if (onOpenProject) onOpenProject(res.project.id);
        } else {
          setImportError(`Failed to load file: ${res.error}`);
          setImportStatus(null);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] font-inter overflow-y-auto">
      <div className="max-w-5xl w-full mx-auto space-y-6 py-6 px-4 md:px-8 pb-24">
        
        {/* Top User Account & Sign Out Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl p-3.5 px-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D6B6E] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.email || 'Logged In User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAdmin ? (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-700" /> ADMIN (Company-Wide Access)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-teal-50 text-[#0D6B6E] border border-teal-200 px-2 py-0.2 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3" /> INSPECTOR (Personal Account)
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer btn-press shadow-sm"
            title="Sign out of current inspector account"
          >
            <LogOut className="w-3.5 h-3.5 text-red-600" />
            <span>Sign Out / Log Out</span>
          </button>
        </div>

        {/* Official Urban Gaz Web Logo & Branding Header */}
        <header className="flex flex-col items-center text-center pt-2 pb-2 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="/logo-square.png" 
              alt="Urban Gaz Limited Logo" 
              className="h-14 w-14 md:h-16 md:w-16 object-contain drop-shadow-md" 
            />
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-outfit font-extrabold text-slate-900 tracking-wider">
                URBAN GAZ LIMITED
              </h1>
              <p className="text-xs font-bold text-[#F15A24] tracking-widest uppercase">
                Commissioning & Testing Platform
              </p>
            </div>
          </div>
        </header>

        {/* Import Status Alert Banner */}
        {importStatus && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
            <button onClick={() => setImportStatus(null)} className="underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Import Error Alert Banner */}
        {importError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{importError}</span>
            </div>
            <button onClick={() => setImportError(null)} className="underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Primary Action Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card 1: New Custom Project */}
          <button 
            onClick={onNewProject}
            className="group p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-md hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col items-center text-center interactive-card cursor-pointer"
          >
            <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
              <Plus className="h-8 w-8 text-[#F15A24]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1 font-outfit">New Custom Site Project</h2>
            <p className="text-slate-500 text-xs">Configure custom area names, manifold counts, floor structures, and active customer flats.</p>
            <span className="mt-4 px-5 py-2.5 bg-[#F15A24] text-white text-xs font-bold rounded-xl shadow-sm btn-press">
              Launch Custom Setup Wizard
            </span>
          </button>

          {/* Card 2: Open Saved Projects & Files */}
          <button 
            onClick={() => setShowSavedList(prev => !prev)}
            className="group p-6 md:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-md hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col items-center text-center interactive-card cursor-pointer"
          >
            <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
              <FolderOpen className="h-8 w-8 text-[#0D6B6E]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1 font-outfit">Open Saved Files & Sites ({projects.length})</h2>
            <p className="text-slate-500 text-xs">Load previous site data or import `.ugl` / `.json` project files from disk.</p>
            <span className="mt-4 px-5 py-2.5 bg-[#0D6B6E] text-white text-xs font-bold rounded-xl shadow-sm btn-press">
              {showSavedList ? 'Hide Saved Projects' : 'View Saved Projects'}
            </span>
          </button>
        </div>

        {/* Quick Start Preset Banner: RUAP */}
        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 md:p-8 text-white shadow-lg shadow-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                Quick Preset
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-outfit">RUAP</h3>
            <p className="text-orange-50 text-xs md:text-sm opacity-90 mt-1">
              6 Metering Manifolds (1–6) · 14 Meters per Manifold · Total 84 Customer Flats (101–1406)
            </p>
          </div>
          <button 
            onClick={onRuapPreset}
            className="whitespace-nowrap px-6 py-3 bg-white text-[#F15A24] rounded-2xl font-bold hover:bg-orange-50 transition-colors shadow-md flex items-center gap-2 w-full md:w-auto justify-center btn-press cursor-pointer text-sm"
          >
            <Play className="h-5 w-5 fill-current" />
            Launch RUAP Preset
          </button>
        </div>

        {/* Saved Projects List & File Imploader */}
        {(showSavedList || projects.length > 0) && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-800">Saved Projects & Data Files</h3>
                <p className="text-slate-500 text-xs">Open previous project files or load standalone `.ugl` / `.json` files from disk.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-[#0D6B6E] hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer btn-press"
                >
                  <Upload className="w-4 h-4" />
                  Load Saved File (.ugl / .json)
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileImport} 
                  accept=".json,.ugl" 
                  className="hidden" 
                />
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <p className="font-semibold text-slate-600">No saved projects found in local browser storage.</p>
                <p>Click "Load Saved File (.ugl / .json)" to open any saved file from your "Saved sites" folder.</p>
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto pr-2 space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-200 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shrink-0">
                        <Building2 className="h-5 w-5 text-[#F15A24]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm">{proj.name || 'Project'}</h4>
                          {proj.inspector && (
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                              By: {proj.inspector}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          <span>{proj.building ? `Building: ${proj.building}` : 'Site Project'}</span>
                          <span>·</span>
                          <span>Updated: {proj.updatedAt ? new Date(proj.updatedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button 
                        onClick={() => handleExportProject(proj.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors btn-press cursor-pointer flex items-center gap-1"
                        title="Export Project File"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0D6B6E]" />
                        Export
                      </button>

                      {onDeleteProject && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`Delete project "${proj.name}"?`)) {
                              onDeleteProject(proj.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors btn-press cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button 
                        onClick={() => onOpenProject(proj.id)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#0D6B6E] hover:bg-teal-700 rounded-xl transition-colors btn-press cursor-pointer shadow-sm"
                      >
                        Open Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-200">
        Urban Gaz Limited · LPG Reticulated Systems & Commissioning Platform
      </footer>
    </div>
  );
};

export default ProjectSelector;
