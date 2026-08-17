import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, LayoutGrid, User, Building } from 'lucide-react';

const ProjectSetupWizard = ({ onComplete, onCancel, isPreset }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    areaName: isPreset ? 'RUAP, UTTARA - 18, DHAKA' : '',
    buildingName: isPreset ? 'SHAPLA BUILDING 13B' : '',
    manifolds: isPreset ? 6 : 1,
    flatsPerManifold: isPreset ? 14 : 14,
    manifoldNamesInput: isPreset ? '1, 2, 3, 4, 5, 6' : '1',
    inspectorName: 'LIAN MOLLIK',
    inspectorDesignation: 'TECH CO-ORDINATOR',
    witnessName: '',
    ambientTemp: '28'
  });

  const [activeFlats, setActiveFlats] = useState({});

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onComplete({ ...formData, activeFlats });
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onCancel();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'manifolds') {
      const count = Math.max(1, parseInt(value) || 1);
      const autoNames = Array.from({ length: count }, (_, i) => i + 1).join(', ');
      setFormData(prev => ({
        ...prev,
        manifolds: value,
        manifoldNamesInput: autoNames
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header & Progress */}
        <div className="px-8 pt-8 pb-4 border-b border-slate-100">
          <h2 className="text-2xl font-outfit font-bold text-slate-800">
            {isPreset ? 'RUAP Preset Setup' : 'New Project Setup'}
          </h2>
          <div className="flex items-center gap-2 mt-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <React.Fragment key={i}>
                <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  step >= i + 1 ? 'bg-orange-500' : 'bg-slate-100'
                }`} />
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Location</span>
            <span>Structure</span>
            <span>Flats</span>
            <span>Details</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-right">
              <div className="flex items-center gap-3 text-slate-800 mb-6 font-outfit text-xl font-medium">
                <Building className="h-6 w-6 text-orange-500" />
                Project Location & Identifiers
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Area Name / Address</label>
                <input 
                  type="text" name="areaName" value={formData.areaName} onChange={handleChange}
                  placeholder="e.g. RUAP, Uttara 18, Dhaka"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Building Name & Sector</label>
                <input 
                  type="text" name="buildingName" value={formData.buildingName} onChange={handleChange}
                  placeholder="e.g. SHAPLA BUILDING 13B"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in-right">
              <div className="flex items-center gap-3 text-slate-800 mb-6 font-outfit text-xl font-medium">
                <LayoutGrid className="h-6 w-6 text-orange-500" />
                Metering Manifolds & Floor Setup
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Number of Manifolds</label>
                  <input 
                    type="number" name="manifolds" value={formData.manifolds} onChange={handleChange} min="1" max="20"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Flats per Manifold</label>
                  <input 
                    type="number" name="flatsPerManifold" value={formData.flatsPerManifold} onChange={handleChange} min="1" max="50"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Manifold Names / Labels (comma separated)</label>
                <input 
                  type="text" name="manifoldNamesInput" value={formData.manifoldNamesInput} onChange={handleChange}
                  placeholder="e.g. 1, 2, 3, 4, 5, 6"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in-right">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-outfit text-xl font-medium text-slate-800">Active Customer Flat Selection</h3>
                  <p className="text-slate-500 text-xs mt-1">Select which customer flats are active for commissioning.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allActive = {};
                      const count = parseInt(formData.manifolds) || 6;
                      const fPerM = parseInt(formData.flatsPerManifold) || 14;
                      for (let s = 1; s <= count; s++) {
                        for (let f = 1; f <= fPerM; f++) {
                          const flatNum = `${f}${s < 10 ? '0' : ''}${s}`;
                          allActive[flatNum] = true;
                        }
                      }
                      setActiveFlats(allActive);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors btn-press cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const allInactive = {};
                      const count = parseInt(formData.manifolds) || 6;
                      const fPerM = parseInt(formData.flatsPerManifold) || 14;
                      for (let s = 1; s <= count; s++) {
                        for (let f = 1; f <= fPerM; f++) {
                          const flatNum = `${f}${s < 10 ? '0' : ''}${s}`;
                          allInactive[flatNum] = false;
                        }
                      }
                      setActiveFlats(allInactive);
                    }}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors btn-press cursor-pointer"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Grid of Flat Selection Pills */}
              <div className="max-h-[340px] overflow-y-auto pr-2 space-y-4">
                {Array.from({ length: formData.manifolds || 6 }).map((_, mIdx) => {
                  const seriesNum = mIdx + 1;
                  return (
                    <div key={seriesNum} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Manifold Series {seriesNum}</h4>
                      <div className="grid grid-cols-7 sm:grid-cols-7 gap-1.5">
                        {Array.from({ length: formData.flatsPerManifold || 14 }).map((_, fIdx) => {
                          const floor = fIdx + 1;
                          const flatNum = `${floor}${seriesNum < 10 ? '0' : ''}${seriesNum}`;
                          const isActive = activeFlats[flatNum] !== false; // default active
                          return (
                            <button
                              key={flatNum}
                              type="button"
                              onClick={() => {
                                setActiveFlats(prev => ({
                                  ...prev,
                                  [flatNum]: !isActive
                                }));
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all btn-press ${
                                isActive
                                  ? 'bg-[#D5EBD7] text-[#166534] border border-[#B1D8B4]'
                                  : 'bg-[#FBDCD3] text-[#991b1b] border border-[#F6AB8F]'
                              }`}
                            >
                              {flatNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in-right">
              <div className="flex items-center gap-3 text-slate-800 mb-6 font-outfit text-xl font-medium">
                <User className="h-6 w-6 text-orange-500" />
                Testing Signatories & Details
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Inspector Full Name</label>
                <input 
                  type="text" name="inspectorName" value={formData.inspectorName} onChange={handleChange}
                  placeholder="e.g. LIAN MOLLIK"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Inspector Official Designation (Urban Gaz)</label>
                <input 
                  type="text" name="inspectorDesignation" value={formData.inspectorDesignation} onChange={handleChange}
                  placeholder="e.g. TECH CO-ORDINATOR, Lead Engineer, Quality Manager"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Witness Full Name (Optional)</label>
                <input 
                  type="text" name="witnessName" value={formData.witnessName} onChange={handleChange}
                  placeholder="e.g. CLIENT WITNESS / ENG. ABDUL HASAN"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Ambient Temperature (°C)</label>
                <input 
                  type="number" name="ambientTemp" value={formData.ambientTemp} onChange={handleChange}
                  placeholder="28"
                  className="w-32 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-semibold text-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button 
            onClick={handleBack}
            className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-200/50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer btn-press"
          >
            <ChevronLeft className="h-5 w-5" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={handleNext}
            className="px-8 py-3 bg-[#F15A24] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer btn-press"
          >
            {step === totalSteps ? 'Complete & Start Project' : 'Next Step'}
            {step === totalSteps ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectSetupWizard;
