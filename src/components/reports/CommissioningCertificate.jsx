import React, { useState } from 'react';
import { Award, Download, Printer, X, FileText, CheckCircle2, Layers } from 'lucide-react';
import { generateCommissioningPdf, generateAllFlatsCommissioningPdf } from '../../utils/pdfExport';
import { formatDate } from '../../utils/helpers';

const CommissioningCertificate = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null;

  const flatsConfig = project?.flats || {};
  const activeFlatsList = Object.keys(flatsConfig).filter(k => flatsConfig[k].active !== false);

  const [selectedFlatNum, setSelectedFlatNum] = useState(activeFlatsList[0] || '101');

  const areaName = project?.areaName || 'RUAP, UTTARA - 18, DHAKA';
  const buildingName = project?.buildingName || '13A - SHAPLA BUILDING';
  const fullAddress = `${buildingName}, ${areaName}`.toUpperCase();

  const inspectorName = (project?.inspectorName || 'INSPECTOR NAME').toUpperCase();
  const inspectorDesignation = (project?.inspectorDesignation || 'TECH CO-ORDINATOR').toUpperCase();
  const witnessName = (project?.witnessName || 'CLIENT WITNESS').toUpperCase();
  const dateStr = formatDate(Date.now());

  const meterTests = project?.meterTests || {};
  const currentTestData = meterTests[selectedFlatNum] || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSingle = () => {
    generateCommissioningPdf(project, selectedFlatNum);
  };

  const handleDownloadAll = () => {
    generateAllFlatsCommissioningPdf(project);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:rounded-none">
        
        {/* Modal Controls Bar (Hidden during Print) */}
        <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl text-[#F15A24]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-outfit text-lg md:text-xl font-bold text-slate-800">
                PNEUMATIC HANDOVER CERTIFICATE GENERATOR
              </h2>
              <p className="text-slate-500 text-xs">
                Generates 100% picture-perfect official handover certificates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Flat Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500">Flat:</span>
              <select
                value={selectedFlatNum}
                onChange={(e) => setSelectedFlatNum(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                {activeFlatsList.map(fNum => (
                  <option key={fNum} value={fNum}>
                    Flat {fNum}
                  </option>
                ))}
              </select>
            </div>

            {/* Download Single Flat PDF */}
            <button
              onClick={handleDownloadSingle}
              className="px-3.5 py-2 bg-[#0D6B6E] hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm btn-press cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Flat {selectedFlatNum} PDF
            </button>

            {/* Download All Tested Flats PDF Package */}
            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-2 bg-[#F15A24] hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm btn-press cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Download ALL ({activeFlatsList.length}) Flats PDF Package
            </button>

            {/* Print Current Flat */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm btn-press cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page Area */}
        <div className="p-8 md:p-12 overflow-y-auto flex-1 font-sans text-slate-900 bg-white print:p-0 print:overflow-visible">
          <div className="max-w-[700px] mx-auto border border-slate-300 p-8 md:p-12 shadow-sm bg-white print:border-none print:shadow-none print:p-0">
            
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl md:text-2xl font-bold font-helvetica tracking-wide uppercase">
                PRESSURE TEST REPORT
              </h1>
            </div>

            {/* Meta Table Block */}
            <div className="mb-6 border-b border-slate-200 pb-4 text-xs font-mono space-y-1.5">
              <div className="flex">
                <span className="w-48 font-bold text-slate-700">PROJECT NAME / ADDRESS</span>
                <span className="w-6 text-center font-bold">:</span>
                <span className="flex-1 font-bold text-slate-900">{fullAddress}</span>
              </div>
              <div className="flex">
                <span className="w-48 font-bold text-slate-700">FLAT NUMBER</span>
                <span className="w-6 text-center font-bold">:</span>
                <span className="flex-1 font-bold text-slate-900">FLAT {selectedFlatNum}</span>
              </div>
              <div className="flex">
                <span className="w-48 font-bold text-slate-700">TEST DOMAIN</span>
                <span className="w-6 text-center font-bold">:</span>
                <span className="flex-1 text-slate-800">VERTICAL PIPE LINE [METER - KITCHEN]</span>
              </div>
              <div className="flex">
                <span className="w-48 font-bold text-slate-700">TEST PRESSURES</span>
                <span className="w-6 text-center font-bold">:</span>
                <span className="flex-1 text-slate-800">40 MILIBAR</span>
              </div>
              <div className="flex">
                <span className="w-48 font-bold text-slate-700">TEST MEDIUM</span>
                <span className="w-6 text-center font-bold">:</span>
                <span className="flex-1 text-slate-800">LPG & SOAP WATER</span>
              </div>
              <div className="flex">
                <span className="w-48 font-bold text-slate-700">TEST EQUIPMENT</span>
                <span className="w-6 text-center font-bold">:</span>
                <span className="flex-1 text-slate-800">LPG FLOW METER & ASSOCIATED FITTINGS.</span>
              </div>
            </div>

            {/* Particulars Grid */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-black p-2 text-left" rowSpan={2}>PARTICULARS</th>
                    <th className="border border-black p-1 text-center" colSpan={3}>START - M1</th>
                    <th className="border border-black p-1 text-center" colSpan={3}>END - M2</th>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-[10px]">
                    <th className="border border-black p-1 text-center">DATE</th>
                    <th className="border border-black p-1 text-center">TIME [HR]</th>
                    <th className="border border-black p-1 text-center">METER READING</th>
                    <th className="border border-black p-1 text-center">DATE</th>
                    <th className="border border-black p-1 text-center">TIME [HR]</th>
                    <th className="border border-black p-1 text-center">METER READING</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2 font-bold">VERTICAL LINE</td>
                    <td className="border border-black p-1.5 text-center font-mono">{dateStr}</td>
                    <td className="border border-black p-1.5 text-center font-mono">0.0</td>
                    <td className="border border-black p-1.5 text-center font-mono font-bold">{currentTestData.initialReading || '0.000'} m³</td>
                    <td className="border border-black p-1.5 text-center font-mono">{dateStr}</td>
                    <td className="border border-black p-1.5 text-center font-mono">{((currentTestData.testDurationMinutes || 120) / 60).toFixed(1)}</td>
                    <td className="border border-black p-1.5 text-center font-mono font-bold">{currentTestData.finalReading || '0.000'} m³</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* General Precautions Section */}
            <div className="mb-6 space-y-2 text-[10px] leading-relaxed text-slate-800">
              <h3 className="font-bold text-slate-900">GENERAL PRECAUTIONS @</h3>
              <p>01. The vertical pipeline [from LPG flow meter to kitchen] has been pressure-tested and found leak-free at the time of handover.</p>
              <p>02. The user shall periodically inspect inhouse gas appliances, flexible hoses, valves & internal piping and immediately report any suspected gas leakage or abnormal gas consumption.</p>
              <p>03. Any leakage, damage or gas loss arising after commissioning due to aging, unauthorized alterations, third-party work, appliance failure, misuse, negligence or lack of maintenance shall be the sole responsibility of the user.</p>
              <p>04. Urban Gaz Limited shall not be liable for any additional gas consumption, property damage, personal injury or financial loss resulting from leakage or defects occurring beyond the certified handover condition unless caused by negligence attributable to Urban Gaz.</p>
              <p>05. In the event of suspected gas leakage, the user shall immediately close the meter isolation valve, refrain from operating electrical switches or ignition sources, ventilate the area and notify Urban Gaz Limited without delay.</p>
              <p>06. This pressure test certifies the condition of the pipeline only at the time of testing & handover and shall not be construed as a continuing warranty against future leakage or deterioration.</p>
            </div>

            {/* Disclaimer Note */}
            <div className="mb-12 text-[10px] leading-relaxed text-slate-800 font-bold border-t border-b border-slate-200 py-3">
              <p><span className="underline">NOTE @</span> By signing this report, the user acknowledges that the vertical pipeline was pressure-tested and accepted in satisfactory condition at the time of handover. Any leakage, gas loss or damage occurring after commissioning, except where directly attributable to Urban Gaz Limited's negligence, shall remain the sole responsibility of the user.</p>
            </div>

            {/* 2-Column Signatory Block */}
            <div className="grid grid-cols-2 gap-8 text-[11px] font-mono pt-4">
              {/* Left Column: TEST PERFORMED BY */}
              <div className="space-y-2">
                <h4 className="font-bold border-b border-black pb-1">TEST PERFORMED BY</h4>
                <div><span className="font-bold">NAME                    :</span> {inspectorName}</div>
                <div><span className="font-bold">DESIGNATION     :</span> {inspectorDesignation}</div>
                <div><span className="font-bold">ON BEHALF OF   :</span> URBAN GAZ LIMITED</div>
                <div className="pt-6"><span className="font-bold">SIGNATURE         :</span> ______________________</div>
              </div>

              {/* Right Column: WITNESSED BY */}
              <div className="space-y-2">
                <h4 className="font-bold border-b border-black pb-1">WITNESSED BY</h4>
                <div><span className="font-bold">SIGNATURE         :</span> ______________________</div>
                <div><span className="font-bold">NAME                    :</span> {witnessName}</div>
                <div><span className="font-bold">CONTACT             :</span> ______________________</div>
                <div><span className="font-bold">DATE                    :</span> {dateStr}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CommissioningCertificate;
