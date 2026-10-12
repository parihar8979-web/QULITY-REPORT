import React from 'react';
import { QualityAppProvider, useQualityApp } from './context/QualityAppContext';
import { Navbar } from './components/layout/Navbar';
import { AQLReportsView } from './components/inspections/AQLReportsView';
import { POCatalogView } from './components/master/POCatalogView';
import { AdminPanelView } from './components/admin/AdminPanelView';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AQLFormModal } from './components/inspections/AQLFormModal';
import { AQLDetailModal } from './components/inspections/AQLDetailModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isAdmin,
    isAQLFormOpen,
    setIsAQLFormOpen,
    editingAQL,
    setEditingAQL,
    viewingAQL,
    setViewingAQL,
  } = useQualityApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'aql-report' && <AQLReportsView />}
        {isAdmin && activeTab === 'puma' && <POCatalogView brand="Puma" key="puma" />}
        {isAdmin && activeTab === 'skechers' && <POCatalogView brand="Skechers" key="skechers" />}
        {isAdmin && activeTab === 'admin' && <AdminPanelView />}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal />

      {/* AQL Form Modal (Add / Edit) */}
      <AQLFormModal
        isOpen={isAQLFormOpen}
        recordToEdit={editingAQL}
        onClose={() => {
          setIsAQLFormOpen(false);
          setEditingAQL(null);
        }}
      />

      {/* AQL Detail Modal */}
      <AQLDetailModal
        record={viewingAQL}
        onClose={() => setViewingAQL(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <QualityAppProvider>
      <AppContent />
    </QualityAppProvider>
  );
}
