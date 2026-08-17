import { useState, useEffect } from 'react';
import useProjectStore from './store/useProjectStore';
import useAuthStore from './store/useAuthStore';
import SplashScreen from './components/SplashScreen';
import ProjectSelector from './components/ProjectSelector';
import ProjectSetupWizard from './components/ProjectSetupWizard';
import Dashboard from './components/Dashboard';
import OverviewPage from './components/overview/OverviewPage';
import IsolationTestingPage from './components/stages/IsolationTestingPage';
import VerticalAirTestPage from './components/stages/VerticalAirTestPage';
import AirPurgingPage from './components/stages/AirPurgingPage';
import MeterSeriesPage from './components/meters/MeterSeriesPage';
import ReportsPage from './components/reports/ReportsPage';
import DatabaseLogsPage from './components/reports/DatabaseLogsPage';
import LoginPage from './components/auth/LoginPage';

function App() {
  const {
    currentView,
    setCurrentView,
    activeSection,
    setActiveSection,
    projects,
    project,
    loadProject,
    createProject,
    loadProjectList,
  } = useProjectStore();

  const { initAuth, user, loading: authLoading } = useAuthStore();

  const [showWizard, setShowWizard] = useState(false);
  const [isPreset, setIsPreset] = useState(false);
  const [storeReady, setStoreReady] = useState(false);

  // Initialize auth & project list on mount
  useEffect(() => {
    const init = async () => {
      await initAuth();
      if (loadProjectList) {
        await loadProjectList();
      }
      setStoreReady(true);
    };
    init();
  }, []);

  // Reload projects whenever user logs in or out
  useEffect(() => {
    if (storeReady && loadProjectList) {
      loadProjectList();
    }
  }, [user]);

  // Loading state
  if (!storeReady || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo-square.png" alt="Urban Gaz" className="w-16 h-16 opacity-50 object-contain" />
          <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#F15A24] animate-loading-bar rounded-full" />
          </div>
          <span className="text-xs font-semibold text-slate-400">Authenticating...</span>
        </div>
      </div>
    );
  }

  // Auth Gate: Require login
  if (!user) {
    return <LoginPage />;
  }

  // Splash Screen
  if (currentView === 'splash') {
    return <SplashScreen onComplete={() => setCurrentView('selector')} />;
  }

  // Project Selector
  if (currentView === 'selector' && !showWizard) {
    return (
      <ProjectSelector
        projects={projects || []}
        onNewProject={() => {
          setIsPreset(false);
          setShowWizard(true);
        }}
        onOpenProject={(projectId) => {
          loadProject(projectId);
          setCurrentView('dashboard');
        }}
        onRuapPreset={async () => {
          const id = await useProjectStore.getState().applyRuapPreset();
          loadProject(id);
          setCurrentView('dashboard');
        }}
        onDeleteProject={useProjectStore.getState().deleteProject}
        onReloadProjects={loadProjectList}
      />
    );
  }

  // Project Setup Wizard
  if (showWizard) {
    return (
      <ProjectSetupWizard
        isPreset={isPreset}
        onComplete={(projectData) => {
          createProject(projectData);
          setShowWizard(false);
          setCurrentView('dashboard');
        }}
        onCancel={() => {
          setShowWizard(false);
          setIsPreset(false);
        }}
      />
    );
  }

  // Dashboard
  if (currentView === 'dashboard' && project) {
    return (
      <Dashboard
        project={project}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onBackToProjects={() => {
          setCurrentView('selector');
          setActiveSection('overview');
        }}
      >
        {activeSection === 'overview' && <OverviewPage />}
        {activeSection === 'isolation' && <IsolationTestingPage />}
        {activeSection === 'vertical-air' && <VerticalAirTestPage />}
        {activeSection === 'purging' && <AirPurgingPage />}
        {activeSection === 'meters' && <MeterSeriesPage />}
        {activeSection === 'reports' && <ReportsPage />}
        {activeSection === 'database' && <DatabaseLogsPage />}
      </Dashboard>
    );
  }

  // Fallback - go to selector
  return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
      <button
        onClick={() => setCurrentView('selector')}
        className="px-6 py-3 bg-[#F15A24] text-white rounded-xl font-bold shadow-md btn-press cursor-pointer"
      >
        Go to Projects
      </button>
    </div>
  );
}

export default App;
