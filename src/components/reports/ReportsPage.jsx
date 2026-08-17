import React, { useState } from 'react';
import { FileSpreadsheet, Award, Plus, FileText, CheckCircle2, Layers, Download } from 'lucide-react';
import useProjectStore from '../../store/useProjectStore';
import { exportTestReport } from '../../utils/excelExport';
import { generateCommissioningPdf, generateAllFlatsCommissioningPdf } from '../../utils/pdfExport';
import CommissioningCertificate from './CommissioningCertificate';
import { useToast } from '../ui/ToastBanner';

const ReportsPage = () => {
  const project = useProjectStore((state) => state.project);
  const addInspectionSession = useProjectStore((state) => state.addInspectionSession);
  const [showCertModal, setShowCertModal] = useState(false);
  const { showToast } = useToast();

  const flatsConfig = project?.flats || {};
  const activeFlatsCount = Object.keys(flatsConfig).filter(k => flatsConfig[k].active !== false).length;

  const handleExportExcel = async () => {
    try {
      await exportTestReport(project);
      showToast({ type: 'success', title: 'Export Successful', message: 'Pixel-perfect Excel report exported.' });
    } catch (error) {
      showToast({ type: 'error', title: 'Export Failed', message: error.message });
    }
  };

  const handleExportPdfSingle = () => {
    try {
      generateCommissioningPdf(project);
      showToast({ type: 'success', title: 'Single PDF Certificate Exported', message: 'LPG Flat Handover PDF Certificate generated.' });
    } catch (error) {
      showToast({ type: 'error', title: 'PDF Export Failed', message: error.message });
    }
  };

  const handleExportPdfAll = () => {
    try {
      generateAllFlatsCommissioningPdf(project);
      showToast({ type: 'success', title: 'All Flats PDF Package Exported', message: `Multi-page PDF package containing all ${activeFlatsCount} flat certificates generated.` });
    } catch (error) {
      showToast({ type: 'error', title: 'PDF Package Export Failed', message: error.message });
    }
  };

  const handleAddSession = () => {
    const label = prompt("Enter inspection session date label (e.g., 'AUG 14TH'):");
    if (label) {
      if (addInspectionSession) addInspectionSession(label);
      showToast({ type: 'success', title: 'Session Added', message: `Session ${label} created.` });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 font-inter">
      <div>
        <h1 className="text-3xl font-outfit font-bold text-slate-800">REPORTS & CERTIFICATION EXPORT</h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate pixel-perfect Excel maintenance reports and individual / bulk official PDF Handover Certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Excel Export Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between space-y-4 interactive-card">
          <div>
            <div className="p-3 bg-green-50 rounded-xl w-fit mb-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-outfit font-bold text-slate-800">Excel Maintenance Report (.xlsx)</h2>
            <p className="text-slate-500 text-xs mt-1">
              Exact cell-for-cell duplicate of company template (merged headers, M1/M2/T1/T2 columns, color flags).
            </p>
          </div>
          <button 
            onClick={handleExportExcel} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors w-full btn-press cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
        </div>

        {/* Bulk ALL Flats PDF Package Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between space-y-4 interactive-card">
          <div>
            <div className="p-3 bg-orange-50 rounded-xl w-fit mb-3">
              <Layers className="w-8 h-8 text-[#F15A24]" />
            </div>
            <h2 className="text-lg font-outfit font-bold text-slate-800">ALL Flats PDF Package (Multi-Page)</h2>
            <p className="text-slate-500 text-xs mt-1">
              Generate a multi-page PDF package containing handover certificates for all {activeFlatsCount} active customer flats at once.
            </p>
          </div>
          <button 
            onClick={handleExportPdfAll} 
            className="bg-[#F15A24] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors w-full btn-press cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4" /> Download ALL ({activeFlatsCount}) Certificates
          </button>
        </div>

        {/* Single Flat PDF & Modal Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col justify-between space-y-4 interactive-card">
          <div>
            <div className="p-3 bg-teal-50 rounded-xl w-fit mb-3">
              <Award className="w-8 h-8 text-[#0D6B6E]" />
            </div>
            <h2 className="text-lg font-outfit font-bold text-slate-800">Individual Flat Certificate & Preview</h2>
            <p className="text-slate-500 text-xs mt-1">
              Preview, select, download, or print an individual A4 physical certificate for immediate client signatures.
            </p>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setShowCertModal(true)} 
              className="bg-[#0D6B6E] hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors w-full btn-press cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Award className="w-4 h-4" /> Open Certificate Viewer / Printer
            </button>
            <button 
              onClick={handleExportPdfSingle} 
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors w-full btn-press cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" /> Download Single Flat PDF
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      <CommissioningCertificate 
        project={project} 
        isOpen={showCertModal} 
        onClose={() => setShowCertModal(false)} 
      />
    </div>
  );
};

export default ReportsPage;
