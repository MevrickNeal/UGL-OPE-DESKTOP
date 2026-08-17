import React from 'react';
import { Activity, ShieldCheck, Gauge, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const OverviewPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
          </div>
          <h3 className="text-3xl font-outfit font-bold text-slate-800">94</h3>
          <p className="text-sm text-slate-500 mt-1">Tests Required</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded uppercase tracking-wider">Done</span>
          </div>
          <h3 className="text-3xl font-outfit font-bold text-slate-800">12</h3>
          <p className="text-sm text-slate-500 mt-1">Completed</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded uppercase tracking-wider">Wait</span>
          </div>
          <h3 className="text-3xl font-outfit font-bold text-slate-800">82</h3>
          <p className="text-sm text-slate-500 mt-1">Pending</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded uppercase tracking-wider">Error</span>
          </div>
          <h3 className="text-3xl font-outfit font-bold text-slate-800">0</h3>
          <p className="text-sm text-slate-500 mt-1">Failed</p>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Progress Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-6 lg:p-8">
            <h3 className="text-lg font-outfit font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal-600" />
              Isolation Test Progress (Stages 1-4)
            </h3>
            
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span className="text-slate-600">3 of 10 tests completed</span>
              <span className="text-teal-600 font-bold">30%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: '30%' }}></div>
            </div>

            <h3 className="text-lg font-outfit font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-orange-500" />
              Meter Commissioning Progress (Stage 5)
            </h3>
            
            <div className="mb-2 flex justify-between text-sm font-medium">
              <span className="text-slate-600">0 of 84 meters tested</span>
              <span className="text-orange-500 font-bold">0%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-lg rounded-2xl p-6 lg:p-8">
          <h3 className="text-lg font-outfit font-bold text-slate-800 mb-6">Recent Activity</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">Stage 1: Base Network</h4>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded">10 mins ago</span>
                </div>
                <p className="text-xs text-slate-500">Pneumatic test passed at 1.5 bar.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">Project Created</h4>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded">1 hr ago</span>
                </div>
                <p className="text-xs text-slate-500">RUAP Preset loaded with 84 flats.</p>
              </div>
            </div>
            
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OverviewPage;
