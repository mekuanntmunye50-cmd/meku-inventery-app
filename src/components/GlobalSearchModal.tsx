/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Package,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { getStockStatus, getStatusStyle, formatCurrency } from '../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    products,
    openProductDetails,
    settings,
  } = useInventory();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchModalOpen]);

  // Search logic across ALL products (zero quantity products are never filtered out!)
  const searchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();

    return products.filter((p) => {
      if (p.archived) return false;

      // Filter category or status if selected
      if (selectedFilter !== 'all') {
        if (selectedFilter === 'laptop' && p.category !== 'laptop') return false;
        if (selectedFilter === 'desktop' && p.category !== 'desktop') return false;
        if (selectedFilter === 'power' && p.category !== 'power') return false;
        if (selectedFilter === 'accessories' && p.category !== 'accessories') return false;
        if (selectedFilter === 'out_of_stock' && p.quantity > 0) return false;
        if (selectedFilter === 'low_stock' && (p.quantity === 0 || p.quantity > p.minimumStock)) return false;
      }

      if (!q) return true;

      // Check fields:
      // Product name
      if (p.name.toLowerCase().includes(q)) return true;
      // Model
      if (p.model.toLowerCase().includes(q)) return true;
      // Brand
      if (p.brand.toLowerCase().includes(q)) return true;
      // Product code
      if (p.productCode.toLowerCase().includes(q)) return true;
      // Category & Subcategory
      if (p.category.toLowerCase().includes(q)) return true;
      if (p.subcategory.toLowerCase().includes(q)) return true;
      // Capacity
      if (p.capacity && p.capacity.toLowerCase().includes(q)) return true;
      // Location
      if (p.storageLocation && p.storageLocation.toLowerCase().includes(q)) return true;
      // Specs
      if (p.cpu && p.cpu.toLowerCase().includes(q)) return true;
      if (p.ram && p.ram.toLowerCase().includes(q)) return true;
      if (p.ssd && p.ssd.toLowerCase().includes(q)) return true;
      // Serial numbers
      if (
        p.serialNumbers.some((sn) =>
          sn.serialNumber.toLowerCase().includes(q)
        )
      ) {
        return true;
      }

      return false;
    });
  }, [products, globalSearchQuery, selectedFilter]);

  if (!isSearchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search by name, model, brand, serial, code, capacity..."
              className="w-full h-11 sm:h-12 pl-11 pr-9 rounded-xl bg-white border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSearchModalOpen(false)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors shrink-0 font-semibold text-xs"
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        {/* Filter Quick Pills */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs">
          <span className="text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: 'All Inventory' },
            { id: 'laptop', label: 'Laptops' },
            { id: 'desktop', label: 'Desktops' },
            { id: 'power', label: 'Power Solutions' },
            { id: 'accessories', label: 'Accessories' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'out_of_stock', label: 'Out of Stock' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedFilter === f.id
                  ? 'bg-black text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            {searchResults.length} {searchResults.length === 1 ? 'Product Found' : 'Products Found'}
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching by a different name, serial number, or model code.
              </p>
            </div>
          ) : (
            searchResults.map((prod) => {
              const status = getStockStatus(prod.quantity, prod.minimumStock);
              const style = getStatusStyle(status);

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    openProductDetails(prod.id);
                    setIsSearchModalOpen(false);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-red-400 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm group-hover:text-red-700">
                        {prod.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {prod.brand} • {prod.category.toUpperCase()}
                      </span>
                      {prod.capacity && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                          {prod.capacity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{prod.productCode}</span>
                      <span>·</span>
                      <span>Loc: {prod.storageLocation}</span>
                      {prod.condition && (
                        <>
                          <span>·</span>
                          <span className="font-sans font-semibold text-slate-700">
                            {prod.condition}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-900">
                        {formatCurrency(prod.sellingPrice, settings.currency)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-slate-800">
                          Qty: {prod.quantity}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badgeClass}`}>
                          {style.icon} {style.label}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5" />
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
