import React, { useState, useMemo } from 'react';
import { Gauge, Play, CheckCircle2, AlertTriangle, Filter, DollarSign, RefreshCw } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import MeterFlatCard from './MeterFlatCard';
import { generateFlatNumbers } from '../../utils/helpers';

const MeterSeriesPage = () => {
  const project = useProjectStore(state => state.project);
  const updateProject = useProjectStore(state => state.updateProject);
  const updateMeterTest = useProjectStore(state => state.updateMeterTest);

  const [activeSeries, setActiveSeries] = useState(1);
  const [filter, setFilter] = useState('all'); // all, pass, fail

  // LPG Price Rate (default 150 BDT / m³)
  const lpgRate = project?.lpgRate !== undefined ? project.lpgRate : 150;

  const handleLpgRateChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    updateProject({ lpgRate: val });
  };

  const meterTests = project?.meterTests || {};
  const flats = project?.flats || {};
  const manifoldCount = project?.manifoldCount || 1;
  const flatsPerManifold = project?.flatsPerManifold || 14;

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

  // Only flats explicitly marked active === true during project setup
  const activeSeriesFlats = useMemo(() => {
    const keys = Object.keys(flats);
    if (keys.length === 0) return [];
    
    return keys.filter(flatNum => {
      const fConfig = flats[flatNum] || {};
      if (fConfig.active !== true) return false;
      return String(fConfig.series) === String(activeSeries) || Number(fConfig.series) === Number(activeSeries);
    });
  }, [flats, activeSeries]);

  // Overall active flats count (strictly active === true)
  const allActiveFlats = useMemo(() => {
    return Object.keys(flats).filter(flatNum => flats[flatNum].active === true);
  }, [flats]);

  const stats = useMemo(() => {
    let tested = 0;
    let passed = 0;
    let failed = 0;
    let totalGasLossCost = 0;

    allActiveFlats.forEach(flatNum => {
      const test = meterTests[flatNum];
      if (test && test.initialReading !== undefined && test.finalReading !== undefined) {
        const init = parseFloat(test.initialReading);
        const final = parseFloat(test.finalReading);
        if (!isNaN(init) && !isNaN(final)) {
          tested++;
          const delta = Math.abs(final - init);
          if (delta <= 0.005) {
            passed++;
          } else {
            failed++;
            totalGasLossCost += delta * lpgRate;
          }
        }
      }
    });

    return { totalActive: allActiveFlats.length, tested, passed, failed, totalGasLossCost };
  }, [allActiveFlats, meterTests, lpgRate]);

  // Filtered flats for active series tab
  const filteredFlats = useMemo(() => {
    return activeSeriesFlats.filter(flatNum => {
      const test = meterTests[flatNum] || {};
      const init = parseFloat(test.initialReading);
      const final = parseFloat(test.finalReading);
      const isComplete = !isNaN(init) && !isNaN(final);
      const delta = isComplete ? Math.abs(final - init) : 0;

      if (filter === 'pass') return isComplete && delta <= 0.005;
      if (filter === 'fail') return isComplete && delta > 0.005;
      return true;
    });
  }, [activeSeriesFlats, meterTests, filter]);

  const handleUpdateMeter = (flatNumber, updates) => {
    updateMeterTest(flatNumber, updates);
  };

  const handleRegisterAllFlats = () => {
    const generated = generateFlatNumbers(manifoldCount, flatsPerManifold);
    updateProject({ flats: generated });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#F8F9FA] flex flex-col font-inter">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#F15A24] p-2.5 rounded-xl text-white shadow-md">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">
                STAGE 7: LPG METER COMMISSIONING
              </h1>
              <p className="text-slate-500 text-xs md:text-sm">
                Medium: <strong className="text-[#F15A24]">LPG (Liquid Petroleum Gas @ 40mbar)</strong> · Tolerance: <strong>0.005 m³</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleRegisterAllFlats}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-pointer btn-press"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0D6B6E]" />
            Register All {manifoldCount * flatsPerManifold} Active Flats
          </button>
        </div>

        {/* LPG Gas Rate & Summary Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Editable LPG Gas Price Box */}
          <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl text-[#F15A24]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">LPG Gas Rate (BDT / m³)</label>
              <input
                type="number"
                step="1"
                value={lpgRate}
                onChange={handleLpgRateChange}
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono font-bold text-slate-800 focus:border-[#F15A24] outline-none"
                placeholder="150"
              />
            </div>
          </div>

          {/* Tested Stat Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Tested Status</span>
              <span className="font-mono text-xl font-bold text-slate-800">{stats.tested} / {stats.totalActive} Tested</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-[#D5EBD7] text-[#166534] px-2 py-1 rounded font-bold text-xs">{stats.passed} PASS</span>
              <span className="bg-[#FBDCD3] text-[#991b1b] px-2 py-1 rounded font-bold text-xs">{stats.failed} FAIL</span>
            </div>
          </div>

          {/* Financial Loss Cost Banner */}
          <div className="bg-red-50 rounded-xl p-4 border border-red-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-600 uppercase block">Total Est. Gas Loss Cost</span>
              <span className="font-mono text-xl font-bold text-red-700">৳ {stats.totalGasLossCost.toFixed(2)} BDT</span>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Series Tabs & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-200 pb-2">
        <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-2 sm:pb-0">
          {seriesList.map(sItem => (
            <button
              key={sItem.series}
              onClick={() => setActiveSeries(sItem.series)}
              className={`btn-press px-4 py-2 rounded-t-lg font-outfit font-medium text-sm whitespace-nowrap border-b-2 cursor-pointer ${
                activeSeries === sItem.series 
                  ? 'bg-[#D5EBD7] text-[#0D6B6E] border-[#0D6B6E] font-bold' 
                  : 'text-slate-600 border-transparent hover:bg-slate-100'
              }`}
            >
              Manifold {sItem.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <button
            onClick={() => setFilter('all')}
            className={`btn-press px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${
              filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({activeSeriesFlats.length})
          </button>
          <button
            onClick={() => setFilter('pass')}
            className={`btn-press px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${
              filter === 'pass' ? 'bg-[#166534] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Passed (Fit for Handover)
          </button>
          <button
            onClick={() => setFilter('fail')}
            className={`btn-press px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${
              filter === 'fail' ? 'bg-[#dc2626] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Leaked (Valve Isolated)
          </button>
        </div>
      </div>

      {/* Grid of Meter Flat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
        {filteredFlats.map(flatNum => (
          <MeterFlatCard
            key={flatNum}
            flatNumber={flatNum}
            testData={meterTests[flatNum] || {}}
            flatConfig={flats[flatNum] || {}}
            lpgRate={lpgRate}
            onUpdate={handleUpdateMeter}
          />
        ))}

        {filteredFlats.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="font-bold">No active meters found for Series {activeSeries}.</p>
            <button
              onClick={handleRegisterAllFlats}
              className="px-4 py-2 bg-[#0D6B6E] text-white rounded-xl text-xs font-bold btn-press cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Register & Enable All {manifoldCount * flatsPerManifold} Active Flats
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeterSeriesPage;
