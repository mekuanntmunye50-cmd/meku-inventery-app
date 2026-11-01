/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { CategoryType } from '../types/inventory';
import { CategoryDrillView } from './CategoryDrillView';

export const DashboardView: React.FC = () => {
  const {
    summary,
    products,
    setActiveView,
    drillCategory,
    setDrillCategory,
    openProductDetails,
  } = useInventory();

  // If a category is being drilled down, render CategoryDrillView
  if (drillCategory) {
    return (
      <CategoryDrillView
        category={drillCategory as CategoryType}
        onBack={() => setDrillCategory(null)}
      />
    );
  }

  // Count by category
  const laptopCount = products.filter((p) => p.category === 'laptop' && !p.archived).length;
  const desktopCount = products.filter((p) => p.category === 'desktop' && !p.archived).length;
  const powerCount = products.filter((p) => p.category === 'power' && !p.archived).length;
  const accessoriesCount = products.filter((p) => p.category === 'accessories' && !p.archived).length;

  const categories = [
    {
      id: 'laptop' as CategoryType,
      title: 'Laptop',
      icon: '💻',
      count: laptopCount,
      desc: 'Brand New & Used · Dell, HP, Lenovo',
      image: '/src/assets/images/laptop_showcase_1793514783594.jpg',
    },
    {
      id: 'desktop' as CategoryType,
      title: 'Desktop',
      icon: '🖥️',
      count: desktopCount,
      desc: 'Brand New & Used · OptiPlex, ProDesk',
      image: '/src/assets/images/desktop_workstation_1793514784216.jpg',
    },
    {
      id: 'power' as CategoryType,
      title: 'Power Solutions',
      icon: '⚡️',
      count: powerCount,
      desc: 'UPS 200/400 kVA · EcoFlow & Power Stations',
      image: '/src/assets/images/power_solutions_1793514785097.jpg',
    },
    {
      id: 'accessories' as CategoryType,
      title: 'Accessories / Other',
      icon: '🔧',
      count: accessoriesCount,
      desc: 'RAM, SSD, HDD, Cables, Chargers, Mouse',
      image: '/src/assets/images/accessories_hardware_1793514784874.jpg',
    },
  ];

  // Urgent low-stock or out-of-stock items for quick banner
  const urgentItems = products.filter((p) => !p.archived && p.quantity <= p.minimumStock);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top 4 Summary Cards (Requirement 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Products */}
        <button
          type="button"
          onClick={() => setActiveView('inventory')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-slate-400 text-left transition-all group flex flex-col justify-between min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {summary.totalProducts}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {summary.totalUnits} total units in stock
            </div>
          </div>
        </button>

        {/* In Stock (Green) */}
        <button
          type="button"
          onClick={() => setActiveView('inventory')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-2xs hover:border-emerald-400 text-left transition-all group flex flex-col justify-between min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              In Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
              {summary.inStockCount}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">
              Healthy inventory level
            </div>
          </div>
        </button>

        {/* Low Stock (Orange) */}
        <button
          type="button"
          onClick={() => setActiveView('low_stock')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/25 shadow-2xs hover:border-amber-400 text-left transition-all group flex flex-col justify-between min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Low Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
              {summary.lowStockCount}
            </div>
            <div className="text-[11px] text-amber-600 mt-0.5">
              Requires restocking attention
            </div>
          </div>
        </button>

        {/* Out of Stock (Red) */}
        <button
          type="button"
          onClick={() => setActiveView('out_of_stock')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 bg-rose-50/25 shadow-2xs hover:border-rose-400 text-left transition-all group flex flex-col justify-between min-h-[105px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Out of Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 font-mono tabular-nums">
              {summary.outOfStockCount}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">
              Zero quantity available
            </div>
          </div>
        </button>
      </div>

      {/* Urgent Alert Banner (if any item is out or low) */}
      {urgentItems.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-red-200 bg-red-50/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {urgentItems.length} {urgentItems.length === 1 ? 'item requires' : 'items require'} attention
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-1">
                {summary.outOfStockCount} out of stock · {summary.lowStockCount} below minimum threshold
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {summary.outOfStockCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveView('out_of_stock')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-2xs"
              >
                Out of Stock
              </button>
            )}
            {summary.lowStockCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveView('low_stock')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
              >
                Low Stock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Four Large Category Cards (Requirement 2) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
            Product Categories
          </h2>
          <span className="text-xs text-slate-500">Tap category to explore catalog</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setDrillCategory(cat.id)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-red-500 transition-all text-left flex flex-col group cursor-pointer"
            >
              {/* Product Visual Photo */}
              <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Floating category badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/10">
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.title}</span>
                </div>

                {/* Stock count badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <span className="text-lg font-extrabold font-mono tracking-tight">
                      {cat.count}
                    </span>
                    <span className="text-xs text-white/80 ml-1.5">Products</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#C8102E] transition-colors">
                    <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-red-600 font-bold group-hover:underline">
                  <span>Browse {cat.title}</span>
                  <ArrowRight className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
