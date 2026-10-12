import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useQualityApp } from '../../context/QualityAppContext';
import { Brand, MasterPORecord } from '../../types';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Lock,
  LogOut,
  KeyRound,
  FileText,
  Trash2,
  Plus,
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const {
    pumaList,
    skechersList,
    bulkImportPOs,
    adminPin,
    setAdminPin,
    logoutAdmin,
    setActiveTab,
    setIsPOFormOpen,
    setPOBrandForForm,
  } = useQualityApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetBrand, setTargetBrand] = useState<Brand>('Puma');
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [parsedRows, setParsedRows] = useState<Omit<MasterPORecord, 'id'>[]>([]);
  const [fileName, setFileName] = useState('');
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // PIN change state
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Handle Excel / CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportStatus({ type: null, message: '' });

    const reader = new FileReader();

    reader.onload = evt => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          setImportStatus({
            type: 'error',
            message: 'Uploaded file me koi data nahi mila (Sheet is empty).',
          });
          setParsedRows([]);
          return;
        }

        // Smart column mapping
        const mapped: Omit<MasterPORecord, 'id'>[] = rawJson
          .map(row => {
            const keys = Object.keys(row);

            // Find SAP PO No key
            const poKey = keys.find(k => {
              const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return clean.includes('sappono') || clean.includes('po') || clean.includes('ponumber');
            });

            // Find Article No key
            const artKey = keys.find(k => {
              const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return clean.includes('newarticleno') || clean.includes('articleno') || clean.includes('article') || clean.includes('sku');
            });

            // Find Style Name key
            const styleKey = keys.find(k => {
              const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return clean.includes('newstylename') || clean.includes('stylename') || clean.includes('style') || clean.includes('model');
            });

            // Find Colourway key
            const colorKey = keys.find(k => {
              const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              return clean.includes('newcolourway') || clean.includes('colourway') || clean.includes('color') || clean.includes('colour');
            });

            const sapPoNo = poKey ? String(row[poKey]).trim() : '';
            const newArticleNo = artKey ? String(row[artKey]).trim() : '';
            const newStyleName = styleKey ? String(row[styleKey]).trim() : '';
            const newColourway = colorKey ? String(row[colorKey]).trim() : '';

            return {
              brand: targetBrand,
              sapPoNo,
              newArticleNo: newArticleNo || 'N/A',
              newStyleName: newStyleName || 'N/A',
              newColourway: newColourway || 'Standard',
            };
          })
          .filter(r => r.sapPoNo.length > 0); // Must have PO number

        if (mapped.length === 0) {
          setImportStatus({
            type: 'error',
            message:
              'Columns match nahi hue! Excel sheet me "SAP PO No.", "New Article No", "New Style Name", "New Colourway" headers hona zaroori hai.',
          });
          setParsedRows([]);
        } else {
          setParsedRows(mapped);
          setImportStatus({
            type: 'success',
            message: `${mapped.length} valid PO rows read from ${file.name}. Review karke niche "Confirm Import" dabayein.`,
          });
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: 'Excel file parse karne me error aaya: ' + (err.message || 'Invalid format'),
        });
      }
    };

    reader.readAsBinaryString(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    // Set brand
    const rowsWithBrand = parsedRows.map(r => ({ ...r, brand: targetBrand }));
    const result = bulkImportPOs(targetBrand, rowsWithBrand, overwriteExisting);

    setImportStatus({
      type: 'success',
      message: `Successfully imported! Added: ${result.added} new POs, Updated: ${result.updated} existing POs into ${targetBrand} Master.`,
    });

    setParsedRows([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        'SAP PO No.': targetBrand === 'Puma' ? 'SAP-PM-90199' : 'SAP-SK-44299',
        'New Article No': targetBrand === 'Puma' ? '389999' : '232999',
        'New Style Name': targetBrand === 'Puma' ? 'Velocity Nitro Sample' : 'Go Walk Sample',
        'New Colourway': targetBrand === 'Puma' ? 'Black / White' : 'Navy / Red',
      },
      {
        'SAP PO No.': targetBrand === 'Puma' ? 'SAP-PM-90200' : 'SAP-SK-44300',
        'New Article No': targetBrand === 'Puma' ? '389888' : '232888',
        'New Style Name': targetBrand === 'Puma' ? 'Deviate Nitro 2' : 'Arch Fit Elite',
        'New Colourway': targetBrand === 'Puma' ? 'Red / Yellow' : 'Charcoal / Orange',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${targetBrand}_Template`);
    XLSX.writeFile(wb, `${targetBrand}_PO_Import_Template.xlsx`);
  };

  // Export current POs to Excel
  const handleExportPOs = (brand: Brand) => {
    const list = brand === 'Puma' ? pumaList : skechersList;
    const exportData = list.map(item => ({
      'SAP PO No.': item.sapPoNo,
      'New Article No': item.newArticleNo,
      'New Style Name': item.newStyleName,
      'New Colourway': item.newColourway,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, brand);
    XLSX.writeFile(wb, `${brand}_Master_POs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Change PIN
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin.trim()) return;
    setAdminPin(newPin.trim());
    setPinChangeMsg('Admin PIN successfully badal diya gaya hai!');
    setNewPin('');
    setTimeout(() => setPinChangeMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Admin Control Panel
            </span>
          </div>
          <h1 className="text-xl font-display font-bold mt-1">PO Master & Excel Import Center</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Yeh panel sirf Admin ko visible hai. Yahan se aap Excel se direct bulk PO import kar sakte hain.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('aql-report')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
          >
            Go to AQL Report
          </button>
          <button
            onClick={logoutAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock / Logout Admin</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EXCEL / CSV IMPORT */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Excel / CSV Se PO Import Karein</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              `.xlsx`, `.xls` ya `.csv` file upload karein aur Puma ya Skechers table me ek click me save karein.
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors w-fit"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Sample Excel Template</span>
          </button>
        </div>

        {/* Step 1: Choose Brand & Overwrite Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              1. Kis Brand ke PO Import Karne Hain?
            </label>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
              {(['Puma', 'Skechers'] as const).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setTargetBrand(b)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                    targetBrand === b
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b} Master
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              2. Duplicate PO Settings
            </label>
            <label className="flex items-center gap-2 mt-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={overwriteExisting}
                onChange={e => setOverwriteExisting(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Agar PO pehle se maujood hai to use update/overwrite karein</span>
            </label>
          </div>
        </div>

        {/* Step 2: Upload Area */}
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-6 text-center bg-slate-50/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer space-y-2 block">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 hover:underline">
                Excel ya CSV File Choose Karein
              </span>
              <span className="text-xs text-slate-500"> ya yahan drag & drop karein</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Supported formats: .xlsx, .xls, .csv · Required Columns: "SAP PO No.", "New Article No", "New Style Name", "New Colourway"
            </p>
          </label>
        </div>

        {/* Status Message */}
        {importStatus.message && (
          <div
            className={`p-3 rounded text-xs flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Parsed Rows Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Preview ({parsedRows.length} PO Rows Read from File)
              </span>
              <button
                onClick={handleConfirmImport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Import {parsedRows.length} POs into {targetBrand}</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">SAP PO No.</th>
                    <th className="py-2 px-3">New Article No</th>
                    <th className="py-2 px-3">New Style Name</th>
                    <th className="py-2 px-3">New Colourway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 50).map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{r.sapPoNo}</td>
                      <td className="py-1.5 px-3 font-mono text-slate-700">{r.newArticleNo}</td>
                      <td className="py-1.5 px-3 font-medium text-slate-900">{r.newStyleName}</td>
                      <td className="py-1.5 px-3 text-slate-600">{r.newColourway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 50 && (
              <p className="text-[11px] text-slate-400 text-right">
                Showing first 50 rows of {parsedRows.length} total rows.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: MASTER PO TABLES QUICK OVERVIEW */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">PO Master Database Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Puma Master Table</span>
                <span className="text-xs text-slate-500 font-mono">{pumaList.length} SAP POs registered</span>
              </div>
              <button
                onClick={() => handleExportPOs('Puma')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                title="Export Puma POs to Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setPOBrandForForm('Puma');
                  setIsPOFormOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
              >
                + Add Single Puma PO
              </button>
              <button
                onClick={() => setActiveTab('puma')}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50"
              >
                View Table
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Skechers Master Table</span>
                <span className="text-xs text-slate-500 font-mono">{skechersList.length} SAP POs registered</span>
              </div>
              <button
                onClick={() => handleExportPOs('Skechers')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
                title="Export Skechers POs to Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setPOBrandForForm('Skechers');
                  setIsPOFormOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
              >
                + Add Single Skechers PO
              </button>
              <button
                onClick={() => setActiveTab('skechers')}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded hover:bg-slate-50"
              >
                View Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: ADMIN SECURITY (CHANGE PIN) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">Admin PIN Settings</h2>
        </div>
        <p className="text-xs text-slate-500">
          Aap apna custom Admin PIN yahan set kar sakte hain taaki koi aur is panel ko na khol sake.
        </p>

        <form onSubmit={handleSavePin} className="max-w-md space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Admin PIN / Password
            </label>
            <input
              type="text"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              placeholder="e.g. 5678 ya secret password"
              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors shadow-xs"
            >
              Save New PIN
            </button>
            {pinChangeMsg && (
              <span className="text-xs text-emerald-600 font-medium">{pinChangeMsg}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
