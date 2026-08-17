import localforage from 'localforage';
import { saveAs } from 'file-saver';

const LOG_PREFIX = 'ugl_logs_';

export async function appendAuditLog(project, actionType, details) {
  if (!project || !project.id) return;
  const timestamp = new Date().toISOString();
  const logKey = LOG_PREFIX + project.id;
  
  const logEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    timestamp,
    formattedTime: new Date().toLocaleString(),
    projectName: project.areaName || 'RUAP',
    buildingName: project.buildingName || 'Building',
    inspectorName: project.inspectorName || 'Inspector',
    actionType,
    details
  };

  const existingLogs = (await localforage.getItem(logKey)) || [];
  const updatedLogs = [logEntry, ...existingLogs];
  await localforage.setItem(logKey, updatedLogs);
  return logEntry;
}

export async function getAuditLogs(projectId) {
  if (!projectId) return [];
  const logKey = LOG_PREFIX + projectId;
  return (await localforage.getItem(logKey)) || [];
}

/**
 * Exports complete CSV audit log file containing all stage inputs, readings, pressures, and timestamps.
 * Format: Timestamp, Area_Name, Building_Name, Stage_Name, Manifold_Name, Flat_Number, Test_Type, Initial_Reading_Or_Pressure, Final_Reading_Or_Pressure, Delta, Unit, Status, Inspector_Name, Witness_Name, Notes
 */
export function exportAuditLogsToCSV(project) {
  if (!project) return;
  const area = project.areaName || 'RUAP';
  const bldg = project.buildingName || 'BUILDING';
  const inspector = project.inspectorName || 'LIAN MOLLIK';
  const witness = project.witnessName || 'CLIENT WITNESS';

  const headers = [
    'Timestamp',
    'Area_Name',
    'Building_Name',
    'Stage_Name',
    'Manifold_Name',
    'Flat_Number',
    'Test_Type',
    'Initial_Reading_Or_Pressure',
    'Final_Reading_Or_Pressure',
    'Delta',
    'Unit',
    'Status',
    'Inspector_Name',
    'Witness_Name',
    'Notes'
  ];

  const rows = [headers.join(',')];

  const escapeCSV = (str) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  // 1. Isolation Tests (Stages 1-4)
  const iso = project.isolationTests || {};
  Object.keys(iso).forEach(testKey => {
    const data = iso[testKey];
    const timestamp = data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();
    let initial = data.startPressure || data.inletPressure || '0.0';
    let final = data.endPressure || data.outletPressure || '0.0';
    let delta = (parseFloat(final) - parseFloat(initial)).toFixed(2);
    
    rows.push([
      escapeCSV(timestamp),
      escapeCSV(area),
      escapeCSV(bldg),
      escapeCSV('Stages 1-4 Isolation Testing'),
      escapeCSV('Primary Header'),
      escapeCSV('N/A'),
      escapeCSV(testKey.toUpperCase()),
      escapeCSV(initial),
      escapeCSV(final),
      escapeCSV(delta),
      escapeCSV('kg/cm²'),
      escapeCSV(data.status || 'PASS'),
      escapeCSV(inspector),
      escapeCSV(witness),
      escapeCSV(`Target: ${data.targetPressure || '8.0 kg/cm²'}`)
    ].join(','));
  });

  // 2. Stage 5: Vertical Riser Air Test
  const vert = project.verticalAirTests || {};
  Object.keys(vert).forEach(flatNum => {
    const data = vert[flatNum];
    const fConfig = project.flats?.[flatNum] || {};
    const timestamp = data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString();
    const init = data.initialReading || '0.000';
    const final = data.finalReading || '0.000';
    const delta = data.delta !== undefined ? data.delta : Math.abs(parseFloat(final) - parseFloat(init)).toFixed(3);
    
    rows.push([
      escapeCSV(timestamp),
      escapeCSV(area),
      escapeCSV(bldg),
      escapeCSV('Stage 5 Vertical Air Test'),
      escapeCSV(fConfig.manifoldName || String(fConfig.series || '1')),
      escapeCSV(flatNum),
      escapeCSV('Pneumatic Air Test @ 200mbar'),
      escapeCSV(init),
      escapeCSV(final),
      escapeCSV(delta),
      escapeCSV('m³'),
      escapeCSV(data.status === 'pass' ? 'HEALTHY (PASS)' : 'LEAK DETECTED'),
      escapeCSV(inspector),
      escapeCSV(witness),
      escapeCSV('Pre-Gas Pneumatic Verification')
    ].join(','));
  });

  // 3. Stage 6: Air Purging
  if (project.airPurged) {
    rows.push([
      escapeCSV(new Date().toISOString()),
      escapeCSV(area),
      escapeCSV(bldg),
      escapeCSV('Stage 6 Air Purging'),
      escapeCSV('Furthest Manifold (Manifold 1)'),
      escapeCSV('ALL FLATS'),
      escapeCSV('High-Velocity Purge'),
      escapeCSV('AIR'),
      escapeCSV('FLUSHED'),
      escapeCSV('0.000'),
      escapeCSV('BAR'),
      escapeCSV('COMPLETE'),
      escapeCSV(inspector),
      escapeCSV(witness),
      escapeCSV('Air purged from furthest point before LPG introduction')
    ].join(','));
  }

  // 4. Stage 7: LPG Meter Commissioning
  const meters = project.meterTests || {};
  Object.keys(meters).forEach(flatNum => {
    const data = meters[flatNum];
    const fConfig = project.flats?.[flatNum] || {};
    const timestamp = data.finalTime || data.initialTime || new Date().toISOString();
    const init = data.initialReading || '0.000';
    const final = data.finalReading || '0.000';
    const deltaVal = Math.abs(parseFloat(final) - parseFloat(init) || 0);
    const pass = deltaVal <= 0.005;
    const lpgRate = project.lpgRate !== undefined ? project.lpgRate : 150;
    const actualLoss = (deltaVal * lpgRate).toFixed(2);

    rows.push([
      escapeCSV(timestamp),
      escapeCSV(area),
      escapeCSV(bldg),
      escapeCSV('Stage 7 LPG Meter Commissioning'),
      escapeCSV(fConfig.manifoldName || String(fConfig.series || '1')),
      escapeCSV(flatNum),
      escapeCSV('LPG 40mbar Flow Test'),
      escapeCSV(init),
      escapeCSV(final),
      escapeCSV(deltaVal.toFixed(3)),
      escapeCSV('m³'),
      escapeCSV(pass ? 'PASS (FIT FOR HANDOVER)' : 'LEAK (VALVE ISOLATED)'),
      escapeCSV(inspector),
      escapeCSV(witness),
      escapeCSV(pass ? 'Fit for Handover' : `Est Gas Loss: BDT ${actualLoss} (${data.testDurationMinutes || 120}m study)`)
    ].join(','));
  });

  const csvContent = rows.join('\n');
  const safeArea = area.replace(/[^a-z0-9]/gi, '_');
  const safeBuilding = bldg.replace(/[^a-z0-9]/gi, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `LOGS_${safeArea}_${safeBuilding}_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

export function exportAuditLogsToFile(project, logs) {
  const safeArea = (project.areaName || 'RUAP').replace(/[^a-z0-9]/gi, '_');
  const safeBuilding = (project.buildingName || 'Building').replace(/[^a-z0-9]/gi, '_');
  const filename = `LOGS_${safeArea}_${safeBuilding}_${Date.now()}.json`;
  
  const payload = {
    metadata: {
      exportedAt: new Date().toISOString(),
      areaName: project.areaName,
      buildingName: project.buildingName,
      inspectorName: project.inspectorName,
      totalEntries: logs.length
    },
    logs
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  saveAs(blob, filename);
}

export function exportDatabaseBackup(project, logs = []) {
  const safeArea = (project.areaName || 'RUAP').replace(/[^a-z0-9]/gi, '_');
  const safeBuilding = (project.buildingName || 'Building').replace(/[^a-z0-9]/gi, '_');
  const filename = `UGL_DB_BACKUP_${safeArea}_${safeBuilding}_${Date.now()}.json`;

  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project,
    logs
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  saveAs(blob, filename);
}

export async function importDatabaseBackup(fileContent, storeActions) {
  try {
    const data = JSON.parse(fileContent);
    
    // Support both wrapped format { project: {...} } and direct project format { id: '...', areaName: '...' }
    const project = data.project || (data.id || data.areaName ? data : null);

    if (!project || (!project.id && !project.areaName)) {
      throw new Error('Invalid database backup format. Please select a valid .json or .ugl project file.');
    }

    if (!project.id) {
      project.id = 'proj_' + Date.now().toString(36);
    }

    // Ensure project.flats has valid flats config
    if (!project.flats || Object.keys(project.flats).length === 0) {
      const manifoldCount = project.manifoldCount || 6;
      const flatsPerManifold = project.flatsPerManifold || 14;
      project.flats = {};
      for (let s = 1; s <= manifoldCount; s++) {
        for (let f = 1; f <= flatsPerManifold; f++) {
          const flatNum = `${f}${s.toString().padStart(2, '0')}`;
          project.flats[flatNum] = { series: s, floor: f, manifoldName: str(s), active: true };
        }
      }
    }
    
    // Save imported project into localforage under ugl_project_[id] and ugl_active_project
    await localforage.setItem('ugl_project_' + project.id, project);
    await localforage.setItem('ugl_active_project', project);
    
    // Update project list
    const projectList = (await localforage.getItem('ugl_projects_list')) || [];
    const summary = {
      id: project.id,
      name: project.areaName || 'Imported Site',
      building: project.buildingName || 'Building',
      createdAt: project.createdAt || Date.now(),
      updatedAt: Date.now()
    };
    
    const updatedList = [summary, ...projectList.filter(p => p.id !== project.id)];
    await localforage.setItem('ugl_projects_list', updatedList);

    // Save logs if present
    if (Array.isArray(data.logs)) {
      await localforage.setItem(LOG_PREFIX + project.id, data.logs);
    }

    // Reload store
    if (storeActions.loadProjectList) await storeActions.loadProjectList();
    if (storeActions.loadProject) await storeActions.loadProject(project.id);
    
    return { success: true, project };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
