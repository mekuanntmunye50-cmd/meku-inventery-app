/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ChevronRight,
  PlusCircle,
  ArrowUpRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { CategoryType, ProductCondition, StockStatus } from '../types/inventory';
import { getStockStatus, getStatusStyle, formatCurrency } from '../utils/formatters';

export const InventoryView: React.FC = () => {
  const {
    products,
    openProductDetails,
    settings,
    currentUser,
    setActiveView,
  } = useInventory();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'quantity' | 'name' | 'date' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Available brands in inventory
  const brands = useMemo(() => {
    const bSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand && !p.archived) bSet.add(p.brand);
    });
    return Array.from(bSet).sort();
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (p.archived) return false;

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.productCode.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.capacity && p.capacity.toLowerCase().includes(q)) ||
            (p.storageLocation && p.storageLocation.toLowerCase().includes(q)) ||
            p.serialNumbers.some((sn) => sn.serialNumber.toLowerCase().includes(q));

          if (!match) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
          return false;
        }

        // Stock status filter
        if (selectedStatus !== 'all') {
          const status = getStockStatus(p.quantity, p.minimumStock);
          if (status !== selectedStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'quantity') {
          diff = a.quantity - b.quantity;
        } else if (sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
          diff = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
        } else if (sortBy === 'price') {
          diff = a.sellingPrice - b.sellingPrice;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [
    products,
    search,
    selectedCategory,
    selectedBrand,
    selectedCondition,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Page Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            All Inventory
          </h1>
          <p className="text-xs text-slate-500">
            {filteredProducts.length} of {products.filter((p) => !p.archived).length} total products displayed
          </p>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            type="button"
            onClick={() => setActiveView('add_item')}
            className="h-11 px-4 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        )}
      </div>

      {/* Search & Filter Controls Card */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, model, serial number, code, location..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-xs font-medium focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
          />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-2.5 rounded-xl border border-slate-300 font-medium bg-white text-slate-800"
          >
            <option value="all">All Categories</option>
            <option value="laptop">Laptops</option>
            <option value="desktop">Desktops</option>
            <option value="power">Power Solutions</option>
            <option value="accessories">Accessories</option>
          </select>

          {/* Brand */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-10 px-2.5 rounded-xl border border-slate-300 font-medium bg-white text-slate-800"
          >
            <option value="all">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Condition */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="h-10 px-2.5 rounded-xl border border-slate-300 font-medium bg-white text-slate-800"
          >
            <option value="all">All Conditions</option>
            <option value="Brand New">Brand New</option>
            <option value="Used">Used</option>
          </select>

          {/* Stock Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-2.5 rounded-xl border border-slate-300 font-medium bg-white text-slate-800"
          >
            <option value="all">All Stock Statuses</option>
            <option value="IN STOCK">🟢 In Stock</option>
            <option value="LOW STOCK">🟠 Low Stock</option>
            <option value="OUT OF STOCK">🔴 Out of Stock</option>
          </select>
        </div>

        {/* Sorting & View Toggle Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-8 px-2 rounded-lg border border-slate-200 font-medium bg-slate-50 text-slate-700"
            >
              <option value="name">Product Name</option>
              <option value="quantity">Stock Quantity</option>
              <option value="date">Date Added</option>
              <option value="price">Selling Price</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 font-bold"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
              }`}
              title="Table row view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'
              }`}
              title="Grid card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filter selection.
          </p>
          {(search || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSelectedCondition('all');
                setSelectedStatus('all');
              }}
              className="mt-3 px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE ROW VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredProducts.map((prod) => {
              const status = getStockStatus(prod.quantity, prod.minimumStock);
              const style = getStatusStyle(status);

              return (
                <div
                  key={prod.id}
                  onClick={() => openProductDetails(prod.id)}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-red-700 truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {prod.condition}
                        </span>
                        {prod.capacity && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                            {prod.capacity}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <span>{prod.brand}</span>
                        <span>·</span>
                        <span>{prod.model}</span>
                        <span>·</span>
                        <span>{prod.productCode}</span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Location: {prod.storageLocation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {formatCurrency(prod.sellingPrice, settings.currency)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-xs font-extrabold text-slate-800 font-mono">
                          Qty: {prod.quantity}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badgeClass}`}>
                          {style.icon} {style.label}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((prod) => {
            const status = getStockStatus(prod.quantity, prod.minimumStock);
            const style = getStatusStyle(status);

            return (
              <div
                key={prod.id}
                onClick={() => openProductDetails(prod.id)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-32 rounded-xl bg-slate-900 overflow-hidden mb-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      {prod.condition}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 shadow-xs ${style.textClass}`}>
                        {style.icon} {style.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-700 line-clamp-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {prod.brand} · {prod.model}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {prod.productCode}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Quantity</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {prod.quantity} units
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Price</span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {formatCurrency(prod.sellingPrice, settings.currency)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
