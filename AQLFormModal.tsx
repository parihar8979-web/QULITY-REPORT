import React, { useState, useEffect } from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { Brand, INSPECTOR_LIST, AQLDataRecord } from '../../types';
import { X, Check, Calculator } from 'lucide-react';

interface AQLFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: AQLDataRecord | null;
}

const DEFAULT_SIZES: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0,
};

export const AQLFormModal: React.FC<AQLFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
}) => {
  const { pumaList, skechersList, lookupPO, addAQLRecord, updateAQLRecord } = useQualityApp();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [brand, setBrand] = useState<Brand>('Puma');
  const [po, setPo] = useState('');
  const [articleNo, setArticleNo] = useState('');
  const [articleName, setArticleName] = useState('');
  const [color, setColor] = useState('');
  const [sizes, setSizes] = useState<Record<number, number>>(DEFAULT_SIZES);
  const [aqlName, setAqlName] = useState<string>('BIRENDRA');
  const [isPoDropdownOpen, setIsPoDropdownOpen] = useState(false);

  // Auto total = SUM(1..13)
  const total = Object.values(sizes).reduce((sum, val) => sum + (Number(val) || 0), 0);

  useEffect(() => {
    if (recordToEdit) {
      setDate(recordToEdit.date);
      setBrand(recordToEdit.brand);
      setPo(recordToEdit.po);
      setArticleNo(recordToEdit.articleNo);
      setArticleName(recordToEdit.articleName);
      setColor(recordToEdit.color);
      setSizes({ ...DEFAULT_SIZES, ...recordToEdit.sizes });
      setAqlName(recordToEdit.aqlName || 'BIRENDRA');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setBrand('Puma');
      setPo('');
      setArticleNo('');
      setArticleName('');
      setColor('');
      setSizes(DEFAULT_SIZES);
      setAqlName('BIRENDRA');
    }
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  // When PO changes or is picked, auto-populate Article Name, Color, Article No
  const handleSelectPO = (selectedPo: string) => {
    setPo(selectedPo);
    setIsPoDropdownOpen(false);
    const matched = lookupPO(brand, selectedPo);
    if (matched) {
      setArticleNo(matched.newArticleNo);
      setArticleName(matched.newStyleName);
      setColor(matched.newColourway);
    }
  };

  const handleBrandChange = (newBrand: Brand) => {
    setBrand(newBrand);
    setPo('');
    setArticleNo('');
    setArticleName('');
    setColor('');
  };

  const handleSizeChange = (sizeIndex: number, val: number) => {
    setSizes(prev => ({
      ...prev,
      [sizeIndex]: Math.max(0, val),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!po.trim()) {
      alert('Please enter or select a PO number.');
      return;
    }

    const payload = {
      date,
      brand,
      po: po.trim(),
      articleNo: articleNo.trim() || 'N/A',
      articleName: articleName.trim() || 'N/A',
      color: color.trim() || 'N/A',
      sizes,
      total,
      aqlName,
    };

    if (recordToEdit) {
      updateAQLRecord(recordToEdit.id, payload);
    } else {
      addAQLRecord(payload);
    }
    onClose();
  };

  const availablePOs = brand === 'Puma' ? pumaList : skechersList;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-display font-bold text-slate-900">
              {recordToEdit ? `Edit AQL Data: ${recordToEdit.po}` : 'Add AQL Data'}
            </h2>
            <div className="text-xs text-slate-500">AppSheet `AQL DATA` Form</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Row 1: Date & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
                {(['Puma', 'Skechers'] as const).map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleBrandChange(b)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                      brand === b
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: PO with Auto-lookup */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PO (SAP PO No.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={po}
              onChange={e => {
                setPo(e.target.value);
                setIsPoDropdownOpen(true);
                const matched = lookupPO(brand, e.target.value);
                if (matched) {
                  setArticleNo(matched.newArticleNo);
                  setArticleName(matched.newStyleName);
                  setColor(matched.newColourway);
                }
              }}
              onFocus={() => setIsPoDropdownOpen(true)}
              placeholder="e.g. SAP-PM-90142"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />

            {/* Suggestions dropdown */}
            {isPoDropdownOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-48 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span>Select {brand} Master PO</span>
                  <button
                    type="button"
                    onClick={() => setIsPoDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
                {availablePOs
                  .filter(item => !po || item.sapPoNo.toLowerCase().includes(po.toLowerCase()) || item.newStyleName.toLowerCase().includes(po.toLowerCase()))
                  .map(item => (
                    <div
                      key={item.sapPoNo}
                      onClick={() => handleSelectPO(item.sapPoNo)}
                      className="px-3 py-2 text-xs hover:bg-blue-50 cursor-pointer border-b border-slate-50"
                    >
                      <span className="font-mono font-bold text-slate-900">{item.sapPoNo}</span>
                      <span className="text-slate-600 ml-2">{item.newStyleName}</span>
                      <span className="text-slate-400 ml-2">({item.newColourway})</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Row 3: Auto-populated Article No, Article Name, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Article No
              </label>
              <input
                type="text"
                value={articleNo}
                onChange={e => setArticleNo(e.target.value)}
                placeholder="Auto or manual"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Article Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={articleName}
                onChange={e => setArticleName(e.target.value)}
                placeholder="Auto-populated from PO"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Auto-populated from PO"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Sizes 1 to 13 & Total */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800">
                Sizes 1 to 13 (Pairs)
              </label>
              <span className="text-[11px] text-slate-400">Enter quantity per size</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(sz => (
                <div key={sz} className="text-center">
                  <div className="text-[10px] text-slate-500 font-semibold mb-0.5">#{sz}</div>
                  <input
                    type="number"
                    min="0"
                    value={sizes[sz] || 0}
                    onChange={e => handleSizeChange(sz, parseInt(e.target.value) || 0)}
                    className="w-full text-center py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 tabular-nums"
                  />
                </div>
              ))}
            </div>

            {/* Total: SUM(1..13) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Total (Formula: SUM of Sizes 1 to 13):</span>
              </div>
              <div className="font-mono text-base font-bold text-blue-900 tabular-nums">
                {total}
              </div>
            </div>
          </div>

          {/* Row 5: AQL NAME (Enum) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              AQL NAME (Inspector) <span className="text-rose-500">*</span>
            </label>
            <select
              value={aqlName}
              onChange={e => setAqlName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              {INSPECTOR_LIST.map(ins => (
                <option key={ins} value={ins}>
                  {ins}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{recordToEdit ? 'Save Changes' : 'Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
