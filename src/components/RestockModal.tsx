/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, X, AlertTriangle, Hash } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface RestockModalProps {
  productId?: string;
  onClose: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  productId,
  onClose,
}) => {
  const { products, restockProduct, settings } = useInventory();

  const [selectedId, setSelectedId] = useState<string>(
    productId || products[0]?.id || ''
  );

  const targetProduct = useMemo(() => {
    return products.find((p) => p.id === selectedId);
  }, [products, selectedId]);

  const [quantityToAdd, setQuantityToAdd] = useState<number>(5);
  const [unitCost, setUnitCost] = useState<number>(targetProduct?.buyingPrice || 0);
  const [serialsInput, setSerialsInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetProduct) {
      setError('Please select a product.');
      return;
    }

    if (quantityToAdd <= 0) {
      setError('Quantity to add must be at least 1.');
      return;
    }

    // Split serial numbers if entered
    const serialList = serialsInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const res = restockProduct(
      targetProduct.id,
      Number(quantityToAdd),
      serialList,
      notes,
      Number(unitCost)
    );

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to restock product.');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-bold text-base">Restock Existing Product</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Product to Restock
            </label>
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p) setUnitCost(p.buyingPrice);
              }}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              disabled={!!productId}
            >
              {products
                .filter((p) => !p.archived)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.quantity}) · {p.productCode}
                  </option>
                ))}
            </select>
          </div>

          {targetProduct && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500">Current Qty:</span>
                <span className="ml-1.5 font-bold font-mono text-slate-900 text-sm">
                  {targetProduct.quantity} units
                </span>
              </div>
              <div className="text-emerald-700 font-bold font-mono">
                → New Total: {targetProduct.quantity + Number(quantityToAdd || 0)} units
              </div>
            </div>
          )}

          {/* Quantity to Add */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quantity to Add (+units)
              </label>
              <input
                type="number"
                min="1"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(Math.max(1, Number(e.target.value)))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Buying Cost / Unit ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>
          </div>

          {/* New Serial Numbers (Optional/Recommended for Laptops/Desktops/UPS) */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              New Unit Serial Numbers (Optional)
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Enter serial numbers separated by comma or new lines.
            </p>
            <textarea
              value={serialsInput}
              onChange={(e) => setSerialsInput(e.target.value)}
              placeholder="e.g.&#10;SN-88201&#10;SN-88202"
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Restock Notes / Shipment PO #
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cargo shipment from Dubai port arrived"
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition-transform"
          >
            Confirm Restock (+{quantityToAdd} Units)
          </button>
        </form>
      </div>
    </div>
  );
};
