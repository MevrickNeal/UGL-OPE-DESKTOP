export function formatTime(ms) {
  if (typeof ms === 'string' && ms.includes(':')) {
    return ms; // Already formatted as HH:MM:SS
  }
  let numericMs = typeof ms === 'number' ? ms : parseFloat(ms);
  if (isNaN(numericMs) || numericMs < 0) numericMs = 0;
  
  const totalSeconds = Math.floor(numericMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function ordinalSuffix(n) {
  const s = ["TH", "ST", "ND", "RD"];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${day}${ordinalSuffix(day)}, ${year}`;
}

export function generateFlatNumbers(manifoldConfig = 6, flatsPerManifold = 14) {
  const flats = {};
  let manifoldNames = [];
  
  if (Array.isArray(manifoldConfig)) {
    manifoldNames = manifoldConfig;
  } else if (typeof manifoldConfig === 'number') {
    manifoldNames = Array.from({ length: manifoldConfig }, (_, i) => (i + 1).toString());
  } else if (typeof manifoldConfig === 'string') {
    const parsed = parseInt(manifoldConfig);
    if (!isNaN(parsed) && !manifoldConfig.includes(',')) {
      manifoldNames = Array.from({ length: parsed }, (_, i) => (i + 1).toString());
    } else {
      manifoldNames = manifoldConfig.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  if (manifoldNames.length === 0) {
    manifoldNames = ['1'];
  }

  manifoldNames.forEach((mName, sIdx) => {
    const series = sIdx + 1;
    const isNumeric = /^\d+$/.test(mName);
    
    for (let f = 1; f <= flatsPerManifold; f++) {
      let flatNumber = '';
      if (isNumeric) {
        flatNumber = `${f}${mName.padStart(2, '0')}`; // e.g. 101, 201, 1401
      } else {
        flatNumber = `${f}${mName.toUpperCase()}`; // e.g. 1A, 2A, 14A or 1-A
      }
      flats[flatNumber] = { series, manifoldName: mName, floor: f, active: true };
    }
  });

  return flats;
}

export function getSeriesFlats(allFlats, seriesNumber, manifoldName = null) {
  return Object.keys(allFlats).filter(flatNumber => {
    const f = allFlats[flatNumber];
    if (!f) return false;
    if (manifoldName && f.manifoldName) {
      return String(f.manifoldName).toUpperCase() === String(manifoldName).toUpperCase();
    }
    return String(f.series) === String(seriesNumber) || Number(f.series) === Number(seriesNumber);
  });
}

export function calculateDelta(initial, final) {
  const numInitial = parseFloat(initial);
  const numFinal = parseFloat(final);
  if (isNaN(numInitial) || isNaN(numFinal)) return 0;
  return Math.abs(numFinal - numInitial);
}

// Low pressure 40mbar LPG Commissioning tolerance: 0.001 m³
export function getLpgTestStatus(delta, threshold = 0.001) {
  return delta <= threshold ? 'pass' : 'fail';
}

// 200mbar Vertical Air Test tolerance: 0.003 bar/mbar
export function getVerticalAirTestStatus(delta, threshold = 0.003) {
  return delta <= threshold ? 'pass' : 'fail';
}

export function getTestStatus(delta, threshold = 0.001) {
  return delta <= threshold ? 'pass' : 'fail';
}

export function generateProjectId() {
  return 'proj_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
