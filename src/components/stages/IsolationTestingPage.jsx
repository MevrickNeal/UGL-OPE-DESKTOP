import React from 'react';
import { Shield, Info } from 'lucide-react';
import IsolationTestCard from './IsolationTestCard';
import useProjectStore from '../../store/useProjectStore';

const IsolationTestingPage = () => {
  const project = useProjectStore(state => state.project);
  const updateIsolationTest = useProjectStore(state => state.updateIsolationTest);

  const isolationTests = project?.isolationTests || {};
  const manifoldCount = project?.manifoldCount || 6;
  const manifoldNumbers = Array.from({ length: manifoldCount }, (_, i) => i + 1);

  const handleUpdate = (testKey, updates) => {
    updateIsolationTest(testKey, updates);
  };

  const getTestData = (key) => {
    // Direct lookup (e.g. 'bankA', 'manifold1')
    if (isolationTests[key]) return isolationTests[key];
    // Old format with hyphen (e.g. 'manifold-1')
    const hyphenKey = key.replace(/^manifold(\d+)$/, 'manifold-$1');
    if (isolationTests[hyphenKey]) return isolationTests[hyphenKey];
    // Nested inside manifolds object (old store format)
    if (isolationTests.manifolds) {
      if (isolationTests.manifolds[key]) return isolationTests.manifolds[key];
      if (isolationTests.manifolds[hyphenKey]) return isolationTests.manifolds[hyphenKey];
    }
    return {};
  };

  const primaryTests = ['bankA', 'bankB', 'regulator', 'mainLine'];
  const manifoldKeys = manifoldNumbers.map(num => `manifold${num}`);
  const allTests = [...primaryTests, ...manifoldKeys];

  const completedTests = allTests.filter(key => {
    const data = getTestData(key);
    if (data.status === 'pass' || data.status === 'complete') return true;
    if (data.startPressure && data.endPressure) {
      return parseFloat(data.endPressure) >= parseFloat(data.startPressure);
    }
    return false;
  }).length;

  const totalTests = allTests.length;
  const progressPercent = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#F8F9FA] font-inter">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-[#1A8A8A] p-2 rounded-lg text-white shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-outfit text-3xl font-bold text-gray-800">ISOLATION PRESSURE TESTING</h1>
        </div>
        <p className="text-gray-500 flex items-center gap-2">
          <Info className="w-4 h-4" /> Complete primary pipeline and manifold isolation tests before meter commissioning.
        </p>

        <div className="stat-card mt-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span className="timer-display">{completedTests} of {totalTests} Tests Complete</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#F15A24] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-outfit text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Stages 1-4: Primary Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IsolationTestCard 
            testKey="bankA"
            title="Cylinder Manifold Bank A"
            subtitle="Active - 20 Hoses"
            testMedium="Air"
            targetPressure="8.0 kg/cm²"
            duration={7200000}
            testData={getTestData('bankA')}
            onUpdate={handleUpdate}
          />
          <IsolationTestCard 
            testKey="bankB"
            title="Cylinder Manifold Bank B"
            subtitle="Reserve - 20 Hoses"
            testMedium="Air"
            targetPressure="8.0 kg/cm²"
            duration={7200000}
            testData={getTestData('bankB')}
            onUpdate={handleUpdate}
          />
          <IsolationTestCard 
            testKey="regulator"
            title="1st Stage Regulator & Interconnect"
            subtitle="Pressure Reduction Station"
            testMedium="Air"
            targetPressure="8.0 / 0.5 kg/cm²"
            duration={7200000}
            testData={getTestData('regulator')}
            onUpdate={handleUpdate}
          />
          <IsolationTestCard 
            testKey="mainLine"
            title="2&quot; Main Distribution Line"
            subtitle="Ground Floor to Roof"
            testMedium="Air"
            targetPressure="0.5 kg/cm²"
            duration={7200000}
            testData={getTestData('mainLine')}
            onUpdate={handleUpdate}
          />
        </div>
      </div>

      <div>
        <h2 className="font-outfit text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">METERING MANIFOLD ISOLATION ({manifoldCount} Manifolds)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {manifoldNumbers.map((num) => (
            <IsolationTestCard 
              key={`manifold${num}`}
              testKey={`manifold${num}`}
              title={`Manifold ${num}`}
              subtitle="Riser Branch Isolation"
              testMedium="Air"
              targetPressure="200 mbar"
              duration={7200000}
              testData={getTestData(`manifold${num}`)}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IsolationTestingPage;
