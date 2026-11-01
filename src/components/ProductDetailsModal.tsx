/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  ArrowUpRight,
  Edit,
  History,
  Printer,
  MapPin,
  Truck,
  Calendar,
  Layers,
  Cpu,
  Hash,
  AlertCircle,
  Archive,
  Check,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { getStockStatus, getStatusStyle, formatCurrency } from '../utils/formatters';
import { RestockModal } from './RestockModal';
import { StockOutModal } from './StockOutModal';
import { BarcodeLabelModal } from './BarcodeLabelModal';

export const ProductDetailsModal: React.FC = () => {
  const {
    selectedProductId,
    closeProductDetails,
    products,
    settings,
    currentUser,
    setActiveView,
    archiveProduct,
  } = useInventory();

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isBarcodeLabelOpen, setIsBarcodeLabelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for edit mode
  const targetProduct = products.find((p) => p.id === selectedProductId);

  const [editName, setEditName] = useState(targetProduct?.name || '');
  const [editBuyingPrice, setEditBuyingPrice] = useState(targetProduct?.buyingPrice || 0);
  const [editSellingPrice, setEditSellingPrice] = useState(targetProduct?.sellingPrice || 0);
  const [editMinStock, setEditMinStock] = useState(targetProduct?.minimumStock || 3);
  const [editLocation, setEditLocation] = useState(targetProduct?.storageLocation || '');
  const [editSupplier, setEditSupplier] = useState(targetProduct?.supplier || '');
  const [editNotes, setEditNotes] = useState(targetProduct?.notes || '');

  const { updateProduct } = useInventory();

  if (!selectedProductId || !targetProduct) return null;

  const status = getStockStatus(targetProduct.quantity, targetProduct.minimumStock);
  const style = getStatusStyle(status);

  // Potential margin calculation
  const unitPotentialMargin = targetProduct.sellingPrice - targetProduct.buyingPrice;
  const totalPotentialMargin = unitPotentialMargin * targetProduct.quantity;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProduct(targetProduct.id, {
      name: editName,
      buyingPrice: Number(editBuyingPrice),
      sellingPrice: Number(editSellingPrice),
      minimumStock: Number(editMinStock),
      storageLocation: editLocation,
      supplier: editSupplier,
      notes: editNotes,
    });
    setIsEditing(false);
  };

  const handleArchive = () => {
    if (confirm(`Are you sure you want to archive "${targetProduct.name}"? It will be safely retained in historical records.`)) {
      archiveProduct(targetProduct.id);
      closeProductDetails();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Bar */}
        <div className="bg-[#C8102E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {targetProduct.category === 'laptop'
                ? '💻'
                : targetProduct.category === 'desktop'
                ? '🖥️'
                : targetProduct.category === 'power'
                ? '⚡️'
                : '🔧'}
            </span>
            <div className="leading-tight">
              <h3 className="font-bold text-base line-clamp-1">{targetProduct.name}</h3>
              <p className="text-[11px] text-white/80 font-mono tracking-wider">
                {targetProduct.productCode}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeProductDetails}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/20 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Hero & Status Strip */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-44 h-40 sm:h-36 rounded-2xl bg-slate-900 overflow-hidden relative shrink-0">
              <img
                src={targetProduct.image}
                alt={targetProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                {targetProduct.condition}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badgeClass}`}>
                  {style.icon} {style.label}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Min Stock: {targetProduct.minimumStock} units
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {targetProduct.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {targetProduct.brand} • {targetProduct.model} • {targetProduct.subcategory}
                </p>
              </div>

              {/* Quantity Highlight */}
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {targetProduct.quantity}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Units in stock
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Strip (Add Stock, Stock Out, Edit, History, Print) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
            {/* Add Stock */}
            <button
              type="button"
              disabled={currentUser.role === 'viewer'}
              onClick={() => setIsRestockOpen(true)}
              className="h-11 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Stock
            </button>

            {/* Stock Out */}
            <button
              type="button"
              disabled={currentUser.role === 'viewer' || targetProduct.quantity === 0}
              onClick={() => setIsStockOutOpen(true)}
              className="h-11 px-3 bg-[#C8102E] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              Stock Out
            </button>

            {/* Edit */}
            <button
              type="button"
              disabled={currentUser.role === 'viewer'}
              onClick={() => setIsEditing(!isEditing)}
              className="h-11 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Edit className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Details'}
            </button>

            {/* Barcode / Print */}
            <button
              type="button"
              onClick={() => setIsBarcodeLabelOpen(true)}
              className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Print Label
            </button>
          </div>

          {/* EDIT FORM (if active) */}
          {isEditing && (
            <form onSubmit={handleSaveEdit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Edit Product Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Buying Price ({settings.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editBuyingPrice}
                    onChange={(e) => setEditBuyingPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Selling Price ({settings.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editSellingPrice}
                    onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={editSupplier}
                    onChange={(e) => setEditSupplier(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-black text-xs font-semibold text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Pricing & Financial Overview */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Financial & Valuation
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Buying Price</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatCurrency(targetProduct.buyingPrice, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Selling Price</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {formatCurrency(targetProduct.sellingPrice, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Unit Margin</span>
                <span className="text-sm font-bold text-blue-700 font-mono">
                  {formatCurrency(unitPotentialMargin, settings.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Potential Stock Margin</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatCurrency(totalPotentialMargin, settings.currency)}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              *Potential margin is calculated based on unsold quantity. Realized profits are recorded in Stock Out transactions.
            </p>
          </div>

          {/* Specifications (Laptops, Desktops, Power, Accessories) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Technical Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {targetProduct.cpu && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">Processor (CPU):</span>
                  <span className="font-semibold text-slate-900 text-right">{targetProduct.cpu}</span>
                </div>
              )}
              {targetProduct.ram && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">RAM:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.ram}</span>
                </div>
              )}
              {targetProduct.ssd && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">SSD Storage:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.ssd}</span>
                </div>
              )}
              {targetProduct.hdd && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">HDD Storage:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.hdd}</span>
                </div>
              )}
              {targetProduct.gpu && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">Graphics (GPU):</span>
                  <span className="font-semibold text-slate-900">{targetProduct.gpu}</span>
                </div>
              )}
              {targetProduct.screenSize && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">Display:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.screenSize}</span>
                </div>
              )}
              {targetProduct.capacity && (
                <div className="p-2.5 rounded-xl bg-amber-50/60 flex items-center justify-between">
                  <span className="text-amber-800 font-semibold">Capacity Rating:</span>
                  <span className="font-bold text-amber-900">{targetProduct.capacity}</span>
                </div>
              )}
              {targetProduct.voltage && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">Voltage:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.voltage}</span>
                </div>
              )}
              {targetProduct.powerRating && (
                <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">Power Rating:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.powerRating}</span>
                </div>
              )}
              {targetProduct.specs && (
                <div className="col-span-full p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <span className="text-slate-500">Specifications:</span>
                  <span className="font-semibold text-slate-900">{targetProduct.specs}</span>
                </div>
              )}
            </div>
          </div>

          {/* SERIAL NUMBERS TRACKING (Requirement 7) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-red-600" />
                Serial Number Tracking ({targetProduct.serialNumbers?.length || 0})
              </h4>
              <span className="text-[11px] text-slate-500">
                {targetProduct.serialNumbers?.filter((s) => s.status === 'In Stock').length || 0} in stock units
              </span>
            </div>

            {(!targetProduct.serialNumbers || targetProduct.serialNumbers.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-2">
                No individual serial numbers recorded for this accessory item.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {targetProduct.serialNumbers.map((sn) => {
                  const isStock = sn.status === 'In Stock';
                  const isSold = sn.status === 'Sold';
                  const isDamaged = sn.status === 'Damaged';

                  return (
                    <div
                      key={sn.id}
                      className="py-2 flex items-center justify-between text-xs"
                    >
                      <div className="font-mono font-bold text-slate-800">
                        {sn.serialNumber}
                      </div>

                      <div className="flex items-center gap-2">
                        {sn.soldDate && (
                          <span className="text-[10px] text-slate-400">
                            {sn.soldDate}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isStock
                              ? 'bg-emerald-100 text-emerald-800'
                              : isSold
                              ? 'bg-slate-200 text-slate-700'
                              : isDamaged
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sn.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logistics, Location & Supplier Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Physical Location:</span>
                <span className="text-slate-600">{targetProduct.storageLocation}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Supplier:</span>
                <span className="text-slate-600">{targetProduct.supplier}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Date Added:</span>
                <span className="text-slate-600">{targetProduct.dateAdded}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-700 block">Last Stock Date:</span>
                <span className="text-slate-600">{targetProduct.lastStockDate}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {targetProduct.notes && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-0.5">Notes:</span>
              <p>{targetProduct.notes}</p>
            </div>
          )}

          {/* History link & Archive */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                closeProductDetails();
                setActiveView('stock_history');
              }}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              View Stock Audit History for this Product →
            </button>

            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={handleArchive}
                className="text-xs text-slate-400 hover:text-rose-600 font-semibold flex items-center gap-1"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {isRestockOpen && (
        <RestockModal
          productId={targetProduct.id}
          onClose={() => setIsRestockOpen(false)}
        />
      )}

      {isStockOutOpen && (
        <StockOutModal
          productId={targetProduct.id}
          onClose={() => setIsStockOutOpen(false)}
        />
      )}

      {isBarcodeLabelOpen && (
        <BarcodeLabelModal
          product={targetProduct}
          onClose={() => setIsBarcodeLabelOpen(false)}
        />
      )}
    </div>
  );
};
