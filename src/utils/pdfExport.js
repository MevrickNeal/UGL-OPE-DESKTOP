import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './helpers.js';

function renderSingleFlatCertificate(doc, project, flatNum) {
  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const margin = 50;

  const areaName = project?.areaName || 'RUAP, UTTARA - 18, DHAKA';
  const buildingName = project?.buildingName || '13A - SHAPLA BUILDING';
  const fullAddress = `${buildingName}, ${areaName}`.toUpperCase();
  
  const meterTests = project?.meterTests || {};
  const testData = meterTests[flatNum] || {};
  
  const inspectorName = (project?.inspectorName || 'INSPECTOR NAME').toUpperCase();
  const inspectorDesignation = (project?.inspectorDesignation || 'TECH CO-ORDINATOR').toUpperCase();
  const witnessName = (project?.witnessName || 'CLIENT WITNESS').toUpperCase();
  const dateStr = formatDate(Date.now());

  // 1. Header Title: PRESSURE TEST REPORT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('PRESSURE TEST REPORT', pageWidth / 2, 65, { align: 'center' });

  // 2. Meta Table (Label : Value)
  const metaRows = [
    [
      { content: 'PROJECT NAME / ADDRESS', styles: { fontStyle: 'bold' } },
      ':',
      { content: fullAddress }
    ],
    [
      { content: 'FLAT NUMBER', styles: { fontStyle: 'bold' } },
      ':',
      { content: `FLAT ${flatNum}` }
    ],
    [
      { content: 'TEST DOMAIN', styles: { fontStyle: 'bold' } },
      ':',
      { content: 'VERTICAL PIPE LINE [METER - KITCHEN]' }
    ],
    [
      { content: 'TEST PRESSURES', styles: { fontStyle: 'bold' } },
      ':',
      { content: '40 MILIBAR' }
    ],
    [
      { content: 'TEST MEDIUM', styles: { fontStyle: 'bold' } },
      ':',
      { content: 'LPG & SOAP WATER' }
    ],
    [
      { content: 'TEST EQUIPMENT', styles: { fontStyle: 'bold' } },
      ':',
      { content: 'LPG FLOW METER & ASSOCIATED FITTINGS.' }
    ]
  ];

  autoTable(doc, {
    startY: 85,
    margin: { left: margin, right: margin },
    body: metaRows,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 3, textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 160 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 320 }
    }
  });

  let currentY = doc.lastAutoTable.finalY + 15;

  // 3. Particulars Table (START - M1 vs END - M2)
  const initReading = testData.initialReading || '0.000';
  const finalReading = testData.finalReading || '0.000';
  const durationMins = testData.testDurationMinutes || 120;
  const durationHours = (durationMins / 60).toFixed(1);

  const particularsHead = [
    [
      { content: 'PARTICULARS', rowSpan: 2, styles: { halign: 'left', valign: 'middle', fontStyle: 'bold' } },
      { content: 'START - M1', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: 'END - M2', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } }
    ],
    [
      { content: 'DATE', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'TIME [HR]', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'METER READING', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'DATE', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'TIME [HR]', styles: { fontStyle: 'bold', halign: 'center' } },
      { content: 'METER READING', styles: { fontStyle: 'bold', halign: 'center' } }
    ]
  ];

  const particularsBody = [
    [
      { content: 'VERTICAL LINE', styles: { fontStyle: 'bold' } },
      dateStr,
      '0.0',
      `${initReading} m³`,
      dateStr,
      `${durationHours}`,
      `${finalReading} m³`
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: particularsHead,
    body: particularsBody,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 8, lineWidth: 0.5, strokeColor: [0, 0, 0] },
    bodyStyles: { fontSize: 8, halign: 'center', lineWidth: 0.5, strokeColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 115, halign: 'left' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // 4. General Precautions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('GENERAL PRECAUTIONS @', margin, currentY);

  currentY += 14;

  const precautions = [
    "01. The vertical pipeline [from LPG flow meter to kitchen] has been pressure-tested and found leak-free at the time of handover.",
    "02. The user shall periodically inspect inhouse gas appliances, flexible hoses, valves & internal piping and immediately report any suspected gas leakage or abnormal gas consumption.",
    "03. Any leakage, damage or gas loss arising after commissioning due to aging, unauthorized alterations, third-party work, appliance failure, misuse, negligence or lack of maintenance shall be the sole responsibility of the user.",
    "04. Urban Gaz Limited shall not be liable for any additional gas consumption, property damage, personal injury or financial loss resulting from leakage or defects occurring beyond the certified handover condition unless caused by negligence attributable to Urban Gaz.",
    "05. In the event of suspected gas leakage, the user shall immediately close the meter isolation valve, refrain from operating electrical switches or ignition sources, ventilate the area and notify Urban Gaz Limited without delay.",
    "06. This pressure test certifies the condition of the pipeline only at the time of testing & handover and shall not be construed as a continuing warranty against future leakage or deterioration."
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  precautions.forEach(p => {
    const lines = doc.splitTextToSize(p, pageWidth - (margin * 2));
    doc.text(lines, margin, currentY);
    currentY += lines.length * 10 + 4;
  });

  currentY += 6;

  // 5. Disclaimer Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const noteText = "NOTE @ By signing this report, the user acknowledges that the vertical pipeline was pressure-tested and accepted in satisfactory condition at the time of handover. Any leakage, gas loss or damage occurring after commissioning, except where directly attributable to Urban Gaz Limited's negligence, shall remain the sole responsibility of the user.";
  const noteLines = doc.splitTextToSize(noteText, pageWidth - (margin * 2));
  doc.text(noteLines, margin, currentY);

  currentY += noteLines.length * 10 + 25;

  // 6. Signatory Block (2 Columns: TEST PERFORMED BY vs WITNESSED BY)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');

  // Left Column
  doc.text('TEST PERFORMED BY', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`NAME                    : ${inspectorName}`, margin, currentY + 16);
  doc.text(`DESIGNATION     : ${inspectorDesignation}`, margin, currentY + 30);
  doc.text('ON BEHALF OF   : URBAN GAZ LIMITED', margin, currentY + 44);
  doc.text('SIGNATURE         : ______________________', margin, currentY + 58);

  // Right Column
  const rightColX = 350;
  doc.setFont('helvetica', 'bold');
  doc.text('WITNESSED BY', rightColX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('SIGNATURE         : ______________________', rightColX, currentY + 16);
  doc.text(`NAME                    : ${witnessName}`, rightColX, currentY + 30);
  doc.text('CONTACT             : ______________________', rightColX, currentY + 44);
  doc.text(`DATE                    : ${dateStr}`, rightColX, currentY + 58);
}

// Generate single flat certificate PDF
export function generateCommissioningPdf(project, selectedFlatNum = null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const flatsConfig = project?.flats || {};
  const activeFlatsList = Object.keys(flatsConfig).filter(k => flatsConfig[k].active !== false);
  const targetFlat = selectedFlatNum || activeFlatsList[0] || '101';

  renderSingleFlatCertificate(doc, project, targetFlat);

  const safeBuilding = (project?.buildingName || 'BUILDING').replace(/[^a-z0-9]/gi, '_');
  doc.save(`TEST_REPORT_PNEUMATIC_${safeBuilding}_FLAT_${targetFlat}.pdf`);
}

// Generate bulk multi-page PDF package containing certificates for ALL active/tested flats
export function generateAllFlatsCommissioningPdf(project) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const flatsConfig = project?.flats || {};
  const activeFlatsList = Object.keys(flatsConfig).filter(k => flatsConfig[k].active !== false);

  if (activeFlatsList.length === 0) {
    activeFlatsList.push('101');
  }

  activeFlatsList.forEach((flatNum, index) => {
    if (index > 0) {
      doc.addPage();
    }
    renderSingleFlatCertificate(doc, project, flatNum);
  });

  const safeBuilding = (project?.buildingName || 'BUILDING').replace(/[^a-z0-9]/gi, '_');
  doc.save(`ALL_FLATS_HANDOVER_CERTIFICATES_${safeBuilding}_(${activeFlatsList.length}_FLATS).pdf`);
}
