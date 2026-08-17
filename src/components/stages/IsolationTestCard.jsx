import React, { useEffect, useState } from 'react';
import { Play, Square, RotateCcw, CheckCircle2, XCircle, Clock, Settings2 } from 'lucide-react';
import { useTimer } from '../../utils/timerEngine';
import { playChime, showNotification } from '../../utils/audioAlert';

const IsolationTestCard = ({ 
  testKey, 
  title, 
  subtitle, 
  testMedium, 
  targetPressure: defaultTargetPressure = '8.0 kg/cm²', 
  duration: defaultDurationMs = 7200000, 
  testData = {}, 
  onUpdate 
}) => {
  // Custom configurable duration in minutes (default 120 mins = 2 hours)
  const storedDurationMins = testData.durationMins !== undefined ? testData.durationMins : Math.round(defaultDurationMs / 60000);
  const currentDurationMs = (storedDurationMins || 120) * 60000;

  // Custom configurable target pressure
  const targetPressure = testData.targetPressure || defaultTargetPressure;

  const { timeRemainingFormatted, timeRemainingMs, progress, isRunning, isComplete, start, stop, reset } = useTimer(testKey, currentDurationMs);
  
  const { startPressure = '', endPressure = '', inletPressure = '', outletPressure = '' } = testData;

  useEffect(() => {
    if (isComplete) {
      playChime('2hour');
      showNotification('Test Complete', `${title} isolation test has finished.`);
      if (onUpdate && testData.status !== 'complete') {
        onUpdate(testKey, { status: 'complete' });
      }
    }
  }, [isComplete, title, testKey, onUpdate, testData.status]);

  useEffect(() => {
    if (isRunning && testData.status !== 'running') {
      onUpdate(testKey, { status: 'running' });
    }
  }, [isRunning, testKey, onUpdate, testData.status]);

  let status = 'Pending';
  let badgeClass = 'badge-pending';
  let badgeIcon = <Clock className="w-4 h-4 mr-1" />;

  if (isRunning) {
    status = 'TESTING...';
    badgeClass = 'badge-running';
  } else if (isComplete || (startPressure !== '' && endPressure !== '')) {
    const sPress = parseFloat(startPressure);
    const ePress = parseFloat(endPressure);
    
    if (!isNaN(sPress) && !isNaN(ePress)) {
      if (ePress >= sPress) {
        status = 'PASS ✓';
        badgeClass = 'badge-pass';
        badgeIcon = <CheckCircle2 className="w-4 h-4 mr-1" />;
      } else {
        status = 'FAIL ✗';
        badgeClass = 'badge-fail';
        badgeIcon = <XCircle className="w-4 h-4 mr-1" />;
      }
    }
  }

  const handleInputChange = (field, value) => {
    onUpdate(testKey, { [field]: value });
  };

  const handleDurationChange = (e) => {
    const mins = parseInt(e.target.value) || 1;
    onUpdate(testKey, { durationMins: mins });
    reset();
  };

  const isRegulator = title.toLowerCase().includes('regulator');

  return (
    <div className="mac-glass interactive-card rounded-2xl p-6 border border-slate-200 relative overflow-hidden flex flex-col h-full bg-white/80 backdrop-blur-xl shadow-md">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-outfit text-xl font-bold text-slate-800 leading-tight">{title}</h3>
          {subtitle && <p className="font-inter text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider ${badgeClass}`}>
          {badgeIcon} {status}
        </div>
      </div>

      {/* Manual Controls Bar: Medium, Target Pressure, & Duration Mins */}
      <div className="bg-slate-50 rounded-xl p-3 mb-5 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5 text-[#F15A24]" /> Manual Setup Controls:</span>
          <span className="text-[#0D6B6E] font-bold">Medium: {testMedium || 'Air'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Pressure</label>
            <input 
              type="text" 
              value={targetPressure}
              onChange={(e) => handleInputChange('targetPressure', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-[#F15A24] outline-none"
              placeholder="e.g. 8.0 kg/cm²"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Test Time (Minutes)</label>
            <input 
              type="number" 
              min="1"
              max="1440"
              value={storedDurationMins}
              onChange={handleDurationChange}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-[#F15A24] outline-none font-mono"
              placeholder="120"
            />
          </div>
        </div>
      </div>

      {/* Timer Circular Ring */}
      <div className="flex-grow flex flex-col items-center justify-center mb-6">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0">
            <circle cx="88" cy="88" r="80" className="stroke-slate-100" strokeWidth="8" fill="none" />
            <circle 
              cx="88" 
              cy="88" 
              r="80" 
              className={`stroke-current ${isRunning ? 'text-[#F15A24]' : isComplete ? 'text-[#22C55E]' : 'text-slate-300'} transition-all duration-1000 ease-linear`}
              strokeWidth="8" 
              fill="none" 
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={2 * Math.PI * 80 * (1 - (progress || 0))}
            />
          </svg>
          <div className="text-center z-10">
            <div className="timer-display text-3xl font-mono font-extrabold text-slate-800 tracking-wider">
              {timeRemainingFormatted}
            </div>
            <div className="font-inter text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
              {storedDurationMins} MINS TARGET
            </div>
          </div>
        </div>
      </div>

      {/* Pressure Inputs Section */}
      <div className="grid grid-cols-2 gap-4 mb-6 font-inter">
        {isRegulator ? (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Inlet Pressure</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  value={inletPressure}
                  onChange={(e) => handleInputChange('inletPressure', e.target.value)}
                  className="input-field w-full text-sm font-mono font-bold px-3 py-2 border rounded-xl"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg/cm²</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Outlet Pressure</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  value={outletPressure}
                  onChange={(e) => handleInputChange('outletPressure', e.target.value)}
                  className="input-field w-full text-sm font-mono font-bold px-3 py-2 border rounded-xl"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg/cm²</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Start Pressure</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  value={startPressure}
                  onChange={(e) => handleInputChange('startPressure', e.target.value)}
                  className="input-field w-full text-sm font-mono font-bold px-3 py-2 border rounded-xl"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg/cm²</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">End Pressure</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.1"
                  value={endPressure}
                  onChange={(e) => handleInputChange('endPressure', e.target.value)}
                  className="input-field w-full text-sm font-mono font-bold px-3 py-2 border rounded-xl"
                  placeholder="0.0"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">kg/cm²</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-auto font-inter">
        {!isRunning ? (
          <button 
            onClick={start}
            className="btn-press flex-1 bg-[#0D6B6E] hover:bg-teal-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4" /> {timeRemainingMs < currentDurationMs ? 'Resume Timer' : 'Start Timer'}
          </button>
        ) : (
          <button 
            onClick={stop}
            className="btn-press flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Square className="w-4 h-4" /> Stop Timer
          </button>
        )}
        <button 
          onClick={reset}
          className="btn-press bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default IsolationTestCard;
