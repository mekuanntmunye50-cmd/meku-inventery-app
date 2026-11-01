/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Barcode, QrCode } from 'lucide-react';
import { Product } from '../types/inventory';
import { formatCurrency } from '../utils/formatters';
import { useInventory } from '../context/InventoryContext';

interface BarcodeLabelModalProps {
  product: Product;
  onClose: () => void;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  product,
  onClose,
}) => {
  const { settings } = useInventory();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-base">Shelf Label & Barcode</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Physical Label Preview */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center">
          <div
            id="printable-shelf-label"
            className="w-full max-w-[340px] bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-md text-slate-900 space-y-3"
          >
            {/* Brand Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-extrabold text-base tracking-tight text-[#C8102E]">
                  meku
                </span>
                <span className="text-[11px] font-bold text-slate-700 tracking-wider">
                  MEKU COMPUTERS
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
                {product.condition}
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {product.brand} · {product.model} {product.capacity ? `· ${product.capacity}` : ''}
              </p>
            </div>

            {/* SVG Barcode Visualization */}
            <div className="py-1 text-center bg-white flex flex-col items-center">
              <svg className="w-56 h-12" viewBox="0 0 220 50">
                {/* Generates realistic variable bar pattern based on code */}
                {Array.from({ length: 42 }).map((_, i) => {
                  const width = (i % 3 === 0 || i % 7 === 0) ? 3 : (i % 2 === 0 ? 1.5 : 1);
                  const x = 10 + i * 4.8;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y="2"
                      width={width}
                      height="46"
                      fill="#000000"
                    />
                  );
                })}
              </svg>
              <div className="text-xs font-mono font-bold tracking-widest mt-1 text-slate-900">
                {product.productCode}
              </div>
            </div>

            {/* Price & Location Footer */}
            <div className="pt-2 border-t-2 border-slate-900 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  Location
                </span>
                <span className="text-xs font-semibold text-slate-800 font-mono">
                  {product.storageLocation || 'Store A'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  Retail Price
                </span>
                <span className="text-base font-extrabold text-slate-900 font-mono">
                  {formatCurrency(product.sellingPrice, settings.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-11 rounded-xl bg-[#C8102E] hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Barcode Label
          </button>
        </div>
      </div>
    </div>
  );
};
