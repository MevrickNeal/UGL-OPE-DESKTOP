import React, { useState } from 'react';
import { Wind, CheckCircle2, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import { appendAuditLog } from '../../utils/auditLogger';

const AirPurgingPage = () => {
  const project = useProjectStore(state => state.project);
  const updateProject = useProjectStore(state => state.updateProject);

  const [checklist, setChecklist] = useState({
    valveClosed: project?.purgeChecklist?.valveClosed || false,
    rigConnected: project?.purgeChecklist?.rigConnected || false,
    flushedFurthest: project?.purgeChecklist?.flushedFurthest || false,
    purgedClean: project?.purgeChecklist?.purgedClean || false
  });

  const isPurged = project?.airPurged || false;

  const toggleItem = (key) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    updateProject({ purgeChecklist: updated });
  };

  const handleConfirmPurge = () => {
    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      alert('Please complete all 4 purging checklist steps before confirming system purge.');
      return;
    }

    updateProject({ airPurged: true, airPurgedAt: Date.now() });
    appendAuditLog(project, 'AIR_PURGING_CONFIRMED', {
      furthestPoint: 'Manifold 1 / Furthest Riser',
      timestamp: new Date().toISOString()
    });
    alert('System air purging confirmed! System is now ready for LPG introduction and meter commissioning.');
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-[#F8F9FA] flex flex-col font-inter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-600 p-2.5 rounded-xl text-white shadow-md">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">
              AIR PURGING & FLUSHING PROCEDURE
            </h1>
            <p className="text-slate-500 text-xs md:text-sm">
              Mandatory Purging Step Before Introducing LPG & Final Meter Commissioning
            </p>
          </div>
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg rounded-2xl p-6 md:p-8 space-y-6">
        {/* Status Indicator */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isPurged 
            ? 'bg-[#D5EBD7] border-[#B1D8B4] text-[#166534]' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            {isPurged ? <CheckCircle2 className="w-6 h-6 text-[#166534]" /> : <ShieldAlert className="w-6 h-6 text-amber-600" />}
            <div>
              <h3 className="font-outfit font-bold text-base">
                {isPurged ? 'System Air Purging & Flushing Completed' : 'Air Purging Required Before LPG Introduction'}
              </h3>
              <p className="text-xs opacity-90">
                {isPurged 
                  ? `Purged and verified at furthest point (Manifold 1) on ${new Date(project.airPurgedAt || Date.now()).toLocaleString()}` 
                  : 'Purge all trapped air and dust particles out from the furthest riser manifold.'}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Procedure Instructions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Standard Flushing Protocol
          </h3>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs md:text-sm text-slate-700 space-y-2">
            <p>1. Ensure cylinder manifold valves (Bank A & B) are fully shut and isolated.</p>
            <p>2. Connect dry oil-free compressed air/nitrogen purge assembly at the primary riser inlet.</p>
            <p>3. Open vent valve at the <strong>furthest manifold point (Manifold 1 / furthest riser branch)</strong>.</p>
            <p>4. Flush high-velocity air for 10–15 minutes until zero dust/particles remain, then seal vent valve.</p>
          </div>
        </div>

        {/* Interactive Purging Checklist */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Safety Sign-off Checklist
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors btn-press">
              <input 
                type="checkbox"
                checked={checklist.valveClosed}
                onChange={() => toggleItem('valveClosed')}
                className="w-5 h-5 accent-[#F15A24] rounded"
              />
              <span className="text-sm font-medium text-slate-800">
                Main LPG storage manifolds & regulator isolation valves verified CLOSED.
              </span>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors btn-press">
              <input 
                type="checkbox"
                checked={checklist.rigConnected}
                onChange={() => toggleItem('rigConnected')}
                className="w-5 h-5 accent-[#F15A24] rounded"
              />
              <span className="text-sm font-medium text-slate-800">
                Purging hose connected and secured to the furthest manifold vent point.
              </span>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors btn-press">
              <input 
                type="checkbox"
                checked={checklist.flushedFurthest}
                onChange={() => toggleItem('flushedFurthest')}
                className="w-5 h-5 accent-[#F15A24] rounded"
              />
              <span className="text-sm font-medium text-slate-800">
                Continuous high-velocity air flushed out from the furthest manifold riser.
              </span>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors btn-press">
              <input 
                type="checkbox"
                checked={checklist.purgedClean}
                onChange={() => toggleItem('purgedClean')}
                className="w-5 h-5 accent-[#F15A24] rounded"
              />
              <span className="text-sm font-medium text-slate-800">
                Discharge verified clean & clear of moisture, dust, or pipe scale. Vent sealed.
              </span>
            </label>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleConfirmPurge}
            className="px-6 py-3 bg-[#F15A24] hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2 btn-press cursor-pointer"
          >
            <span>Confirm Air Flushing Complete</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirPurgingPage;
