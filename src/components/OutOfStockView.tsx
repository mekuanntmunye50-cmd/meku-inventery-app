/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  XCircle,
  Package,
  Calendar,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency } from '../utils/formatters';
import { RestockModal } from './RestockModal';

export const OutOfStockView: React.FC = () => {
  const { products, openProductDetails, settings, currentUser } = useInventory();
  const [restockProductId, setRestockProductId] = useState<string | null>(null);

  // Products where quantity is 0 and not archived
  const outOfStockProducts = products.filter(
    (p) => !p.archived && p.quantity === 0
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <XCircle className="w-6 h-6 text-rose-600" />
            Out of Stock
          </h1>
          <p className="text-xs text-slate-500">
            Products requiring immediate restocking PO or shipment arrival
          </p>
        </div>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          {outOfStockProducts.length} Items
        </span>
      </div>

      {/* Empty State or Product Cards */}
      {outOfStockProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            🎉 No products are currently out of stock.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All inventory catalog items currently have available stock on warehouse shelves.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {outOfStockProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-rose-200 p-4 sm:p-5 shadow-2xs hover:border-rose-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div
                onClick={() => openProductDetails(prod.id)}
                className="flex items-start sm:items-center gap-3.5 flex-1 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-700">
                      {prod.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">
                      🔴 OUT OF STOCK
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {prod.condition}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <span>{prod.brand}</span>
                    <span>·</span>
                    <span>{prod.model}</span>
                    <span>·</span>
                    <span>{prod.category.toUpperCase()}</span>
                    <span>·</span>
                    <span className="font-mono">{prod.productCode}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Last Stock: {prod.lastStockDate}
                    </span>
                    {prod.lastStockOutDate && (
                      <span className="flex items-center gap-1 text-rose-600">
                        <Calendar className="w-3 h-3" />
                        Last Stock Out: {prod.lastStockOutDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-[11px] text-slate-400">Current Stock</div>
                  <div className="text-sm font-extrabold text-rose-600 font-mono">
                    0 Units
                  </div>
                </div>

                {currentUser.role !== 'viewer' && (
                  <button
                    type="button"
                    onClick={() => setRestockProductId(prod.id)}
                    className="h-10 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Restock Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openProductDetails(prod.id)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  title="View Product Details"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restock Modal */}
      {restockProductId && (
        <RestockModal
          productId={restockProductId}
          onClose={() => setRestockProductId(null)}
        />
      )}
    </div>
  );
};
