/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { downloadCSV } from '../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    users,
    currentUser,
    setCurrentUser,
    resetToSampleData,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useInventory();

  const [storeName, setStoreName] = useState(settings.storeName || 'meku Computers');
  const [storeSubname, setStoreSubname] = useState(settings.storeSubname || 'meku');
  const [currency, setCurrency] = useState(settings.currency || 'ETB');
  const [defaultMinStock, setDefaultMinStock] = useState(settings.defaultMinStock || 3);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(settings.enableSoundAlerts ?? true);

  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      storeSubname,
      currency,
      defaultMinStock: Number(defaultMinStock),
      enableSoundAlerts,
    });
    setFeedbackMsg({ type: 'success', text: 'Store settings saved successfully.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meku-inventory-backup-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setFeedbackMsg({ type: 'success', text: 'Backup downloaded successfully.' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleApplyImport = () => {
    if (!importText.trim()) return;
    const res = importDatabaseJSON(importText);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: 'Inventory database restored successfully!' });
      setShowImportBox(false);
      setImportText('');
    } else {
      setFeedbackMsg({ type: 'error', text: res.error || 'Failed to restore backup.' });
    }
  };

  const handleResetSample = () => {
    if (confirm('Are you sure you want to reset all inventory to the initial meku Computers sample dataset?')) {
      resetToSampleData();
      setFeedbackMsg({ type: 'success', text: 'Inventory reset to meku Computers sample data.' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#C8102E]" />
          Store Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500">
          Brand visual identity, currency, access roles, and database backups
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* General Store Identity Settings */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          1. Brand Identity & Units
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Brand Wordmark</label>
            <input
              type="text"
              value={storeSubname}
              onChange={(e) => setStoreSubname(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Default Currency Code
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold bg-white"
            >
              <option value="ETB">ETB - Ethiopian Birr (Default)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="AED">AED - UAE Dirham</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Default Minimum Stock Level
            </label>
            <input
              type="number"
              min="1"
              value={defaultMinStock}
              onChange={(e) => setDefaultMinStock(Number(e.target.value))}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-800">
              Audio Feedback & Alert Sounds
            </span>
          </div>
          <input
            type="checkbox"
            checked={enableSoundAlerts}
            onChange={(e) => setEnableSoundAlerts(e.target.checked)}
            className="w-5 h-5 rounded accent-[#C8102E] cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="h-11 px-5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
        >
          Save Store Settings
        </button>
      </form>

      {/* Users and Roles Management (Requirement 21) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-red-600" />
            2. Team Members & Access Roles
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Active: {currentUser.name}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {users.map((u) => {
            const isCurrent = currentUser.id === u.id;
            return (
              <div
                key={u.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full ${u.avatarBg} text-white flex items-center justify-center font-bold text-[11px]`}
                  >
                    {u.name.slice(0, 2)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      u.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : u.role === 'staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-zinc-200 text-zinc-800'
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentUser(u)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-black text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isCurrent ? 'Active User' : 'Switch To'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <p>
            <strong>Role Permissions Summary:</strong>
          </p>
          <p>• <strong>Admin:</strong> Add & Edit products, Restock, Stock-out, Reports, Team, Settings.</p>
          <p>• <strong>Staff:</strong> View & Search, Add Stock, Stock-out, Audit History.</p>
          <p>• <strong>Viewer:</strong> Read-only search and details. Modifying inventory is restricted.</p>
        </div>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          3. Backup & Data Integrity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="h-12 px-4 rounded-xl border border-slate-300 hover:border-black bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Complete JSON Backup
          </button>

          <button
            type="button"
            onClick={() => setShowImportBox(!showImportBox)}
            className="h-12 px-4 rounded-xl border border-slate-300 hover:border-black bg-white text-slate-800 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            Restore Database from JSON
          </button>
        </div>

        {showImportBox && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Paste JSON Backup Content Below
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste JSON string here..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                className="px-4 py-1.5 rounded-lg bg-[#C8102E] text-xs font-bold text-white shadow-2xs"
              >
                Apply Restore
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Reset to Sample Data
            </span>
            <span className="text-[11px] text-slate-500">
              Reloads realistic meku Computers hardware, serials, and transaction records.
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetSample}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
