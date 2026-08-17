import React, { useEffect, useState } from 'react';
import { Play, Square, Check, AlertTriangle, Flame, ShieldAlert, DollarSign, Clock, FastForward } from 'lucide-react';
import { useTimer } from '../../utils/timerEngine';
import { formatTime, calculateDelta } from '../../utils/helpers';
import { playChime, showNotification } from '../../utils/audioAlert';

const MeterFlatCard = ({ flatNumber, testData = {}, flatConfig = {}, lpgRate = 150, onUpdate }) => {
  const isActive = flatConfig.active !== false;

  const isStabDone = testData.stabComplete === true;
  const isHoldDone = testData.holdComplete === true;

  const {
    timeRemaining: stabTime,
    isRunning: stabRunning,
    isComplete: timerStabComplete,
    start: startStab,
    stop: stopStab
  } = useTimer(`stab_${flatNumber}`, 900000); // 15 mins

  const {
    timeRemaining: holdTime,
    isRunning: holdRunning,
    isComplete: timerHoldComplete,
    start: startHold,
    stop: stopHold
  } = useTimer(`hold_${flatNumber}`, 7200000); // 2 hours max

  // Track custom test duration if stopped early
  const [testStartTime, setTestStartTime] = useState(testData.testStartTime || null);

  useEffect(() => {
    if (timerStabComplete && !testData.stabComplete) {
      playChime('15min');
      showNotification('Stabilization Complete', `Flat ${flatNumber} is ready for initial LPG reading.`);
      onUpdate(flatNumber, { stabComplete: true, stabCompleteNotified: true });
    }
  }, [timerStabComplete, flatNumber, onUpdate, testData.stabComplete]);

  useEffect(() => {
    if (timerHoldComplete && !testData.holdComplete) {
      playChime('2hour');
      showNotification('LPG Hold Test Complete', `Flat ${flatNumber} completed 2-hour study.`);
      onUpdate(flatNumber, { holdComplete: true, holdCompleteNotified: true, testDurationMinutes: 120 });
    }
  }, [timerHoldComplete, flatNumber, onUpdate, testData.holdComplete]);

  if (!isActive) {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200 opacity-60 flex flex-col h-full font-inter">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-outfit text-2xl font-bold text-slate-400">{flatNumber}</h3>
          <span className="badge-inactive">INACTIVE</span>
        </div>
        <div className="flex-grow flex items-center justify-center text-xs text-slate-400">
          Inactive Flat — Skipped in LPG Commissioning
        </div>
      </div>
    );
  }

  const handleStartHold = () => {
    const now = Date.now();
    setTestStartTime(now);
    onUpdate(flatNumber, { testStartTime: now });
    startHold();
  };

  const handleStopHoldEarly = () => {
    stopHold();
    const elapsedMs = testStartTime ? (Date.now() - testStartTime) : (7200000 - holdTime);
    const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));
    onUpdate(flatNumber, { testDurationMinutes: elapsedMinutes, holdComplete: true, earlyStopped: true });
  };

  const handleManualStabBypass = () => {
    stopStab();
    onUpdate(flatNumber, { stabComplete: true });
  };

  const handleInitialChange = (e) => {
    onUpdate(flatNumber, { 
      initialReading: e.target.value,
      initialTime: new Date().toISOString()
    });
  };

  const handleFinalChange = (e) => {
    onUpdate(flatNumber, { 
      finalReading: e.target.value,
      finalTime: new Date().toISOString()
    });
  };

  const initial = parseFloat(testData.initialReading);
  const final = parseFloat(testData.finalReading);
  const isInvalidBackward = !isNaN(initial) && !isNaN(final) && final < initial;
  const delta = !isNaN(initial) && !isNaN(final) ? (final - initial) : null;
  
  // 40mbar low pressure tolerance: 0.001 m³
  const isPass = delta !== null && !isInvalidBackward && delta <= 0.001;
  const isFail = (delta !== null && delta > 0.001) || isInvalidBackward;

  // Financial Loss Calculations
  const testMinutes = testData.testDurationMinutes || 120;
  const positiveDelta = delta !== null ? Math.max(0, delta) : 0;
  const actualLossCost = (positiveDelta * lpgRate).toFixed(2);
  const hourlyLossVolume = testMinutes > 0 ? (positiveDelta / (testMinutes / 60)) : 0;
  const projected24hCost = (hourlyLossVolume * 24 * lpgRate).toFixed(2);
  const projected30dCost = (hourlyLossVolume * 24 * 30 * lpgRate).toFixed(2);

  return (
    <div className={`mac-glass interactive-card rounded-2xl p-4 shadow-sm border flex flex-col h-full relative font-inter ${
      isFail ? 'border-red-300 bg-red-50/20' : isPass ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
    }`}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-outfit text-xl font-bold text-slate-800">Flat {flatNumber}</h3>
            <span className="text-[10px] font-bold bg-[#D5EBD7] text-[#0D6B6E] px-2 py-0.5 rounded border border-[#B1D8B4]">
              40 mbar (LPG)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Duration: {testMinutes} mins
          </span>
        </div>
        {isPass && <span className="badge-pass text-xs px-2.5 py-1 rounded-full flex items-center"><Check className="w-3 h-3 mr-1" /> PASS</span>}
        {isFail && <span className="badge-fail text-xs px-2.5 py-1 rounded-full flex items-center animate-pulse"><AlertTriangle className="w-3 h-3 mr-1" /> LEAK</span>}
      </div>

      <div className="flex-grow space-y-3">
        {/* Step 1: 15-Min Stabilization */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1.5">
            <span className="font-bold text-[#0D6B6E]">1. 15-Min Stabilization Timer</span>
            {isStabDone ? (
              <span className="text-[#22C55E] text-[11px] flex items-center font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                <Check className="w-3 h-3 mr-0.5"/> Verified
              </span>
            ) : (
              <button 
                onClick={handleManualStabBypass}
                className="text-[10px] text-slate-500 hover:text-slate-800 underline flex items-center gap-0.5 cursor-pointer"
                title="Bypass 15-min stabilization timer if physical check already done"
              >
                <FastForward className="w-3 h-3 text-amber-600" /> Confirm Stabilized
              </button>
            )}
          </div>
          {!isStabDone && (
            <button 
              onClick={stabRunning ? stopStab : startStab}
              className={`btn-press w-full py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                stabRunning ? 'bg-[#FCE182] text-amber-900 border border-[#EAB308] animate-pulse' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              {stabRunning ? (
                <><span className="timer-display font-mono">{formatTime(stabTime)}</span> (Running)</>
              ) : (
                <><Play className="w-3 h-3 text-[#F15A24]" /> Start 15-Min Stabilization</>
              )}
            </button>
          )}
        </div>

        {/* Step 2: Initial Meter Reading */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            2. Initial LPG Meter Reading (m³)
          </label>
          <input 
            type="number"
            value={testData.initialReading || ''}
            onChange={handleInitialChange}
            className="input-field w-full text-xs font-mono font-bold"
            placeholder="0.000"
            step="0.001"
          />
        </div>

        {/* Step 3: Hold Test with Stop Button */}
        <div>
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
            <span className="font-bold text-[#F15A24]">3. 40mbar Hold Test</span>
            {isHoldDone && <span className="text-[#22C55E] text-[11px] flex items-center font-bold"><Check className="w-3 h-3 mr-0.5"/> Complete</span>}
          </div>
          {!isHoldDone && (
            <div className="flex gap-2">
              <button 
                onClick={holdRunning ? handleStopHoldEarly : handleStartHold}
                className={`btn-press flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                  holdRunning 
                    ? 'bg-[#dc2626] hover:bg-red-700 text-white shadow-md animate-pulse' 
                    : 'bg-[#F15A24] hover:bg-orange-600 text-white shadow-md'
                }`}
              >
                {holdRunning ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop Study (<span className="timer-display font-mono">{formatTime(holdTime)}</span>)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start LPG Hold Test</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Step 4: Final Meter Reading */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            4. Final LPG Meter Reading (m³)
          </label>
          <input 
            type="number"
            value={testData.finalReading || ''}
            onChange={handleFinalChange}
            className="input-field w-full text-xs font-mono font-bold"
            placeholder="0.000"
            step="0.001"
          />
        </div>

        {/* Step 5: Maintenance Remark / Comments */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>5. Maintenance Remark / Comment</span>
          </label>
          <input 
            type="text"
            value={testData.remark || ''}
            onChange={(e) => onUpdate(flatNumber, { remark: e.target.value })}
            className="input-field w-full text-xs font-medium"
            placeholder="e.g. BALL VALVE REPLACED, DIRECT LINE"
          />
        </div>
      </div>

      {/* Leak Results & Gas Loss Financial Cost Estimation Card */}
      {delta !== null && (
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
          {isInvalidBackward ? (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-xs text-red-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>INVALID READING: Meter Flows Forward Only!</span>
              </div>
              <p className="text-[11px] text-red-600">
                Final meter reading ({final}) cannot be less than initial reading ({initial}).
              </p>
            </div>
          ) : (
            <div className={`p-2.5 rounded-xl text-center border ${
              isPass ? 'bg-[#D5EBD7] border-[#B1D8B4] text-[#166534]' : 'bg-[#FBDCD3] border-[#F6AB8F] text-[#991b1b]'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">ΔReading ({testMinutes}m Study):</span>
                <span className="font-mono font-bold text-sm">{delta.toFixed(3)} m³</span>
              </div>
            </div>
          )}

          {/* If Leaked: Financial Loss Calculation & Valve Closure Alert */}
          {isFail && !isInvalidBackward && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-red-700 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-[11px] leading-tight">🛑 ABNORMAL LEAK DETECTED (&gt; 0.001 m³)!</p>
                  <p className="text-[10px] font-normal text-red-600 mt-0.5">Close 3/4" meter ball valve immediately to stop expensive LPG waste.</p>
                </div>
              </div>

              {/* Loss Breakdown Box */}
              <div className="bg-white/80 p-2.5 rounded-lg border border-red-200 font-mono text-[11px] space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Actual Loss ({testMinutes} mins):</span>
                  <span className="font-bold text-red-700">৳ {actualLossCost} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected 24-Hr Loss:</span>
                  <span className="font-bold text-red-700">৳ {projected24hCost} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span>Projected 30-Day Loss:</span>
                  <span className="font-bold text-red-700">৳ {projected30dCost} BDT</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeterFlatCard;
