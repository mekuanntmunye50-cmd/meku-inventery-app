/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ArrowUpRight,
  AlertTriangle,
  XCircle,
  FileBarChart,
  History,
  Settings as SettingsIcon,
  X,
  Shield,
  Scan,
  BookOpen,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ActiveView } from '../types/inventory';

export const SidebarMenu: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeView,
    setActiveView,
    setDrillCategory,
    summary,
    settings,
    currentUser,
    setIsScannerModalOpen,
  } = useInventory();

  if (!isSidebarOpen) return null;

  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    setDrillCategory(null);
    setIsSidebarOpen(false);
  };

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    count?: number;
    badgeColor?: string;
    requiresRole?: 'admin' | 'staff';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Package className="w-5 h-5" />,
      count: summary.totalProducts,
    },
    {
      id: 'add_item',
      label: 'Add Item',
      icon: <PlusCircle className="w-5 h-5 text-emerald-600" />,
      requiresRole: 'staff',
    },
    {
      id: 'stock_out',
      label: 'Stock Out',
      icon: <ArrowUpRight className="w-5 h-5 text-red-600" />,
      requiresRole: 'staff',
    },
    {
      id: 'out_of_stock',
      label: 'Out of Stock',
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      count: summary.outOfStockCount,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold',
    },
    {
      id: 'low_stock',
      label: 'Low Stock',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      count: summary.lowStockCount,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileBarChart className="w-5 h-5" />,
    },
    {
      id: 'stock_history',
      label: 'Stock History',
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon className="w-5 h-5" />,
    },
    {
      id: 'docs',
      label: 'Docs & Presentation',
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="bg-[#C8102E] text-white p-4 flex items-center justify-between border-b border-red-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm tracking-widest">
              M
            </div>
            <div>
              <div className="font-mono font-bold text-lg leading-tight">
                {settings.storeSubname || 'meku'}
              </div>
              <div className="text-[11px] font-medium text-white/80 uppercase tracking-wider">
                {settings.storeName || 'MEKU COMPUTERS'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/10 active:scale-95"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-full ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold uppercase`}
            >
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-600 inline" />
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsScannerModalOpen(true);
            }}
            className="px-2 py-1 text-[11px] font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 shadow-2xs"
          >
            <Scan className="w-3 h-3 text-red-600" />
            Scan
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const isViewerRestricted =
              currentUser.role === 'viewer' &&
              (item.id === 'add_item' || item.id === 'stock_out');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isViewerRestricted) {
                    alert('Viewers have read-only access. Switch role to Admin or Staff in the top bar to edit inventory.');
                    return;
                  }
                  navigateTo(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-red-50 text-[#C8102E] font-semibold border border-red-200 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100'
                } ${isViewerRestricted ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#C8102E]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <div className="text-xs font-semibold text-slate-800">meku Inventory System</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            v2.4 Pro · Single Source of Truth
          </div>
        </div>
      </div>
    </div>
  );
};
