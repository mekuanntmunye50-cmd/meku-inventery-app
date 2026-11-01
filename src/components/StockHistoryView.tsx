/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  ArrowUpRight,
  Plus,
  Filter,
  Download,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { downloadCSV, formatCurrency } from '../utils/formatters';

export const StockHistoryView: React.FC = () => {
  const { transactions, openProductDetails, settings } = useInventory();

  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          tx.productName.toLowerCase().includes(q) ||
          tx.productCode.toLowerCase().includes(q) ||
          tx.user.toLowerCase().includes(q) ||
          tx.notes.toLowerCase().includes(q) ||
          (tx.serialNumbersAffected &&
            tx.serialNumbersAffected.some((s) => s.toLowerCase().includes(q)));
        if (!match) return false;
      }

      if (selectedReason !== 'all' && tx.reason !== selectedReason) {
        return false;
      }

      return true;
    });
  }, [transactions, search, selectedReason]);

  const handleExportCSV = () => {
    const headers = 'ID,Date,Time,Product,Code,Action,Reason,Quantity Change,Resulting Qty,User,Notes,Serials\n';
    const rows = transactions.map((t) => {
      const serials = (t.serialNumbersAffected || []).join(';');
      const cleanNotes = (t.notes || '').replace(/,/g, ' ');
      return `${t.id},${t.date},${t.time},"${t.productName}",${t.productCode},${t.action},${t.reason},${t.quantityChange},${t.resultingQuantity},"${t.user}","${cleanNotes}","${serials}"`;
    }).join('\n');

    downloadCSV(`meku-stock-history-${new Date().toISOString().split('T')[0]}.csv`, headers + rows);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#C8102E]" />
            Stock Audit History
          </h1>
          <p className="text-xs text-slate-500">
            Immutable transaction ledger · Never erases historical movements
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="h-10 px-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by product name, code, staff user, or serial..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-xs font-medium focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
            />
          </div>

          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="h-11 px-3 rounded-xl border border-slate-300 font-semibold bg-white text-xs text-slate-800"
          >
            <option value="all">All Reasons / Actions</option>
            <option value="Sold">Sold</option>
            <option value="Restock">Restock</option>
            <option value="Initial Stock">Initial Stock</option>
            <option value="Damaged">Damaged</option>
            <option value="Returned">Returned</option>
            <option value="Transferred">Transferred</option>
            <option value="Adjustment">Adjustment / Edit</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 flex items-center justify-between">
          <span>{filteredTransactions.length} Recorded Transactions</span>
          <span className="text-[11px] text-slate-400">Chronological Audit Log</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No history records match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.quantityChange > 0;
              const isNegative = tx.quantityChange < 0;

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openProductDetails(tx.productId)}
                        className="font-bold text-slate-900 text-sm hover:text-red-700 hover:underline text-left"
                      >
                        {tx.productName}
                      </button>
                      <span className="font-mono text-[11px] text-slate-400">
                        {tx.productCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.reason === 'Sold'
                            ? 'bg-red-100 text-red-800'
                            : tx.reason === 'Restock' || tx.reason === 'Initial Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.reason === 'Damaged'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {tx.reason}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs">
                      {tx.notes || `${tx.action} operation`}
                    </p>

                    {tx.serialNumbersAffected && tx.serialNumbersAffected.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                        <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Serials: {tx.serialNumbersAffected.join(', ')}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {tx.date} at {tx.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {tx.user}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <div
                        className={`text-base font-extrabold font-mono ${
                          isPositive
                            ? 'text-emerald-700'
                            : isNegative
                            ? 'text-rose-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {isPositive ? `+${tx.quantityChange}` : tx.quantityChange} units
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Resulting Stock: {tx.resultingQuantity}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
