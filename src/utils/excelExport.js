import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Helper to evaluate isolation test status
function evaluateIsolationTestStatus(test) {
  if (!test) return 'PENDING';
  if (test.status === 'pass' || test.status === 'complete') return 'OK';
  if (test.status === 'fail') return 'LEAKAGE';
  if (test.startPressure !== undefined && test.startPressure !== '' && test.endPressure !== undefined && test.endPressure !== '') {
    const startP = parseFloat(test.startPressure);
    const endP = parseFloat(test.endPressure);
    if (!isNaN(startP) && !isNaN(endP)) {
      return endP >= startP ? 'OK' : 'LEAKAGE';
    }
  }
  return 'PENDING';
}

export async function exportTestReport(project) {
  const workbook = new ExcelJS.Workbook();
  
  // Format Date String matching template: e.g. AUG 15TH, 2026
  const dateObj = new Date();
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = dateObj.getDate();
  let suffix = 'TH';
  if (day === 1 || day === 21 || day === 31) suffix = 'ST';
  else if (day === 2 || day === 22) suffix = 'ND';
  else if (day === 3 || day === 23) suffix = 'RD';
  const dateString = `${months[dateObj.getMonth()]} ${day}${suffix}, ${dateObj.getFullYear()}`;
  const shortDateString = `${months[dateObj.getMonth()]} ${day}${suffix}`;

  const bldgName = (project?.buildingName || 'SHAPLA BUILDING 13B').trim();
  const areaName = (project?.areaName || 'RUAP').trim();
  const sheetName = `TEST REPORT 13-B`;
  
  const sheet = workbook.addWorksheet(sheetName);

  // Column widths matching reference template
  sheet.getColumn('A').width = 2.66;
  sheet.getColumn('B').width = 12.66;
  sheet.getColumn('C').width = 41.0;
  sheet.getColumn('D').width = 27.44;
  sheet.getColumn('E').width = 20.66;
  sheet.getColumn('F').width = 8.66;
  sheet.getColumn('G').width = 18.66;
  sheet.getColumn('H').width = 28.66;
  sheet.getColumn('I').width = 42.55;
  sheet.getColumn('J').width = 21.44;
  sheet.getColumn('K').width = 16.11;

  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const isolationTests = project?.isolationTests || {};
  const flatsData = project?.flats || {};
  const meterTests = project?.meterTests || {};
  const manifoldCount = project?.manifoldCount || 6;
  const flatsPerManifold = project?.flatsPerManifold || 14;

  // Evaluate Section A (Storage Network) status
  const bankAStatus = evaluateIsolationTestStatus(isolationTests.bankA);
  const bankBStatus = evaluateIsolationTestStatus(isolationTests.bankB);
  let sectionAStatus = 'OK';
  if (bankAStatus === 'LEAKAGE' || bankBStatus === 'LEAKAGE') {
    sectionAStatus = 'LEAKAGE';
  } else if (bankAStatus === 'PENDING' || bankBStatus === 'PENDING') {
    sectionAStatus = 'PENDING';
  }

  // Evaluate Section B (Up-Stream Distribution Pipeline) status
  const regStatus = evaluateIsolationTestStatus(isolationTests.regulator);
  const mainLineStatus = evaluateIsolationTestStatus(isolationTests.mainLine);
  let sectionBStatus = 'OK';
  if (regStatus === 'LEAKAGE' || mainLineStatus === 'LEAKAGE') {
    sectionBStatus = 'LEAKAGE';
  } else if (regStatus === 'PENDING' || mainLineStatus === 'PENDING') {
    sectionBStatus = 'PENDING';
  }

  // Row 1: Main Header (B1:K1 merged)
  sheet.getRow(1).height = 34.05;
  sheet.mergeCells('B1:K1');
  const titleCell = sheet.getCell('B1');
  titleCell.value = 'URBAN GAZ LIMITED';
  titleCell.font = { name: 'Calibri', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 2: Spacer
  sheet.getRow(2).height = 24;

  // Row 3: Sub Header with Building & Area Name
  sheet.getRow(3).height = 19.95;
  sheet.mergeCells('B3:E3');
  const subTitle = sheet.getCell('B3');
  subTitle.value = `SUB # MAINTENANCE SUMMARY @ ${bldgName.toUpperCase()}, ${areaName.toUpperCase()}`;
  subTitle.font = { name: 'Calibri', size: 12, bold: true };
  
  sheet.mergeCells('J3:K3');
  const updatedText = sheet.getCell('J3');
  updatedText.value = `UPDATED @ ${dateString}`;
  updatedText.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
  updatedText.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
  updatedText.alignment = { vertical: 'middle', horizontal: 'center' };

  // Row 4: Spacer
  sheet.getRow(4).height = 24;

  // Row 5-6: Section A Header
  sheet.getRow(5).height = 19.95;
  sheet.getRow(6).height = 19.95;
  sheet.mergeCells('B5:B6');
  const aCell = sheet.getCell('B5');
  aCell.value = 'A';
  aCell.font = { name: 'Calibri', size: 14, bold: true };
  aCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('C5:C6');
  const aTitle = sheet.getCell('C5');
  aTitle.value = 'RETICULATED GAS STORAGE NETWROK';
  aTitle.font = { name: 'Calibri', size: 12, bold: true };
  aTitle.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

  sheet.mergeCells('D5:H5');
  const aStatHead = sheet.getCell('D5');
  aStatHead.value = 'STATUS';
  aStatHead.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  aStatHead.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002060' } };
  aStatHead.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('D6:H6');
  const aStat = sheet.getCell('D6');
  aStat.value = sectionAStatus;
  aStat.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  aStat.fill = { 
    type: 'pattern', 
    pattern: 'solid', 
    fgColor: { argb: sectionAStatus === 'OK' ? 'FF00B050' : (sectionAStatus === 'LEAKAGE' ? 'FFFF0000' : 'FFF5B731') } 
  };
  aStat.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('I5:I8');
  const remHead = sheet.getCell('I5');
  remHead.value = 'REMARKS';
  remHead.font = { name: 'Calibri', size: 12, bold: true };
  remHead.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('J5:K5');
  const dateArea = sheet.getCell('J5');
  dateArea.value = shortDateString;
  dateArea.font = { name: 'Calibri', size: 11, bold: true };
  dateArea.alignment = { vertical: 'middle', horizontal: 'center' };
  
  sheet.getCell('J6').value = 'M1';
  sheet.getCell('K6').value = 'M2';
  ['J6', 'K6'].forEach(cellId => {
    const c = sheet.getCell(cellId);
    c.font = { name: 'Calibri', size: 11, bold: true };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Row 7-8: Section B Header
  sheet.getRow(7).height = 19.95;
  sheet.getRow(8).height = 19.95;
  sheet.mergeCells('B7:B8');
  const bCell = sheet.getCell('B7');
  bCell.value = 'B';
  bCell.font = { name: 'Calibri', size: 14, bold: true };
  bCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('C7:C8');
  const bTitle = sheet.getCell('C7');
  bTitle.value = 'UP-STREAM DISTRIBUTION PIPELINE';
  bTitle.font = { name: 'Calibri', size: 12, bold: true };
  bTitle.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

  sheet.mergeCells('D7:H7');
  const bStatHead = sheet.getCell('D7');
  bStatHead.value = 'STATUS';
  bStatHead.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  bStatHead.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7030A0' } };
  bStatHead.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells('D8:H8');
  const bStat = sheet.getCell('D8');
  bStat.value = sectionBStatus;
  bStat.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  bStat.fill = { 
    type: 'pattern', 
    pattern: 'solid', 
    fgColor: { argb: sectionBStatus === 'OK' ? 'FF00B050' : (sectionBStatus === 'LEAKAGE' ? 'FFFF0000' : 'FFF5B731') } 
  };
  bStat.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.getCell('J7').value = 'M1';
  sheet.getCell('K7').value = 'M2';
  sheet.getCell('J8').value = 'M1';
  sheet.getCell('K8').value = 'M2';
  ['J7', 'K7', 'J8', 'K8'].forEach(cellId => {
    const c = sheet.getCell(cellId);
    c.font = { name: 'Calibri', size: 11, bold: true };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const namesInput = project?.manifoldNamesInput
    ? project.manifoldNamesInput.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Dynamic Manifolds Construction (Reverse Order C{N} .. C1)
  const seriesList = [];
  for (let s = manifoldCount; s >= 1; s--) {
    seriesList.push(s);
  }

  let currentRow = 10;
  const sectionCStartRow = 9;

  const firstLabel = namesInput[seriesList[0] - 1] || `${seriesList[0] || 1}`;

  // Header Row 9 (Section C Master Header)
  sheet.getRow(9).height = 19.95;
  sheet.getCell('D9').value = 'SUB-SECTION OF C';
  sheet.getCell('E9').value = 'STATUS';
  sheet.mergeCells('F9:G9');
  sheet.getCell('F9').value = `SUB-SECTION OF C${firstLabel.toUpperCase()}`;
  sheet.mergeCells('H9:K9');
  sheet.getCell('H9').value = 'STATUS';
  ['D', 'E', 'F', 'H'].forEach(col => {
    const cell = sheet.getCell(`${col}9`);
    cell.font = { name: 'Calibri', size: 11, bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  seriesList.forEach((seriesNum, sIdx) => {
    const startRow = currentRow;
    const endRow = startRow + flatsPerManifold - 1;
    const label = namesInput[seriesNum - 1] || `${seriesNum}`;
    const manifoldName = `MANIFOLD C${label.toUpperCase()}`;

    if (sIdx > 0) {
      // Sub-header row for subsequent manifolds
      const headerRowIdx = startRow - 1;
      sheet.getRow(headerRowIdx).height = 19.95;
      sheet.getCell(`D${headerRowIdx}`).value = manifoldName;
      sheet.getCell(`E${headerRowIdx}`).value = 'STATUS';
      sheet.mergeCells(`F${headerRowIdx}:G${headerRowIdx}`);
      sheet.getCell(`F${headerRowIdx}`).value = `SUB-SECTION OF C${label.toUpperCase()}`;
      sheet.mergeCells(`H${headerRowIdx}:K${headerRowIdx}`);
      sheet.getCell(`H${headerRowIdx}`).value = 'STATUS';

      ['D', 'E', 'F', 'H'].forEach(col => {
        const cell = sheet.getCell(`${col}${headerRowIdx}`);
        cell.font = { name: 'Calibri', size: 11, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }

    // Merge Manifold Name across block rows
    sheet.mergeCells(`D${startRow}:D${endRow}`);
    const mNameCell = sheet.getCell(`D${startRow}`);
    mNameCell.value = manifoldName;
    mNameCell.font = { name: 'Calibri', size: 12, bold: true };
    mNameCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Evaluate manifold isolation test status
    const mIsolationData = isolationTests[`manifold${seriesNum}`] || isolationTests?.manifolds?.[`manifold-${seriesNum}`];
    const mStatus = evaluateIsolationTestStatus(mIsolationData);

    // Merge Manifold Status across block rows
    sheet.mergeCells(`E${startRow}:E${endRow}`);
    const mStatCell = sheet.getCell(`E${startRow}`);
    mStatCell.value = mStatus;
    mStatCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    mStatCell.fill = { 
      type: 'pattern', 
      pattern: 'solid', 
      fgColor: { argb: mStatus === 'OK' ? 'FF00B050' : (mStatus === 'LEAKAGE' ? 'FFFF0000' : 'FFF5B731') } 
    };
    mStatCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Populate flats for this series
    for (let f = 1; f <= flatsPerManifold; f++) {
      const rowIdx = startRow + (f - 1);
      const flatNum = Object.keys(flatsData).find(key => {
        const item = flatsData[key];
        return item && (String(item.series) === String(seriesNum) || Number(item.series) === Number(seriesNum)) && Number(item.floor) === Number(f);
      }) || `${f}${label.toUpperCase()}`;
      const fConfig = flatsData[flatNum] || { active: true };
      const mTest = meterTests[flatNum] || {};

      sheet.getRow(rowIdx).height = 14.55;

      // F: Serial Number
      const fCell = sheet.getCell(`F${rowIdx}`);
      fCell.value = f;
      fCell.font = { name: 'Calibri', size: 11, bold: true };
      fCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // G: Vertical @ flat
      const gCell = sheet.getCell(`G${rowIdx}`);
      gCell.value = `VERTICAL @ ${flatNum}`;
      gCell.font = { name: 'Calibri', size: 11, bold: true };
      gCell.alignment = { vertical: 'middle', horizontal: 'right' };

      // H: Active Status / Primary Status
      const hCell = sheet.getCell(`H${rowIdx}`);
      const delta = mTest.delta !== undefined ? parseFloat(mTest.delta) : null;

      if (fConfig.active === false) {
        hCell.value = 'INACTIVE FLAT';
        hCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      } else if (delta !== null) {
        if (delta <= 0.001) {
          hCell.value = 'OK';
          hCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
          hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
        } else {
          hCell.value = 'VERTICAL LEAKAGE';
          hCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
          hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        }
      } else {
        hCell.value = mTest.status === 'pass' ? 'OK' : 'PENDING';
        hCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        hCell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: mTest.status === 'pass' ? 'FF00B050' : 'FFF5B731' } 
        };
      }
      hCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // I: Secondary Remarks / Maintenance Notes (e.g. BALL VALVE REPLACED, SOCKET REPAIRED)
      const iCell = sheet.getCell(`I${rowIdx}`);
      if (fConfig.active === false) {
        iCell.value = '';
        iCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      } else {
        iCell.value = mTest.remark ? String(mTest.remark).toUpperCase() : '';
      }
      iCell.font = { name: 'Calibri', size: 11, bold: true };
      iCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // J: Initial Reading (M1)
      const jCell = sheet.getCell(`J${rowIdx}`);
      if (fConfig.active === false) {
        jCell.value = '';
        jCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      } else {
        jCell.value = mTest.initialReading !== undefined && mTest.initialReading !== '' ? (parseFloat(mTest.initialReading) || mTest.initialReading) : '';
        if (delta !== null && delta <= 0.005) {
          jCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
          jCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        }
      }
      jCell.alignment = { vertical: 'middle', horizontal: 'center' };

      // K: Final Reading (M2)
      const kCell = sheet.getCell(`K${rowIdx}`);
      if (fConfig.active === false) {
        kCell.value = '';
        kCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      } else {
        kCell.value = mTest.finalReading !== undefined && mTest.finalReading !== '' ? (parseFloat(mTest.finalReading) || mTest.finalReading) : '';
        if (delta !== null && delta <= 0.005) {
          kCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B050' } };
          kCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        }
      }
      kCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }

    currentRow = endRow + 2; // Move to next manifold block (leaving 1 header row)
  });

  const sectionCEndRow = currentRow - 2;

  // Merge Section C Master Label (B9:B{endRow} & C9:C{endRow})
  sheet.mergeCells(`B9:B${sectionCEndRow}`);
  const cCell = sheet.getCell('B9');
  cCell.value = 'C';
  cCell.font = { name: 'Calibri', size: 14, bold: true };
  cCell.alignment = { vertical: 'middle', horizontal: 'center' };

  sheet.mergeCells(`C9:C${sectionCEndRow}`);
  const cTitle = sheet.getCell('C9');
  cTitle.value = 'GAS FLOW METERING MANIFOLD';
  cTitle.font = { name: 'Calibri', size: 12, bold: true };
  cTitle.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

  // Apply thin borders to all active data cells (B to K)
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber <= sectionCEndRow) {
      for (let c = 2; c <= 11; c++) {
        const cell = row.getCell(c);
        cell.border = thinBorder;
      }
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const safeBuilding = bldgName.replace(/[^a-z0-9]/gi, '_');
  const safeArea = areaName.replace(/[^a-z0-9]/gi, '_');

  const filename = `R.X REPORT - MAINTENANCE @ ${safeBuilding}, ${safeArea} (${dateString}).xlsx`;
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
}
