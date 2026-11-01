/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Scan,
  Shield,
  UserCheck,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const Header: React.FC = () => {
  const {
    settings,
    unreadNotifCount,
    setIsSidebarOpen,
    setIsSearchModalOpen,
    setIsScannerModalOpen,
    setIsNotifModalOpen,
    currentUser,
    users,
    setCurrentUser,
    setActiveView,
    setDrillCategory,
  } = useInventory();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#C8102E] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('dashboard');
              setDrillCategory(null);
            }}
            className="flex items-center gap-2 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-inner group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-base sm:text-lg tracking-tight font-mono">
                {settings.storeSubname || 'meku'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-white/85 tracking-widest uppercase">
                {settings.storeName || 'MEKU COMPUTERS'}
              </span>
            </div>
          </button>
        </div>

        {/* Center / Right: Action Tools & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Barcode Scanner Button */}
          <button
            type="button"
            onClick={() => setIsScannerModalOpen(true)}
            title="Scan Barcode / QR Code"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          >
            <Scan className="w-5 h-5" />
          </button>

          {/* Global Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            title="Global Inventory Search"
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setIsNotifModalOpen(true)}
            title="Notifications & Inventory Alerts"
            className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-black text-white rounded-full text-[10px] font-bold flex items-center justify-center border border-white">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="h-10 sm:h-11 px-2.5 sm:px-3 rounded-xl bg-black/35 hover:bg-black/50 border border-white/20 flex items-center gap-1.5 text-xs font-medium text-white transition-all"
            >
              {currentUser.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-red-300" />
              ) : currentUser.role === 'staff' ? (
                <UserCheck className="w-3.5 h-3.5 text-blue-200" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span className="capitalize hidden md:inline font-semibold">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Role (Demo & Testing)
                    </p>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                      Current: {currentUser.name}
                    </p>
                  </div>

                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setCurrentUser(u);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                        currentUser.id === u.id ? 'bg-red-50 font-semibold text-red-900' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-red-600'
                              : u.role === 'staff'
                              ? 'bg-blue-600'
                              : 'bg-zinc-500'
                          }`}
                        />
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 shrink-0">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
