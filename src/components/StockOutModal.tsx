/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  X,
  AlertTriangle,
  Check,
  Hash,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StockOutReason } from '../types/inventory';
import { getCurrentDateTimeFormatted } from '../utils/formatters';

interface StockOutModalProps {
  productId?: string;
  onClose: () => void;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  productId,
  onClose,
}) => {
  const { products, stockOutProduct, currentUser } = useInventory();

  // If productId passed in, default to it; otherwise select from dropdown
  const [selectedId, setSelectedId] = useState<string>(
    productId || products.filter((p) => p.quantity > 0)[0]?.id || ''
  );

  const targetProduct = useMemo(() => {
    return products.find((p) => p.id === selectedId);
  }, [products, selectedId]);

  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<StockOutReason>('Sold');
  const [notes, setNotes] = useState<string>('');
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // In-stock serial numbers for target product
  const inStockSerials = useMemo(() => {
    if (!targetProduct || !targetProduct.serialNumbers) return [];
    return targetProduct.serialNumbers.filter((s) => s.status === 'In Stock');
  }, [targetProduct]);

  const toggleSerial = (serial: string) => {
    if (selectedSerials.includes(serial)) {
      setSelectedSerials(selectedSerials.filter((s) => s !== serial));
    } else {
      if (selectedSerials.length < quantity) {
        setSelectedSerials([...selectedSerials, serial]);
      } else {
        // Automatically adjust quantity if more serials selected
        setSelectedSerials([...selectedSerials, serial]);
        setQuantity(selectedSerials.length + 1);
      }
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!targetProduct) {
      setErrorMessage('Please select a product.');
      return;
    }

    if (quantity <= 0) {
      setErrorMessage('Quantity must be at least 1.');
      return;
    }

    if (quantity > targetProduct.quantity) {
      setErrorMessage(
        `Cannot remove ${quantity} units. Only ${targetProduct.quantity} units are in stock.`
      );
      return;
    }

    // If product has serials, check serials
    if (inStockSerials.length > 0 && selectedSerials.length > 0 && selectedSerials.length !== quantity) {
      setErrorMessage(`Please select exactly ${quantity} serial number(s) to match the quantity.`);
      return;
    }

    setIsConfirming(true);
  };

  const handleFinalConfirm = () => {
    if (!targetProduct) return;

    const res = stockOutProduct(
      targetProduct.id,
      Number(quantity),
      selectedSerials,
      reason,
      notes
    );

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Failed to complete stock out transaction.');
      setIsConfirming(false);
    }
  };

  const { date, time } = getCurrentDateTimeFormatted();

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#C8102E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            <h3 className="font-bold text-base">Record Stock Out</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isConfirming ? (
            /* Confirmation step (Requirement 28) */
            <div className="py-4 space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Confirm Stock Removal
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Are you sure you want to remove <strong className="text-red-600">{quantity} units</strong> of{' '}
                  <strong>{targetProduct?.name}</strong>?
                </p>
                <div className="text-xs text-slate-500 font-mono mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 inline-block text-left">
                  <div>Current Stock: {targetProduct?.quantity}</div>
                  <div>Units to Remove: -{quantity}</div>
                  <div className="font-bold text-slate-800">
                    New Resulting Stock: {(targetProduct?.quantity || 0) - quantity}
                  </div>
                  <div>Reason: {reason}</div>
                  {selectedSerials.length > 0 && (
                    <div>Serials: {selectedSerials.join(', ')}</div>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="flex-1 h-12 rounded-xl bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Product
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setSelectedSerials([]);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  disabled={!!productId}
                >
                  {products
                    .filter((p) => !p.archived && p.quantity > 0)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.quantity} in stock) · {p.productCode}
                      </option>
                    ))}
                </select>
              </div>

              {targetProduct && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Available In Stock:</span>
                    <span className="ml-1.5 font-bold font-mono text-slate-900 text-sm">
                      {targetProduct.quantity} units
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">
                    Min: {targetProduct.minimumStock}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity to Remove
                </label>
                <input
                  type="number"
                  min="1"
                  max={targetProduct?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold font-mono"
                  required
                />
              </div>

              {/* Serial Number Selection if product has serials */}
              {inStockSerials.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-red-600" />
                      Select Serial Numbers ({selectedSerials.length}/{quantity})
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Tap serial to mark for stock-out
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    {inStockSerials.map((sn) => {
                      const isChecked = selectedSerials.includes(sn.serialNumber);
                      return (
                        <button
                          key={sn.id}
                          type="button"
                          onClick={() => toggleSerial(sn.serialNumber)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'bg-red-600 text-white font-bold'
                              : 'bg-white text-slate-800 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          <span>{sn.serialNumber}</span>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Reason for Stock Out
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Sold', 'Damaged', 'Returned', 'Transferred', 'Other'] as const).map(
                    (r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all ${
                          reason === r
                            ? 'bg-black text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Date & User (Read-only / Audit) */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Date / Time</span>
                  <span>{date} {time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Staff User</span>
                  <span className="truncate block font-semibold text-slate-700">{currentUser.name}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Transaction Notes / Client Receipt #
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sold to Bole client, invoice #892"
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full h-12 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-98 transition-transform"
              >
                Proceed to Confirmation →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
