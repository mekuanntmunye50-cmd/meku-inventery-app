/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency, getStockStatus, downloadCSV } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { products, transactions, summary, settings } = useInventory();
  const [activeTab, setActiveTab] = useState<'value' | 'inventory' | 'stockout' | 'lowstock'>('value');

  // Stock out transactions
  const stockOutRecords = transactions.filter((t) => t.action === 'Stock Out');

  // Low stock products
  const lowStockRecords = products.filter(
    (p) => !p.archived && p.quantity > 0 && p.quantity <= p.minimumStock
  );

  // Active products
  const activeProducts = products.filter((p) => !p.archived);

  // Export handlers
  const exportInventoryCSV = () => {
    const headers = 'Product Name,Category,Subcategory,Brand,Model,Condition,Quantity,Status,Buying Price,Selling Price,Total Buying Value,Potential Sales Value,Product Code,Location\n';
    const rows = activeProducts.map((p) => {
      const status = getStockStatus(p.quantity, p.minimumStock);
      const buyingTotal = p.quantity * p.buyingPrice;
      const salesTotal = p.quantity * p.sellingPrice;
      return `"${p.name}",${p.category},${p.subcategory},${p.brand},"${p.model}",${p.condition},${p.quantity},${status},${p.buyingPrice},${p.sellingPrice},${buyingTotal},${salesTotal},${p.productCode},"${p.storageLocation}"`;
    }).join('\n');

    downloadCSV(`meku-inventory-report-${new Date().toISOString().split('T')[0]}.csv`, headers + rows);
  };

  const exportStockOutCSV = () => {
    const headers = 'Date,Time,Product Name,Product Code,Quantity Removed,Reason,User,Notes,Serials\n';
    const rows = stockOutRecords.map((t) => {
      const serials = (t.serialNumbersAffected || []).join(';');
      const cleanNotes = (t.notes || '').replace(/,/g, ' ');
      return `${t.date},${t.time},"${t.productName}",${t.productCode},${Math.abs(t.quantityChange)},${t.reason},"${t.user}","${cleanNotes}","${serials}"`;
    }).join('\n');

    downloadCSV(`meku-stockout-report-${new Date().toISOString().split('T')[0]}.csv`, headers + rows);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Title & Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-[#C8102E]" />
            Business Inventory & Valuation Reports
          </h1>
          <p className="text-xs text-slate-500">
            Automated stock calculations, sales margins, and transaction audits
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print / PDF
          </button>

          <button
            type="button"
            onClick={activeTab === 'stockout' ? exportStockOutCSV : exportInventoryCSV}
            className="h-10 px-3.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto text-xs font-semibold">
        {[
          { id: 'value', label: 'Valuation & Margin' },
          { id: 'inventory', label: 'All Inventory List' },
          { id: 'stockout', label: 'Stock-Out Ledger' },
          { id: 'lowstock', label: 'Low Stock Deficit' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: VALUATION & MARGIN */}
      {activeTab === 'value' && (
        <div className="space-y-4">
          {/* Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Buying Value */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Buying Value
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {formatCurrency(summary.totalBuyingValue, settings.currency)}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Formula: ∑ (Quantity × Buying Price)
              </p>
            </div>

            {/* Potential Sales Value */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Potential Sales Value
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {formatCurrency(summary.potentialSalesValue, settings.currency)}
              </div>
              <p className="text-[11px] text-emerald-600 font-mono">
                Formula: ∑ (Quantity × Selling Price)
              </p>
            </div>

            {/* Potential Margin */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 bg-blue-50/20 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                Potential Margin (Unrealized)
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-blue-700 font-mono tabular-nums">
                {formatCurrency(summary.potentialMargin, settings.currency)}
              </div>
              <p className="text-[11px] text-blue-600 font-mono">
                Formula: Potential Sales − Buying Value
              </p>
            </div>
          </div>

          {/* Important Accounting Notice (Requirement 17) */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Accounting Rule:</strong> Potential Margin is an unrealized estimate based on items currently held in stock. Realized revenue and actual profit are only booked when units are officially recorded as <strong>Sold</strong> via Stock-Out transactions.
            </p>
          </div>

          {/* Category Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider">
              Valuation Breakdown by Category
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {(['laptop', 'desktop', 'power', 'accessories'] as const).map((cat) => {
                const catProducts = products.filter((p) => p.category === cat && !p.archived);
                const totalUnits = catProducts.reduce((sum, p) => sum + p.quantity, 0);
                const buyVal = catProducts.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0);
                const sellVal = catProducts.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
                const margin = sellVal - buyVal;

                return (
                  <div key={cat} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 capitalize text-sm">
                        {cat === 'power' ? 'Power Solutions' : cat === 'accessories' ? 'Accessories' : `${cat}s`}
                      </div>
                      <div className="text-slate-500 font-mono mt-0.5">
                        {catProducts.length} models · {totalUnits} total units
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Buying Value</span>
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(buyVal, settings.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Potential Sales</span>
                        <span className="font-semibold text-emerald-700">
                          {formatCurrency(sellVal, settings.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Potential Margin</span>
                        <span className="font-bold text-blue-700">
                          {formatCurrency(margin, settings.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY REPORT */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5 font-mono text-center">Quantity</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 font-mono text-right">Unit Price</th>
                <th className="p-3.5 font-mono text-right">Potential Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activeProducts.map((p) => {
                const status = getStockStatus(p.quantity, p.minimumStock);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3.5 text-slate-600 capitalize">{p.category}</td>
                    <td className="p-3.5 text-slate-600">{p.condition}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-slate-900">
                      {p.quantity}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'IN STOCK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'LOW STOCK'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-right text-slate-700">
                      {formatCurrency(p.sellingPrice, settings.currency)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-right text-slate-900">
                      {formatCurrency(p.quantity * p.sellingPrice, settings.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: STOCK-OUT REPORT */}
      {activeTab === 'stockout' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5 font-mono text-center">Qty Removed</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Staff User</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stockOutRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No stock-out records recorded yet.
                  </td>
                </tr>
              ) : (
                stockOutRecords.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {t.date} {t.time}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{t.productName}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-rose-600">
                      {t.quantityChange}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {t.reason}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{t.user}</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{t.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: LOW STOCK REPORT */}
      {activeTab === 'lowstock' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5 font-mono text-center">Current Qty</th>
                <th className="p-3.5 font-mono text-center">Min Threshold</th>
                <th className="p-3.5 font-mono text-center">Recommended Reorder</th>
                <th className="p-3.5">Storage Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {lowStockRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No items currently below minimum stock threshold.
                  </td>
                </tr>
              ) : (
                lowStockRecords.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-amber-700">
                      {p.quantity}
                    </td>
                    <td className="p-3.5 font-mono text-center text-slate-600">
                      {p.minimumStock}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-emerald-700">
                      +{p.minimumStock - p.quantity + 3} units
                    </td>
                    <td className="p-3.5 text-slate-500">{p.storageLocation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
