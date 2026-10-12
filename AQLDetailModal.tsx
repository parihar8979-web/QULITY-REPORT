import React from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { AQLDataRecord } from '../../types';
import { X, Edit2, Trash2, Calendar, User } from 'lucide-react';

interface AQLDetailModalProps {
  record: AQLDataRecord | null;
  onClose: () => void;
}

export const AQLDetailModal: React.FC<AQLDetailModalProps> = ({ record, onClose }) => {
  const { setEditingAQL, setIsAQLFormOpen, deleteAQLRecord } = useQualityApp();

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              {record.brand}
            </div>
            <h2 className="text-lg font-display font-bold text-slate-900">
              {record.po}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setEditingAQL(record);
                setIsAQLFormOpen(true);
              }}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-500 block mb-1">Date</span>
              <span className="font-mono font-semibold text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {record.date}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-500 block mb-1">Brand</span>
              <span className="font-semibold text-slate-900">{record.brand}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-500 block mb-1">PO</span>
              <span className="font-mono font-bold text-slate-900">{record.po}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3">
              <span className="text-slate-500 block mb-1">AQL NAME</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {record.aqlName}
              </span>
            </div>
          </div>

          {/* Style details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-3">
            <div>
              <span className="text-slate-500 block mb-1">Article No</span>
              <span className="font-mono font-semibold text-slate-900">{record.articleNo}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Article Name</span>
              <span className="font-semibold text-slate-900">{record.articleName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Color</span>
              <span className="text-slate-900">{record.color}</span>
            </div>
          </div>

          {/* Sizes 1 to 13 Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Sizes 1 to 13</span>
              <span className="font-mono font-bold text-blue-900 text-sm">
                Total: {record.total}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-1.5 text-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(sz => {
                const count = record.sizes[sz] || 0;
                return (
                  <div
                    key={sz}
                    className={`rounded p-2 border ${
                      count > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5">#{sz}</div>
                    <div className="font-mono tabular-nums text-xs">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`Delete record for PO ${record.po}?`)) {
                deleteAQLRecord(record.id);
                onClose();
              }
            }}
            className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => {
              onClose();
              setEditingAQL(record);
              setIsAQLFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
