import React, { useState } from 'react';
import { useQualityApp } from '../../context/QualityAppContext';
import { X, Lock, ShieldCheck, KeyRound } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const {
    isAdminLoginModalOpen,
    setIsAdminLoginModalOpen,
    loginAdmin,
    setActiveTab,
  } = useQualityApp();

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(pin);
    if (success) {
      setError(false);
      setPin('');
      setIsAdminLoginModalOpen(false);
      setActiveTab('admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-slate-900">Admin Login</h2>
              <p className="text-[11px] text-slate-500">PO Excel Import & Master Management</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAdminLoginModalOpen(false);
              setError(false);
              setPin('');
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enter Admin PIN / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="Default PIN: 1234"
                autoFocus
                className={`w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest bg-white border rounded focus:outline-none focus:ring-1 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
                required
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                Galat PIN! Default PIN: <strong>1234</strong>
              </p>
            )}
            <p className="mt-2 text-[11px] text-slate-400">
              Sirf authorized admin hi Excel import aur Master POs manage kar sakte hain. Default PIN: <strong>1234</strong>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminLoginModalOpen(false);
                setError(false);
                setPin('');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded shadow-xs"
            >
              Unlock Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
