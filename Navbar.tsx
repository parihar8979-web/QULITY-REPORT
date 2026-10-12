import React from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { Plus, RotateCcw, Lock, Unlock, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAQLFormOpen,
    setEditingAQL,
    resetAllData,
    isAdmin,
    setIsAdminLoginModalOpen,
    logoutAdmin,
  } = useQualityApp();

  const handleOpenNewAQL = () => {
    setEditingAQL(null);
    setIsAQLFormOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Zone 1: App Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('aql-report')}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm tracking-wide">
              QR
            </div>
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight whitespace-nowrap">
              Quality Reports
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          {/* Main Inspection View (Always visible) */}
          <button
            onClick={() => setActiveTab('aql-report')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap ${
              activeTab === 'aql-report'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            AQL Report
          </button>

          {/* Master Tables & Admin Panel (Visible only when Admin is logged in!) */}
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('puma')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  activeTab === 'puma'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Puma Master
              </button>
              <button
                onClick={() => setActiveTab('skechers')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap ${
                  activeTab === 'skechers'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Skechers Master
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-amber-100 text-amber-950 shadow-2xs font-bold'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Admin (Excel Import)</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions + Admin Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Admin Lock / Unlock Button */}
          {isAdmin ? (
            <button
              onClick={logoutAdmin}
              title="Admin is unlocked. Click to lock"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded transition-colors"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Admin Active</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAdminLoginModalOpen(true)}
              title="Admin Login (PIN: 1234)"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors border border-slate-200"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin</span>
            </button>
          )}

          <button
            onClick={handleOpenNewAQL}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add AQL Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
