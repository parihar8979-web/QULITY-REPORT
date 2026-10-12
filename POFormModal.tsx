import React, { useState, useEffect } from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { Brand, MasterPORecord } from '../../types';
import { X, Check } from 'lucide-react';

interface POFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  recordToEdit?: MasterPORecord | null;
}

export const POFormModal: React.FC<POFormModalProps> = ({
  isOpen,
  onClose,
  brand,
  recordToEdit,
}) => {
  const { addPORecord, updatePORecord } = useQualityApp();

  const [sapPoNo, setSapPoNo] = useState('');
  const [newArticleNo, setNewArticleNo] = useState('');
  const [newStyleName, setNewStyleName] = useState('');
  const [newColourway, setNewColourway] = useState('');

  useEffect(() => {
    if (recordToEdit) {
      setSapPoNo(recordToEdit.sapPoNo);
      setNewArticleNo(recordToEdit.newArticleNo);
      setNewStyleName(recordToEdit.newStyleName);
      setNewColourway(recordToEdit.newColourway);
    } else {
      setSapPoNo(brand === 'Puma' ? 'SAP-PM-' : 'SAP-SK-');
      setNewArticleNo('');
      setNewStyleName('');
      setNewColourway('');
    }
  }, [recordToEdit, isOpen, brand]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sapPoNo.trim()) {
      alert('Please enter SAP PO No.');
      return;
    }

    const payload = {
      brand,
      sapPoNo: sapPoNo.trim(),
      newArticleNo: newArticleNo.trim() || 'N/A',
      newStyleName: newStyleName.trim() || 'N/A',
      newColourway: newColourway.trim() || 'N/A',
    };

    if (recordToEdit) {
      updatePORecord(recordToEdit.id, payload);
    } else {
      addPORecord(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-display font-bold text-slate-900">
              {recordToEdit ? `Edit ${brand} Row` : `Add ${brand} Row`}
            </h2>
            <div className="text-xs text-slate-500">AppSheet `{brand}` Master Table</div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              SAP PO No. <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={sapPoNo}
              onChange={e => setSapPoNo(e.target.value)}
              placeholder={brand === 'Puma' ? 'SAP-PM-90142' : 'SAP-SK-44210'}
              className="w-full px-3 py-2 font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Article No <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newArticleNo}
              onChange={e => setNewArticleNo(e.target.value)}
              placeholder="e.g. 389201"
              className="w-full px-3 py-2 font-mono bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Style Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newStyleName}
              onChange={e => setNewStyleName(e.target.value)}
              placeholder="e.g. Velocity Nitro 3"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              New Colourway
            </label>
            <input
              type="text"
              value={newColourway}
              onChange={e => setNewColourway(e.target.value)}
              placeholder="e.g. Puma Black / High Risk Red"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
