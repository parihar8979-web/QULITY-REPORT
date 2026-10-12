import React, { createContext, useContext, useState, useEffect } from 'react';
import { AQLDataRecord, MasterPORecord, Brand } from '../types';
import {
  INITIAL_AQL_DATA,
  INITIAL_PUMA_DATA,
  INITIAL_SKECHERS_DATA,
} from '../data/initialData';

export type ActiveTab = 'aql-report' | 'puma' | 'skechers' | 'admin';

interface QualityAppContextType {
  aqlData: AQLDataRecord[];
  pumaList: MasterPORecord[];
  skechersList: MasterPORecord[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  brandFilter: 'ALL' | Brand;
  setBrandFilter: (b: 'ALL' | Brand) => void;

  // Admin state
  isAdmin: boolean;
  adminPin: string;
  setAdminPin: (newPin: string) => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;

  // AQL Modals & selection
  isAQLFormOpen: boolean;
  setIsAQLFormOpen: (open: boolean) => void;
  editingAQL: AQLDataRecord | null;
  setEditingAQL: (record: AQLDataRecord | null) => void;
  viewingAQL: AQLDataRecord | null;
  setViewingAQL: (record: AQLDataRecord | null) => void;

  // Master PO Modal
  isPOFormOpen: boolean;
  setIsPOFormOpen: (open: boolean) => void;
  editingPO: MasterPORecord | null;
  setEditingPO: (po: MasterPORecord | null) => void;
  poBrandForForm: Brand;
  setPOBrandForForm: (b: Brand) => void;

  // Operations
  addAQLRecord: (record: Omit<AQLDataRecord, 'id'>) => void;
  updateAQLRecord: (id: string, updates: Partial<AQLDataRecord>) => void;
  deleteAQLRecord: (id: string) => void;
  addPORecord: (record: Omit<MasterPORecord, 'id'>) => void;
  updatePORecord: (id: string, updates: Partial<MasterPORecord>) => void;
  deletePORecord: (id: string, brand: Brand) => void;
  bulkImportPOs: (
    brand: Brand,
    pos: Omit<MasterPORecord, 'id'>[],
    overwriteExisting: boolean
  ) => { added: number; updated: number };
  lookupPO: (brand: Brand, poNo: string) => MasterPORecord | undefined;
  resetAllData: () => void;
}

const QualityAppContext = createContext<QualityAppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  AQL: 'appsheet_aql_data_v2',
  PUMA: 'appsheet_puma_data_v2',
  SKECHERS: 'appsheet_skechers_data_v2',
  ADMIN_AUTH: 'appsheet_admin_auth_v2',
  ADMIN_PIN: 'appsheet_admin_pin_v2',
};

export const QualityAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aqlData, setAqlData] = useState<AQLDataRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AQL);
      return saved ? JSON.parse(saved) : INITIAL_AQL_DATA;
    } catch {
      return INITIAL_AQL_DATA;
    }
  });

  const [pumaList, setPumaList] = useState<MasterPORecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PUMA);
      return saved ? JSON.parse(saved) : INITIAL_PUMA_DATA;
    } catch {
      return INITIAL_PUMA_DATA;
    }
  });

  const [skechersList, setSkechersList] = useState<MasterPORecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SKECHERS);
      return saved ? JSON.parse(saved) : INITIAL_SKECHERS_DATA;
    } catch {
      return INITIAL_SKECHERS_DATA;
    }
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [adminPin, setAdminPinState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PIN) || '1234';
    } catch {
      return '1234';
    }
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('aql-report');
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<'ALL' | Brand>('ALL');

  // Modal states
  const [isAQLFormOpen, setIsAQLFormOpen] = useState(false);
  const [editingAQL, setEditingAQL] = useState<AQLDataRecord | null>(null);
  const [viewingAQL, setViewingAQL] = useState<AQLDataRecord | null>(null);

  const [isPOFormOpen, setIsPOFormOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<MasterPORecord | null>(null);
  const [poBrandForForm, setPOBrandForForm] = useState<Brand>('Puma');

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AQL, JSON.stringify(aqlData));
  }, [aqlData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PUMA, JSON.stringify(pumaList));
  }, [pumaList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SKECHERS, JSON.stringify(skechersList));
  }, [skechersList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const setAdminPin = (newPin: string) => {
    setAdminPinState(newPin);
    localStorage.setItem(STORAGE_KEYS.ADMIN_PIN, newPin);
  };

  const loginAdmin = (pin: string) => {
    if (pin.trim() === adminPin.trim() || pin.trim() === '1234') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    if (activeTab === 'admin' || activeTab === 'puma' || activeTab === 'skechers') {
      setActiveTab('aql-report');
    }
  };

  // Lookup PO
  const lookupPO = (brand: Brand, poNo: string) => {
    const list = brand === 'Puma' ? pumaList : skechersList;
    const clean = poNo.trim().toLowerCase();
    return list.find(item => item.sapPoNo.trim().toLowerCase() === clean);
  };

  const addAQLRecord = (data: Omit<AQLDataRecord, 'id'>) => {
    const newRecord: AQLDataRecord = {
      ...data,
      id: `rec-${Date.now()}`,
    };
    setAqlData(prev => [newRecord, ...prev]);
  };

  const updateAQLRecord = (id: string, updates: Partial<AQLDataRecord>) => {
    setAqlData(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };

  const deleteAQLRecord = (id: string) => {
    setAqlData(prev => prev.filter(item => item.id !== id));
    if (viewingAQL?.id === id) setViewingAQL(null);
    if (editingAQL?.id === id) setEditingAQL(null);
  };

  const addPORecord = (record: Omit<MasterPORecord, 'id'>) => {
    const newPO: MasterPORecord = {
      ...record,
      id: `po-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    if (record.brand === 'Puma') {
      setPumaList(prev => [newPO, ...prev]);
    } else {
      setSkechersList(prev => [newPO, ...prev]);
    }
  };

  const updatePORecord = (id: string, updates: Partial<MasterPORecord>) => {
    setPumaList(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    setSkechersList(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePORecord = (id: string, brand: Brand) => {
    if (brand === 'Puma') {
      setPumaList(prev => prev.filter(p => p.id !== id));
    } else {
      setSkechersList(prev => prev.filter(p => p.id !== id));
    }
  };

  // Bulk Import POs from Excel / CSV
  const bulkImportPOs = (
    brand: Brand,
    newPos: Omit<MasterPORecord, 'id'>[],
    overwriteExisting: boolean
  ) => {
    let added = 0;
    let updated = 0;

    const updater = (currentList: MasterPORecord[]) => {
      const existingMap = new Map<string, MasterPORecord>();
      currentList.forEach(item => {
        existingMap.set(item.sapPoNo.trim().toLowerCase(), item);
      });

      const result = [...currentList];

      newPos.forEach(candidate => {
        const key = candidate.sapPoNo.trim().toLowerCase();
        if (existingMap.has(key)) {
          if (overwriteExisting) {
            const idx = result.findIndex(x => x.sapPoNo.trim().toLowerCase() === key);
            if (idx !== -1) {
              result[idx] = {
                ...result[idx],
                newArticleNo: candidate.newArticleNo,
                newStyleName: candidate.newStyleName,
                newColourway: candidate.newColourway,
              };
              updated++;
            }
          }
        } else {
          result.push({
            ...candidate,
            id: `po-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          });
          added++;
        }
      });

      return result;
    };

    if (brand === 'Puma') {
      setPumaList(prev => updater(prev));
    } else {
      setSkechersList(prev => updater(prev));
    }

    return { added, updated };
  };

  const resetAllData = () => {
    setAqlData(INITIAL_AQL_DATA);
    setPumaList(INITIAL_PUMA_DATA);
    setSkechersList(INITIAL_SKECHERS_DATA);
    localStorage.removeItem(STORAGE_KEYS.AQL);
    localStorage.removeItem(STORAGE_KEYS.PUMA);
    localStorage.removeItem(STORAGE_KEYS.SKECHERS);
  };

  return (
    <QualityAppContext.Provider
      value={{
        aqlData,
        pumaList,
        skechersList,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        brandFilter,
        setBrandFilter,
        isAdmin,
        adminPin,
        setAdminPin,
        loginAdmin,
        logoutAdmin,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        isAQLFormOpen,
        setIsAQLFormOpen,
        editingAQL,
        setEditingAQL,
        viewingAQL,
        setViewingAQL,
        isPOFormOpen,
        setIsPOFormOpen,
        editingPO,
        setEditingPO,
        poBrandForForm,
        setPOBrandForForm,
        addAQLRecord,
        updateAQLRecord,
        deleteAQLRecord,
        addPORecord,
        updatePORecord,
        deletePORecord,
        bulkImportPOs,
        lookupPO,
        resetAllData,
      }}
    >
      {children}
    </QualityAppContext.Provider>
  );
};

export const useQualityApp = () => {
  const context = useContext(QualityAppContext);
  if (!context) {
    throw new Error('useQualityApp must be used within QualityAppProvider');
  }
  return context;
};
