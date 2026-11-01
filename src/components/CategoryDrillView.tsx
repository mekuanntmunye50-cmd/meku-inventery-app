/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Layers,
  BatteryCharging,
  Cpu,
  Plus,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { CategoryType, ProductCondition } from '../types/inventory';
import { getStockStatus, getStatusStyle, formatCurrency } from '../utils/formatters';

interface CategoryDrillViewProps {
  category: CategoryType;
  onBack: () => void;
}

export const CategoryDrillView: React.FC<CategoryDrillViewProps> = ({
  category,
  onBack,
}) => {
  const { products, openProductDetails, settings, currentUser, setActiveView } = useInventory();

  // Category products
  const categoryProducts = useMemo(() => {
    return products.filter((p) => p.category === category && !p.archived);
  }, [products, category]);

  // Drilldown states
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | 'All'>('All');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);

  const categoryTitles = {
    laptop: { title: 'Laptops', icon: '💻', desc: 'Brand New & Grade-A Used Ultrabooks' },
    desktop: { title: 'Desktops', icon: '🖥️', desc: 'Towers, SFF, Micro & Workstations' },
    power: { title: 'Power Solutions', icon: '⚡️', desc: 'High-Capacity UPS & EcoFlow Power Stations' },
    accessories: { title: 'Accessories & Components', icon: '🔧', desc: 'RAM, SSD, Cables, Chargers, Input' },
  };

  // FOR LAPTOP / DESKTOP:
  // Step 1: Condition (Brand New / Used)
  // Step 2: Brand
  // Step 3: Model List
  const availableBrands = useMemo(() => {
    let filtered = categoryProducts;
    if (selectedCondition !== 'All') {
      filtered = filtered.filter((p) => p.condition === selectedCondition);
    }
    const brandsSet = new Set<string>();
    filtered.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [categoryProducts, selectedCondition]);

  const modelsForSelectedBrand = useMemo(() => {
    if (!selectedBrand) return [];
    let filtered = categoryProducts.filter((p) => p.brand === selectedBrand);
    if (selectedCondition !== 'All') {
      filtered = filtered.filter((p) => p.condition === selectedCondition);
    }
    return filtered;
  }, [categoryProducts, selectedBrand, selectedCondition]);

  // FOR POWER SOLUTIONS:
  // Subcategories: UPS vs EcoFlow / Power Station vs Other
  const powerSubcategories = ['UPS', 'EcoFlow / Power Station', 'Other Power Products'];

  // Capacities for selected subcategory
  const availableCapacities = useMemo(() => {
    if (category !== 'power' || !selectedSubcategory) return [];
    const caps = new Set<string>();
    categoryProducts
      .filter((p) => {
        if (selectedSubcategory === 'Other Power Products') {
          return p.subcategory !== 'UPS' && p.subcategory !== 'EcoFlow / Power Station';
        }
        return p.subcategory === selectedSubcategory;
      })
      .forEach((p) => {
        if (p.capacity) caps.add(p.capacity);
      });
    return Array.from(caps).sort();
  }, [categoryProducts, category, selectedSubcategory]);

  // Filtered power products
  const powerFilteredProducts = useMemo(() => {
    if (category !== 'power') return [];
    let list = categoryProducts;
    if (selectedSubcategory) {
      if (selectedSubcategory === 'Other Power Products') {
        list = list.filter((p) => p.subcategory !== 'UPS' && p.subcategory !== 'EcoFlow / Power Station');
      } else {
        list = list.filter((p) => p.subcategory === selectedSubcategory);
      }
    }
    if (selectedCapacity) {
      list = list.filter((p) => p.capacity === selectedCapacity);
    }
    return list;
  }, [categoryProducts, category, selectedSubcategory, selectedCapacity]);

  // FOR ACCESSORIES:
  // Subcategories: RAM, SSD, HDD, Cables, Laptop Chargers, Adapters, Keyboard, Mouse, Other Accessories
  const accessorySubcategories = [
    'RAM',
    'SSD',
    'HDD',
    'Cables',
    'Laptop Chargers',
    'Adapters',
    'Keyboard',
    'Mouse',
    'Other Accessories',
  ];

  const accessoryFilteredProducts = useMemo(() => {
    if (category !== 'accessories') return [];
    if (!selectedSubcategory) return categoryProducts;
    return categoryProducts.filter((p) => p.subcategory === selectedSubcategory);
  }, [categoryProducts, category, selectedSubcategory]);

  const resetFilters = () => {
    setSelectedCondition('All');
    setSelectedBrand(null);
    setSelectedSubcategory(null);
    setSelectedCapacity(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Category Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (selectedBrand) {
                setSelectedBrand(null);
              } else if (selectedCapacity) {
                setSelectedCapacity(null);
              } else if (selectedSubcategory) {
                setSelectedSubcategory(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-red-600 transition-colors py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>{categoryProducts.length} total products</span>
            {currentUser.role !== 'viewer' && (
              <button
                type="button"
                onClick={() => setActiveView('add_item')}
                className="ml-2 flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={categoryTitles[category].title}>
            {categoryTitles[category].icon}
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {categoryTitles[category].title}
            </h2>
            <p className="text-xs text-slate-500">{categoryTitles[category].desc}</p>
          </div>
        </div>

        {/* Breadcrumb drill pathway */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={resetFilters}
            className="hover:text-red-600 underline font-medium"
          >
            {categoryTitles[category].title}
          </button>
          {selectedCondition !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">{selectedCondition}</span>
            </>
          )}
          {selectedSubcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">{selectedSubcategory}</span>
            </>
          )}
          {selectedCapacity && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">{selectedCapacity}</span>
            </>
          )}
          {selectedBrand && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800">{selectedBrand}</span>
            </>
          )}
        </div>
      </div>

      {/* --- CASE A: LAPTOP OR DESKTOP --- */}
      {(category === 'laptop' || category === 'desktop') && (
        <div className="space-y-4">
          {/* Step 1: Condition Selector (Brand New / Used / All) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Select Condition
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['All', 'Brand New', 'Used'] as const).map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => {
                    setSelectedCondition(cond);
                    setSelectedBrand(null);
                  }}
                  className={`h-11 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center transition-all ${
                    selectedCondition === cond
                      ? 'bg-black text-white shadow-sm ring-2 ring-black'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Brand Selection (if brand not chosen) */}
          {!selectedBrand ? (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                Choose Brand ({availableBrands.length})
              </label>

              {availableBrands.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No {selectedCondition !== 'All' ? selectedCondition : ''} {category} brands available.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableBrands.map((brandName) => {
                    const count = categoryProducts.filter((p) => {
                      if (p.brand !== brandName) return false;
                      if (selectedCondition !== 'All') return p.condition === selectedCondition;
                      return true;
                    }).length;

                    return (
                      <button
                        key={brandName}
                        type="button"
                        onClick={() => setSelectedBrand(brandName)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-red-50 hover:border-red-300 text-left transition-all group flex flex-col justify-between min-h-[72px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-red-700">
                            {brandName}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {count} {count === 1 ? 'model' : 'models'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Step 3: Models List for Chosen Brand */
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedBrand} Models ({modelsForSelectedBrand.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Condition: {selectedCondition} · Tap model to view product details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBrand(null)}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Change Brand
                </button>
              </div>

              <div className="space-y-2.5">
                {modelsForSelectedBrand.map((prod) => {
                  const status = getStockStatus(prod.quantity, prod.minimumStock);
                  const style = getStatusStyle(status);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => openProductDetails(prod.id)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-red-400 bg-white hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-700">
                            {prod.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {prod.condition}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                          <span>{prod.cpu || 'Standard CPU'}</span>
                          <span>·</span>
                          <span>{prod.ram}</span>
                          <span>·</span>
                          <span>{prod.ssd}</span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          {prod.productCode} · {prod.storageLocation}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-900">
                            {formatCurrency(prod.sellingPrice, settings.currency)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-xs font-bold text-slate-800">
                              Qty: {prod.quantity}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badgeClass}`}>
                              {style.label}
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
          )}
        </div>
      )}

      {/* --- CASE B: POWER SOLUTIONS --- */}
      {category === 'power' && (
        <div className="space-y-4">
          {/* Step 1: Subcategory Picker (UPS, EcoFlow / Power Station, Other) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Select Power Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {powerSubcategories.map((subcat) => (
                <button
                  key={subcat}
                  type="button"
                  onClick={() => {
                    setSelectedSubcategory(subcat);
                    setSelectedCapacity(null);
                  }}
                  className={`p-3 rounded-xl font-bold text-xs sm:text-sm text-left flex items-center justify-between transition-all ${
                    selectedSubcategory === subcat
                      ? 'bg-black text-white ring-2 ring-black shadow-sm'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4 text-amber-500" />
                    <span>{subcat}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Capacity Filter (e.g. 200 kVA, 400 kVA, 3600Wh, 1024Wh) */}
          {selectedSubcategory && availableCapacities.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Select Capacity Rating
                </label>
                {selectedCapacity && (
                  <button
                    type="button"
                    onClick={() => setSelectedCapacity(null)}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    View All Capacities
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {availableCapacities.map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setSelectedCapacity(cap === selectedCapacity ? null : cap)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold tracking-tight transition-all ${
                      selectedCapacity === cap
                        ? 'bg-[#C8102E] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    ⚡️ {cap}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Power Products List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Power Solutions Inventory ({powerFilteredProducts.length})
            </h3>

            {powerFilteredProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No products found matching the selected power criteria.
              </div>
            ) : (
              <div className="space-y-2.5">
                {powerFilteredProducts.map((prod) => {
                  const status = getStockStatus(prod.quantity, prod.minimumStock);
                  const style = getStatusStyle(status);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => openProductDetails(prod.id)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-red-400 bg-white hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-700">
                            {prod.name}
                          </span>
                          {prod.capacity && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                              {prod.capacity}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                          <span>{prod.brand}</span>
                          <span>·</span>
                          <span>{prod.subcategory}</span>
                          {prod.powerRating && (
                            <>
                              <span>·</span>
                              <span>{prod.powerRating}</span>
                            </>
                          )}
                          {prod.voltage && (
                            <>
                              <span>·</span>
                              <span>{prod.voltage}</span>
                            </>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          {prod.productCode} · {prod.storageLocation}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-900">
                            {formatCurrency(prod.sellingPrice, settings.currency)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-xs font-bold text-slate-800">
                              Qty: {prod.quantity}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badgeClass}`}>
                              {style.label}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CASE C: ACCESSORIES / OTHER --- */}
      {category === 'accessories' && (
        <div className="space-y-4">
          {/* Subcategory Pills */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Accessory Category
              </label>
              {selectedSubcategory && (
                <button
                  type="button"
                  onClick={() => setSelectedSubcategory(null)}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSubcategory(null)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  !selectedSubcategory
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Accessories ({categoryProducts.length})
              </button>

              {accessorySubcategories.map((subcat) => {
                const count = categoryProducts.filter((p) => p.subcategory === subcat).length;
                return (
                  <button
                    key={subcat}
                    type="button"
                    onClick={() => setSelectedSubcategory(subcat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedSubcategory === subcat
                        ? 'bg-[#C8102E] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{subcat}</span>
                    <span className="text-[10px] opacity-80 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessories Products List */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              {selectedSubcategory || 'All Accessories'} ({accessoryFilteredProducts.length})
            </h3>

            {accessoryFilteredProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No accessories found in this subcategory.
              </div>
            ) : (
              <div className="space-y-2.5">
                {accessoryFilteredProducts.map((prod) => {
                  const status = getStockStatus(prod.quantity, prod.minimumStock);
                  const style = getStatusStyle(status);

                  return (
                    <div
                      key={prod.id}
                      onClick={() => openProductDetails(prod.id)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-red-400 bg-white hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-red-700">
                            {prod.name}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {prod.subcategory}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500">
                          {prod.specs || prod.notes}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          {prod.productCode} · {prod.storageLocation}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-900">
                            {formatCurrency(prod.sellingPrice, settings.currency)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-xs font-bold text-slate-800">
                              Qty: {prod.quantity}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badgeClass}`}>
                              {style.label}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-red-600 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
