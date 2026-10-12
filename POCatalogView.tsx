import React, { useState } from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { Brand, MasterPORecord } from '../../types';
import { POFormModal } from './POFormModal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

interface POCatalogViewProps {
  brand: Brand;
}

export const POCatalogView: React.FC<POCatalogViewProps> = ({ brand }) => {
  const {
    pumaList,
    skechersList,
    deletePORecord,
  } = useQualityApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<MasterPORecord | null>(null);

  const dataList = brand === 'Puma' ? pumaList : skechersList;

  const filteredList = dataList.filter(item => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.sapPoNo.toLowerCase().includes(q) ||
      item.newArticleNo.toLowerCase().includes(q) ||
      item.newStyleName.toLowerCase().includes(q) ||
      item.newColourway.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: MasterPORecord) => {
    setRecordToEdit(record);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
            {brand} Master Table
          </h1>
          <p className="text-xs text-slate-500">
            {filteredList.length} SAP Purchase Orders
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add {brand} PO</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${brand} SAP PO No., Article No, Style, Color...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">SAP PO No.</th>
                <th className="py-2.5 px-3">New Article No</th>
                <th className="py-2.5 px-3">New Style Name</th>
                <th className="py-2.5 px-3">New Colourway</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No rows found in {brand} table.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.sapPoNo}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {item.newArticleNo}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.newStyleName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.newColourway}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete row ${item.sapPoNo}?`)) {
                              deletePORecord(item.id, brand);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <POFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brand={brand}
        recordToEdit={recordToEdit}
      />
    </div>
  );
};
