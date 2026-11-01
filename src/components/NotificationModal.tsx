/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  XCircle,
  PackageCheck,
  ArrowUpRight,
  Check,
  Trash2,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const NotificationModal: React.FC = () => {
  const {
    isNotifModalOpen,
    setIsNotifModalOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    openProductDetails,
  } = useInventory();

  if (!isNotifModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#C8102E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold text-base">Inventory Alerts & Activity</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsNotifModalOpen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            {notifications.length} alerts
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-slate-600 hover:text-black font-semibold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              type="button"
              onClick={clearAllNotifications}
              className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No new notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                Stock changes, low stock warnings, and stock-outs will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const icon =
                notif.type === 'out_of_stock' ? (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : notif.type === 'low_stock' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : notif.type === 'stock_in' ? (
                  <PackageCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-blue-600 shrink-0" />
                );

              const bgClass =
                notif.type === 'out_of_stock'
                  ? 'border-rose-200 bg-rose-50/40'
                  : notif.type === 'low_stock'
                  ? 'border-amber-200 bg-amber-50/40'
                  : notif.type === 'stock_in'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.productId) {
                      openProductDetails(notif.productId);
                      setIsNotifModalOpen(false);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${bgClass} ${
                    !notif.read ? 'ring-1 ring-slate-400 shadow-2xs' : 'opacity-85'
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
