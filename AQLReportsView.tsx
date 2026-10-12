import React, { useState, useMemo } from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { AQLDataRecord, Brand } from '../../types';
import {
  Search,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';

export const AQLReportsView: React.FC = () => {
  const {
    aqlData,
    searchQuery,
    setSearchQuery,
    brandFilter,
    setBrandFilter,
    setIsAQLFormOpen,
    setEditingAQL,
    setViewingAQL,
    deleteAQLRecord,
  } = useQualityApp();

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const filteredData = useMemo(() => {
    return aqlData.filter(item => {
      if (brandFilter !== 'ALL' && item.brand !== brandFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mPO = item.po.toLowerCase().includes(q);
        const mArtNo = (item.articleNo || '').toLowerCase().includes(q);
        const mArtName = (item.articleName || '').toLowerCase().includes(q);
        const mCol = (item.color || '').toLowerCase().includes(q);
        const mName = (item.aqlName || '').toLowerCase().includes(q);
        if (!mPO && !mArtNo && !mArtName && !mCol && !mName) return false;
      }
      return true;
    });
  }, [aqlData, brandFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingAQL(null);
    setIsAQLFormOpen(true);
  };

  const handleEdit = (record: AQLDataRecord) => {
    setEditingAQL(record);
    setIsAQLFormOpen(true);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">
            AQL REPORT
          </h1>
          <p className="text-xs text-slate-500">
            AQL DATA table ({filteredData.length} records)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add AQL Data</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search PO, Article, Color, Inspector..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Brand Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded border border-slate-200 text-xs">
            {(['ALL', 'Puma', 'Skechers'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  brandFilter === b
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              title="Table view"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Deck card view"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredData.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2">
          <p className="text-slate-500 text-xs">No records found matching current search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setBrandFilter('ALL');
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">PO</th>
                  <th className="py-2.5 px-3">Article No</th>
                  <th className="py-2.5 px-3">Article Name</th>
                  <th className="py-2.5 px-3">Color</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">AQL NAME</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setViewingAQL(item)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold text-white ${
                          item.brand === 'Puma' ? 'bg-neutral-900' : 'bg-blue-700'
                        }`}
                      >
                        {item.brand}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.po}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {item.articleNo}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {item.articleName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-44 truncate" title={item.color}>
                      {item.color}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {item.total}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                      {item.aqlName}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setViewingAQL(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete record for PO ${item.po}?`)) {
                              deleteAQLRecord(item.id);
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DECK CARD VIEW (AppSheet Deck style) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredData.map(item => (
            <div
              key={item.id}
              onClick={() => setViewingAQL(item)}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-4 cursor-pointer transition-all shadow-2xs hover:shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${
                    item.brand === 'Puma' ? 'bg-neutral-900' : 'bg-blue-700'
                  }`}
                >
                  {item.brand}
                </span>
                <span className="font-mono text-xs text-slate-400">{item.date}</span>
              </div>

              <div>
                <div className="font-mono font-bold text-sm text-slate-900">{item.po}</div>
                <div className="font-semibold text-xs text-slate-800 mt-0.5">{item.articleName}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Art: {item.articleNo} · {item.color}
                </div>
              </div>

              {/* Sizes summary */}
              <div className="bg-slate-50 border border-slate-100 rounded p-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Inspector: <strong>{item.aqlName}</strong></span>
                <span className="font-mono font-bold text-blue-900 tabular-nums">
                  Total: {item.total}
                </span>
              </div>

              <div
                className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setViewingAQL(item)}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                  title="View"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete record for PO ${item.po}?`)) {
                      deleteAQLRecord(item.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
