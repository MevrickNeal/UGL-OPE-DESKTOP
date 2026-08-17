import { create } from 'zustand';
import localforage from 'localforage';
import { generateFlatNumbers, generateProjectId } from '../utils/helpers.js';
import { supabase } from '../lib/supabaseClient.js';
import { useAuthStore } from './useAuthStore.js';

const PROJECT_LIST_KEY = 'ugl_projects_list';
const PROJECT_PREFIX = 'ugl_project_';

const initialProjectState = {
  id: null,
  areaName: 'RUAP',
  buildingName: 'SHAPLA BUILDING 13B',
  inspectorName: 'LIAN MOLLIK',
  inspectorDesignation: 'TECH CO-ORDINATOR',
  witnessName: 'CLIENT WITNESS',
  ambientTemp: '28',
  manifoldCount: 6,
  flatsPerManifold: 14,
  createdAt: null,
  updatedAt: null,
  flats: {},
  isolationTests: {
    bankA: { startPressure: '', endPressure: '', timerStart: null, timerEnd: null, status: 'pending' },
    bankB: { startPressure: '', endPressure: '', timerStart: null, timerEnd: null, status: 'pending' },
    regulator: { startPressureInlet: '', startPressureOutlet: '', endPressureInlet: '', endPressureOutlet: '', timerStart: null, timerEnd: null, status: 'pending' },
    mainLine: { startPressure: '', endPressure: '', timerStart: null, timerEnd: null, status: 'pending' },
    manifolds: {}
  },
  meterTests: {},
  inspectionSessions: []
};

// Helper for Supabase Cloud Sync
const syncToSupabase = async (projectDoc) => {
  const user = useAuthStore.getState().user;
  if (!user || !projectDoc || !projectDoc.id) return;

  try {
    const { error } = await supabase.from('projects').upsert({
      id: projectDoc.id,
      user_id: user.id,
      area_name: projectDoc.areaName || 'RUAP',
      building_name: projectDoc.buildingName || 'SHAPLA BUILDING 13B',
      data: projectDoc,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Supabase sync error (offline or RLS not setup yet):', error.message);
    }
  } catch (err) {
    console.warn('Supabase sync exception:', err);
  }
};

const deleteFromSupabase = async (projectId) => {
  const user = useAuthStore.getState().user;
  if (!user || !projectId) return;

  try {
    await supabase.from('projects').delete().eq('id', projectId);
  } catch (err) {
    console.warn('Supabase delete exception:', err);
  }
};

export const useProjectStore = create((set, get) => ({
  currentView: 'splash',
  activeSection: 'overview',
  projects: [],
  activeProjectId: null,
  project: JSON.parse(JSON.stringify(initialProjectState)),

  setCurrentView: (view) => set({ currentView: view }),
  setActiveSection: (section) => set({ activeSection: section }),

  createProject: async (projectData) => {
    const id = generateProjectId();
    const now = Date.now();

    // Resolve manifold count: wizard sends 'manifolds', store uses 'manifoldCount'
    const rawManifoldCount = parseInt(projectData.manifolds) || parseInt(projectData.manifoldCount) || 6;
    const rawFlatsPerManifold = parseInt(projectData.flatsPerManifold) || 14;

    // Parse manifold names input if provided, ensuring length matches rawManifoldCount
    const parsedNames = projectData.manifoldNamesInput
      ? projectData.manifoldNamesInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const actualManifoldCount = rawManifoldCount;

    const manifoldConfig = Array.from({ length: actualManifoldCount }, (_, i) => {
      return parsedNames[i] || `${i + 1}`;
    });

    const flats = generateFlatNumbers(manifoldConfig, rawFlatsPerManifold);
    if (projectData.activeFlats) {
      Object.keys(projectData.activeFlats).forEach(flatNum => {
        if (flats[flatNum]) {
          flats[flatNum].active = projectData.activeFlats[flatNum];
        }
      });
    }

    // Build isolation test entries for each manifold (use 'manifold1', 'manifold2' — NO hyphen)
    const isolationManifolds = {};
    for (let i = 1; i <= actualManifoldCount; i++) {
      isolationManifolds[`manifold${i}`] = { startPressure: '', endPressure: '', timerStart: null, timerEnd: null, status: 'pending' };
    }

    const newProject = {
      ...initialProjectState,
      ...projectData,
      id,
      areaName: projectData.areaName || 'RUAP',
      buildingName: projectData.buildingName || 'SHAPLA BUILDING 13B',
      manifoldCount: actualManifoldCount,
      flatsPerManifold: rawFlatsPerManifold,
      createdAt: now,
      updatedAt: now,
      flats,
      isolationTests: {
        bankA: initialProjectState.isolationTests.bankA,
        bankB: initialProjectState.isolationTests.bankB,
        regulator: initialProjectState.isolationTests.regulator,
        mainLine: initialProjectState.isolationTests.mainLine,
        ...isolationManifolds
      }
    };

    const summary = {
      id,
      name: newProject.areaName,
      building: newProject.buildingName,
      createdAt: now,
      updatedAt: now
    };

    const currentList = get().projects;
    const updatedList = [summary, ...currentList.filter(p => p.id !== id)];

    // 1. Save to localforage
    await localforage.setItem(PROJECT_PREFIX + id, newProject);
    await localforage.setItem('ugl_active_project', newProject);
    await localforage.setItem(PROJECT_LIST_KEY, updatedList);

    // 2. Sync to Supabase cloud
    syncToSupabase(newProject);

    set({
      projects: updatedList,
      activeProjectId: id,
      project: newProject,
      currentView: 'dashboard'
    });

    return newProject;
  },

  loadProject: async (projectId) => {
    // 1. Try localforage first
    let saved = await localforage.getItem(PROJECT_PREFIX + projectId);

    // 2. If not in localforage, try fetching from Supabase
    if (!saved) {
      const user = useAuthStore.getState().user;
      if (user) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('data')
            .eq('id', projectId)
            .single();

          if (!error && data?.data) {
            saved = data.data;
            await localforage.setItem(PROJECT_PREFIX + projectId, saved);
          }
        } catch (err) {
          console.warn('Could not fetch project from Supabase:', err);
        }
      }
    }

    if (saved) {
      if (!saved.buildingName) saved.buildingName = 'SHAPLA BUILDING 13B';
      if (!saved.areaName) saved.areaName = 'RUAP';
      if (!saved.inspectorDesignation) saved.inspectorDesignation = 'TECH CO-ORDINATOR';

      await localforage.setItem('ugl_active_project', saved);
      set({
        activeProjectId: projectId,
        project: saved,
        currentView: 'dashboard'
      });
    }
  },

  updateProject: async (updates) => {
    const current = get().project;
    if (!current || !current.id) return;

    const updated = {
      ...current,
      ...updates,
      updatedAt: Date.now()
    };

    set({ project: updated });

    // 1. Save locally
    await localforage.setItem(PROJECT_PREFIX + current.id, updated);
    await localforage.setItem('ugl_active_project', updated);

    // Update summary list
    const currentList = get().projects;
    const updatedList = currentList.map(p => {
      if (p.id === current.id) {
        return {
          ...p,
          name: updated.areaName,
          building: updated.buildingName,
          updatedAt: updated.updatedAt
        };
      }
      return p;
    });

    set({ projects: updatedList });
    await localforage.setItem(PROJECT_LIST_KEY, updatedList);

    // 2. Cloud Sync to Supabase
    syncToSupabase(updated);
  },

  deleteProject: async (projectId) => {
    await localforage.removeItem(PROJECT_PREFIX + projectId);
    deleteFromSupabase(projectId);

    const currentList = get().projects.filter(p => p.id !== projectId);
    set({ projects: currentList });
    await localforage.setItem(PROJECT_LIST_KEY, currentList);

    if (get().activeProjectId === projectId) {
      set({ activeProjectId: null, currentView: 'selector' });
    }
  },

  loadProjectList: async () => {
    let cloudProjects = [];
    const user = useAuthStore.getState().user;

    // Fetch from Supabase if logged in (RLS policy automatically filters for inspector / shows all for admin)
    if (user) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, user_id, area_name, building_name, data, updated_at')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          cloudProjects = data.map(row => ({
            id: row.id,
            userId: row.user_id,
            name: row.area_name || row.data?.areaName || 'RUAP',
            building: row.building_name || row.data?.buildingName || 'SHAPLA BUILDING 13B',
            inspector: row.data?.inspectorName || 'Inspector',
            createdAt: row.data?.createdAt || Date.now(),
            updatedAt: new Date(row.updated_at).getTime() || Date.now()
          }));

          // Also populate localforage with cloud project docs
          for (const row of data) {
            if (row.data) {
              await localforage.setItem(PROJECT_PREFIX + row.id, row.data);
            }
          }
        }
      } catch (err) {
        console.warn('Cloud project list fetch failed, falling back to local:', err);
      }
    }

    const localList = (await localforage.getItem(PROJECT_LIST_KEY)) || [];
    
    // Merge cloud and local lists by ID
    const mergedMap = new Map();
    localList.forEach(p => mergedMap.set(p.id, p));
    cloudProjects.forEach(p => mergedMap.set(p.id, p));
    
    const combinedList = Array.from(mergedMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    set({ projects: combinedList });
    await localforage.setItem(PROJECT_LIST_KEY, combinedList);

    // Also check for active project
    const active = await localforage.getItem('ugl_active_project');
    if (active && active.id) {
      set({ activeProjectId: active.id, project: active });
    }
  },

  toggleFlatActive: (flatNumber) => {
    const project = get().project;
    const currentFlat = project.flats[flatNumber] || {};
    const updatedFlats = {
      ...project.flats,
      [flatNumber]: {
        ...currentFlat,
        active: !currentFlat.active
      }
    };
    get().updateProject({ flats: updatedFlats });
  },

  setAllFlatsActive: (active) => {
    const project = get().project;
    const updatedFlats = {};
    Object.keys(project.flats).forEach(k => {
      updatedFlats[k] = { ...project.flats[k], active };
    });
    get().updateProject({ flats: updatedFlats });
  },

  updateIsolationTest: (testKey, updates) => {
    const project = get().project;
    const updatedIsolation = {
      ...project.isolationTests,
      [testKey]: {
        ...(project.isolationTests[testKey] || {}),
        ...updates
      }
    };
    get().updateProject({ isolationTests: updatedIsolation });
  },

  updateMeterTest: (flatNumber, updates) => {
    const project = get().project;
    const currentMeter = project.meterTests[flatNumber] || {};
    const updatedMeters = {
      ...project.meterTests,
      [flatNumber]: {
        ...currentMeter,
        ...updates
      }
    };
    get().updateProject({ meterTests: updatedMeters });
  },

  batchStartHoldTest: (seriesNumber) => {
    const project = get().project;
    const updatedMeters = { ...project.meterTests };
    const now = Date.now();

    Object.keys(project.flats).forEach(flatNum => {
      const fConfig = project.flats[flatNum];
      if (fConfig.series === seriesNumber && fConfig.active) {
        updatedMeters[flatNum] = {
          ...(updatedMeters[flatNum] || {}),
          holdStart: now,
          holdEnd: null,
          status: 'testing'
        };
      }
    });

    get().updateProject({ meterTests: updatedMeters });
  },

  addInspectionSession: (dateLabel) => {
    const project = get().project;
    const id = 'session_' + Date.now();
    const newSession = { id, date: Date.now(), dateLabel, readings: {} };
    get().updateProject({ inspectionSessions: [...project.inspectionSessions, newSession] });
  },

  updateSessionReading: (sessionId, flatNumber, reading) => {
    const project = get().project;
    const sessions = project.inspectionSessions.map(s => {
      if (s.id === sessionId) {
        return { ...s, readings: { ...s.readings, [flatNumber]: reading } };
      }
      return s;
    });
    get().updateProject({ inspectionSessions: sessions });
  },

  applyRuapPreset: async () => {
    return await get().createProject({
      areaName: 'RUAP, UTTARA - 18, DHAKA',
      buildingName: 'SHAPLA BUILDING 13B',
      inspectorName: 'LIAN MOLLIK',
      inspectorDesignation: 'TECH CO-ORDINATOR',
      witnessName: 'CLIENT WITNESS',
      ambientTemp: '28',
      manifoldCount: 6,
      flatsPerManifold: 14,
      manifoldNamesInput: '1, 2, 3, 4, 5, 6'
    });
  }
}));

export default useProjectStore;
