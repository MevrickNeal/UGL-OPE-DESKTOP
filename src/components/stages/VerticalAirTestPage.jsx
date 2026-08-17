import React, { useState, useMemo } from 'react';
import { Wind, AlertTriangle, CheckCircle2, Filter, Info, Clock, Timer } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import { appendAuditLog } from '../../utils/auditLogger';

const VerticalAirTestPage = () => {
  const project = useProjectStore(state => state.project);
  const updateProject = useProjectStore(state => state.updateProject);

  const [activeSeries, setActiveSeries] = useState(1);
  const [filter, setFilter] = useState('all');

  const verticalAirTests = project?.verticalAirTests || {};
  const verticalSeriesTimes = project?.verticalSeriesTimes || {};
  const flats = project?.flats || {};
  const manifoldCount = project?.manifoldCount || 1;

  const seriesList = useMemo(() => {
    const list = [];
    const count = project?.manifoldCount || 1;
    const namesInput = project?.manifoldNamesInput
      ? project.manifoldNamesInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    for (let i = 1; i <= count; i++) {
      const name = namesInput[i - 1] || `${i}`;
      list.push({ series: i, name });
    }
    return list;
  }, [project?.manifoldCount, project?.manifoldNamesInput]);

  // Current series time data
  const seriesTimeData = verticalSeriesTimes[activeSeries] || {};

  // Calculate elapsed duration between T1 and T2
  const elapsedDuration = useMemo(() => {
    if (!seriesTimeData.t1 || !seriesTimeData.t2) return null;
    const t1 = new Date(seriesTimeData.t1).getTime();
    const t2 = new Date(seriesTimeData.t2).getTime();
    if (isNaN(t1) || isNaN(t2) || t2 < t1) return null;
    const diffMs = t2 - t1;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [seriesTimeData.t1, seriesTimeData.t2]);

  // Handle T1/T2 time update for active series
  const handleSeriesTimeUpdate = (field, value) => {
    const updated = {
      ...verticalSeriesTimes,
      [activeSeries]: {
        ...seriesTimeData,
        [field]: value
      }
    };
    updateProject({ verticalSeriesTimes: updated });

    appendAuditLog(project, 'VERTICAL_SERIES_TIME', {
      series: activeSeries, field, value
    });
  };

  // Set T1 or T2 to current time
  const handleSetNow = (field) => {
    const now = new Date();
    const localISO = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');
    handleSeriesTimeUpdate(field, localISO);
  };

  // Only flats explicitly marked active === true during project setup
  const activeFlatsForSeries = useMemo(() => {
    const keys = Object.keys(flats);
    if (keys.length === 0) return [];
    return keys.filter(flatNum => {
      const fConfig = flats[flatNum] || {};
      if (fConfig.active !== true) return false;
      return String(fConfig.series) === String(activeSeries) || Number(fConfig.series) === Number(activeSeries);
    });
  }, [flats, activeSeries]);

  // Overall active flats count (only strictly active === true)
  const allActiveFlats = useMemo(() => {
    return Object.keys(flats).filter(flatNum => flats[flatNum].active === true);
  }, [flats]);

  // Stats across all active flats
  const stats = useMemo(() => {
    let tested = 0, healthy = 0, leaked = 0;
    allActiveFlats.forEach(flatNum => {
      const test = verticalAirTests[flatNum];
      if (test && test.initialReading !== undefined && test.finalReading !== undefined) {
        const init = parseFloat(test.initialReading);
        const final = parseFloat(test.finalReading);
        if (!isNaN(init) && !isNaN(final)) {
          tested++;
          if (Math.abs(final - init) <= 0.003) healthy++;
          else leaked++;
        }
      }
    });
    return { totalActive: allActiveFlats.length, tested, healthy, leaked };
  }, [allActiveFlats, verticalAirTests]);

  // Filtered flats for active series tab
  const filteredFlats = useMemo(() => {
    return activeFlatsForSeries.filter(flatNum => {
      const test = verticalAirTests[flatNum] || {};
      const init = parseFloat(test.initialReading);
      const final = parseFloat(test.finalReading);
      const isComplete = !isNaN(init) && !isNaN(final);
      const delta = isComplete ? Math.abs(final - init) : 0;
      if (filter === 'healthy') return isComplete && delta <= 0.003;
      if (filter === 'leaked') return isComplete && delta > 0.003;
      return true;
    });
  }, [activeFlatsForSeries, verticalAirTests, filter]);

  const handleUpdateReading = (flatNum, field, value) => {
    const prevTest = verticalAirTests[flatNum] || {};
    const updatedTest = { ...prevTest, [field]: value, timestamp: Date.now() };
    const init = parseFloat(field === 'initialReading' ? value : updatedTest.initialReading);
    const final = parseFloat(field === 'finalReading' ? value : updatedTest.finalReading);
    if (!isNaN(init) && !isNaN(final)) {
      updatedTest.delta = Math.abs(final - init).toFixed(3);
      updatedTest.status = parseFloat(updatedTest.delta) <= 0.003 ? 'pass' : 'fail';
    }
    const newVerticalTests = { ...verticalAirTests, [flatNum]: updatedTest };
    updateProject({ verticalAirTests: newVerticalTests });
    appendAuditLog(project, 'VERTICAL_AIR_TEST_ENTRY', {
      flatNum, field, value, status: updatedTest.status || 'in_progress'
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#F8F9FA] flex flex-col font-inter">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#F15A24] p-2.5 rounded-xl text-white shadow-md">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">
              VERTICAL RISER AIR TEST (PNEUMATIC)
            </h1>
            <p className="text-slate-500 text-xs md:text-sm">
              Test Medium: <strong className="text-slate-700">Oil-Free Compressed Air @ 200 mbar</strong> · Showing <strong className="text-[#0D6B6E]">Active Customer Flats Only</strong>
            </p>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs md:text-sm text-amber-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Intermediate Pneumatic Validation:</strong> Only flats marked <strong>Active</strong> during project setup are shown here. 
            Record <strong>T1</strong> (start) and <strong>T2</strong> (end) times for each series to log test duration.
            <span className="underline ml-1 font-semibold">Final handover certificates are issued only after Stage 7 LPG meter commissioning.</span>
          </div>
        </div>

        {/* Summary Metric Badges */}
        <div className="stat-card bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <div className="px-3.5 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
              <span className="font-mono text-lg font-bold text-slate-900">{stats.totalActive}</span> Active Flats
            </div>
            <div className="px-3.5 py-1.5 bg-[#D5EBD7] rounded-lg border border-[#B1D8B4] text-[#166534] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#166534]" />
              <span className="font-mono text-lg font-bold">{stats.healthy}</span> Healthy (Pass)
            </div>
            <div className="px-3.5 py-1.5 bg-[#FBDCD3] rounded-lg border border-[#F6AB8F] text-[#991b1b] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#dc2626]" />
              <span className="font-mono text-lg font-bold">{stats.leaked}</span> Leaks Detected
            </div>
          </div>
        </div>
      </div>

      {/* Series Tabs & Filter Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 border-b border-slate-200 pb-2">
        <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-2 sm:pb-0">
          {seriesList.map(sItem => {
            const countInSeries = Object.keys(flats).filter(fn => {
              const fc = flats[fn] || {};
              if (fc.active !== true) return false;
              return String(fc.series) === String(sItem.series) || Number(fc.series) === Number(sItem.series);
            }).length;
            const st = verticalSeriesTimes[sItem.series] || {};
            const hasTime = st.t1 && st.t2;
            return (
              <button
                key={sItem.series}
                onClick={() => setActiveSeries(sItem.series)}
                className={`btn-press px-4 py-2 rounded-t-lg font-outfit font-medium text-sm whitespace-nowrap border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  activeSeries === sItem.series 
                    ? 'bg-[#D5EBD7] text-[#0D6B6E] border-[#0D6B6E] font-bold' 
                    : 'text-slate-600 border-transparent hover:bg-slate-100'
                }`}
              >
                Manifold {sItem.name} ({countInSeries})
                {hasTime && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <button onClick={() => setFilter('all')} className={`btn-press px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            All Active ({activeFlatsForSeries.length})
          </button>
          <button onClick={() => setFilter('healthy')} className={`btn-press px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${filter === 'healthy' ? 'bg-[#166534] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            Healthy (Pass)
          </button>
          <button onClick={() => setFilter('leaked')} className={`btn-press px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${filter === 'leaked' ? 'bg-[#dc2626] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            Leaked (Fail)
          </button>
        </div>
      </div>

      {/* ===== T1 / T2 TIME INPUT PANEL FOR ACTIVE SERIES ===== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-[#0D6B6E] p-2 rounded-lg text-white">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-slate-800 text-lg">
              Series {activeSeries} — Test Duration
            </h3>
            <p className="text-xs text-slate-500">Record start (T1) and end (T2) timestamps for this vertical riser series</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* T1 - Start Time */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0D6B6E]" />
              T1 — START TIME
            </label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={seriesTimeData.t1 || ''}
                onChange={(e) => handleSeriesTimeUpdate('t1', e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm font-bold focus:border-[#0D6B6E] outline-none"
              />
              <button
                onClick={() => handleSetNow('t1')}
                className="px-3 py-2.5 bg-[#0D6B6E] text-white rounded-xl text-xs font-bold btn-press cursor-pointer whitespace-nowrap hover:bg-[#095856] transition-colors"
              >
                NOW
              </button>
            </div>
          </div>

          {/* T2 - End Time */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F15A24]" />
              T2 — END TIME
            </label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={seriesTimeData.t2 || ''}
                onChange={(e) => handleSeriesTimeUpdate('t2', e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm font-bold focus:border-[#F15A24] outline-none"
              />
              <button
                onClick={() => handleSetNow('t2')}
                className="px-3 py-2.5 bg-[#F15A24] text-white rounded-xl text-xs font-bold btn-press cursor-pointer whitespace-nowrap hover:bg-[#d4491a] transition-colors"
              >
                NOW
              </button>
            </div>
          </div>

          {/* Elapsed Duration */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-3 min-h-[68px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ELAPSED DURATION</span>
            <span className={`font-mono text-2xl font-black tracking-wide ${elapsedDuration ? 'text-[#0D6B6E]' : 'text-slate-300'}`}>
              {elapsedDuration || '——:——:——'}
            </span>
          </div>
        </div>

        {/* Series time notes */}
        <div className="mt-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            SERIES {activeSeries} — REMARKS / NOTES
          </label>
          <input
            type="text"
            placeholder="e.g., Pressure stabilized at 200mbar before T1..."
            value={seriesTimeData.notes || ''}
            onChange={(e) => handleSeriesTimeUpdate('notes', e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:border-[#0D6B6E] outline-none"
          />
        </div>
      </div>

      {/* Flat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
        {filteredFlats.map(flatNum => {
          const test = verticalAirTests[flatNum] || {};
          const init = test.initialReading || '';
          const final = test.finalReading || '';
          const delta = test.delta !== undefined ? test.delta : (init !== '' && final !== '' ? Math.abs(parseFloat(final) - parseFloat(init)).toFixed(3) : null);
          const isComplete = delta !== null && !isNaN(parseFloat(delta));
          const isPass = isComplete && parseFloat(delta) <= 0.003;

          return (
            <div 
              key={flatNum}
              className={`bg-white/80 backdrop-blur-md rounded-2xl p-4 border shadow-sm transition-all interactive-card ${
                isComplete 
                  ? (isPass ? 'border-green-300 bg-green-50/20' : 'border-red-300 bg-red-50/20')
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vertical Riser</span>
                  <h3 className="text-xl font-outfit font-bold text-slate-800">Flat {flatNum}</h3>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                  Series {activeSeries}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Initial Air Reading (m³)</label>
                  <input type="number" step="0.001" placeholder="0.000" value={init}
                    onChange={(e) => handleUpdateReading(flatNum, 'initialReading', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-sm font-bold focus:border-[#F15A24] outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Final Air Reading (m³)</label>
                  <input type="number" step="0.001" placeholder="0.000" value={final}
                    onChange={(e) => handleUpdateReading(flatNum, 'finalReading', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-sm font-bold focus:border-[#F15A24] outline-none" />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">ΔReading</span>
                    <span className="font-mono text-base font-bold text-slate-800">
                      {delta !== null ? `${delta} m³` : '—'}
                    </span>
                  </div>
                  {isComplete ? (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isPass ? 'bg-[#D5EBD7] text-[#166534] border-[#B1D8B4]' : 'bg-[#FBDCD3] text-[#991b1b] border-[#F6AB8F] animate-pulse-red'
                    }`}>
                      {isPass ? 'HEALTHY (PASS ✓)' : 'LEAK DETECTED ✗'}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">PENDING</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFlats.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="font-bold text-slate-600">No active flats selected for Series {activeSeries}.</p>
            <p className="text-xs text-slate-400">
              Active flats are set during Project Setup (Step 3). Go back to the project setup wizard to select which flats are active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerticalAirTestPage;
