/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  X,
  Sparkles,
  Camera,
  Hash,
  AlertTriangle,
  Layers,
  Cpu,
  BatteryCharging,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { CategoryType, ProductCondition, SerialNumberItem } from '../types/inventory';
import { generateProductCode, formatCurrency } from '../utils/formatters';

export const AddItemModal: React.FC = () => {
  const {
    addProduct,
    setActiveView,
    settings,
    products,
    scannedCodeForAdd,
    setScannedCodeForAdd,
    openProductDetails,
  } = useInventory();

  // Category & Core Info
  const [category, setCategory] = useState<CategoryType>('laptop');
  const [subcategory, setSubcategory] = useState<string>('Business Laptop');
  const [brand, setBrand] = useState<string>('Dell');
  const [model, setModel] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [condition, setCondition] = useState<ProductCondition>('Brand New');
  const [quantity, setQuantity] = useState<number>(1);
  const [minimumStock, setMinimumStock] = useState<number>(settings.defaultMinStock || 3);
  const [buyingPrice, setBuyingPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [productCode, setProductCode] = useState<string>(scannedCodeForAdd || '');
  const [supplier, setSupplier] = useState<string>('Dubai Tech Import PLC');
  const [storageLocation, setStorageLocation] = useState<string>('Store A · Shelf 1 · Section A');
  const [notes, setNotes] = useState<string>('');
  const [image, setImage] = useState<string>('/src/assets/images/laptop_showcase_1793514783594.jpg');

  // Computer specific fields
  const [cpu, setCpu] = useState<string>('Intel Core i5-1145G7');
  const [ram, setRam] = useState<string>('16GB DDR4');
  const [ssd, setSsd] = useState<string>('512GB NVMe SSD');
  const [hdd, setHdd] = useState<string>('None');
  const [gpu, setGpu] = useState<string>('Intel Iris Xe Graphics');
  const [screenSize, setScreenSize] = useState<string>('14.0" FHD IPS');

  // Power solutions fields
  const [capacity, setCapacity] = useState<string>('200 kVA');
  const [voltage, setVoltage] = useState<string>('400V 3-Phase');
  const [powerRating, setPowerRating] = useState<string>('180 kW');

  // Accessory fields
  const [specs, setSpecs] = useState<string>('');

  // Serial numbers input
  const [serialNumbersText, setSerialNumbersText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Update default subcategory and image when category changes
  useEffect(() => {
    if (category === 'laptop') {
      setSubcategory('Business Laptop');
      setBrand('Dell');
      setImage('/src/assets/images/laptop_showcase_1793514783594.jpg');
    } else if (category === 'desktop') {
      setSubcategory('Desktop SFF');
      setBrand('HP');
      setImage('/src/assets/images/desktop_workstation_1793514784216.jpg');
    } else if (category === 'power') {
      setSubcategory('UPS');
      setBrand('KSTAR');
      setImage('/src/assets/images/power_solutions_1793514785097.jpg');
    } else {
      setSubcategory('RAM');
      setBrand('Kingston');
      setImage('/src/assets/images/accessories_hardware_1793514784874.jpg');
    }
  }, [category]);

  // Pre-fill scanned barcode if available
  useEffect(() => {
    if (scannedCodeForAdd) {
      setProductCode(scannedCodeForAdd);
    }
  }, [scannedCodeForAdd]);

  // Live Auto-generate Name if empty or brand/model changed
  const handleAutoGenerateName = () => {
    if (category === 'laptop' || category === 'desktop') {
      const generated = `${brand} ${model || 'Series'} ${cpu ? cpu.split(' ')[0] : ''} ${condition}`;
      setName(generated.trim());
    } else if (category === 'power') {
      const generated = `${brand} ${subcategory} ${capacity || model}`;
      setName(generated.trim());
    } else {
      const generated = `${brand} ${model || subcategory}`;
      setName(generated.trim());
    }
  };

  // Auto-generate code
  const handleAutoGenerateCode = () => {
    const existing = products.map((p) => p.productCode);
    const code = generateProductCode(category, brand, model || subcategory, existing);
    setProductCode(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    const finalName = name.trim() || `${brand} ${model || subcategory}`.trim();
    if (!finalName) {
      setError('Please provide a product name.');
      return;
    }

    if (quantity < 0) {
      setError('Quantity cannot be negative.');
      return;
    }

    // Process serial numbers
    const rawSerials = serialNumbersText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const serialItems: SerialNumberItem[] = rawSerials.map((sn, idx) => ({
      id: `sn-${Date.now()}-${idx}`,
      serialNumber: sn,
      status: 'In Stock',
      dateAdded: new Date().toISOString().split('T')[0],
    }));

    const result = addProduct({
      name: finalName,
      category,
      subcategory,
      brand,
      model: model.trim() || subcategory,
      condition,
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
      buyingPrice: Number(buyingPrice),
      sellingPrice: Number(sellingPrice),
      productCode: productCode.trim(),
      supplier,
      storageLocation,
      image,
      notes,
      cpu: (category === 'laptop' || category === 'desktop') ? cpu : undefined,
      ram: (category === 'laptop' || category === 'desktop') ? ram : undefined,
      ssd: (category === 'laptop' || category === 'desktop') ? ssd : undefined,
      hdd: (category === 'laptop' || category === 'desktop') ? hdd : undefined,
      gpu: (category === 'laptop' || category === 'desktop') ? gpu : undefined,
      screenSize: (category === 'laptop' || category === 'desktop') ? screenSize : undefined,
      capacity: category === 'power' ? capacity : undefined,
      voltage: category === 'power' ? voltage : undefined,
      powerRating: category === 'power' ? powerRating : undefined,
      specs: category === 'accessories' ? specs : undefined,
      serialNumbers: serialItems,
    });

    if (result.success && result.product) {
      setScannedCodeForAdd(null);
      openProductDetails(result.product.id);
      setActiveView('inventory');
    } else {
      setError(result.error || 'Failed to add product. Please check your inputs.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-red-600" />
            Add New Inventory Item
          </h1>
          <p className="text-xs text-slate-500">
            Create unified product entry with serial tracking and storage location
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setScannedCodeForAdd(null);
            setActiveView('inventory');
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs space-y-6">
        {/* Step 1: Category Selection */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            1. Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'laptop' as CategoryType, label: '💻 Laptop' },
              { id: 'desktop' as CategoryType, label: '🖥️ Desktop' },
              { id: 'power' as CategoryType, label: '⚡️ Power Solutions' },
              { id: 'accessories' as CategoryType, label: '🔧 Accessories' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`h-12 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  category === cat.id
                    ? 'bg-[#C8102E] text-white shadow-sm ring-2 ring-red-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Primary Attributes */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            2. General Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Brand */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Brand *</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Dell, HP, EcoFlow, KSTAR"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-semibold"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Model *</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Latitude 5420, DELTA Pro"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-semibold"
                required
              />
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Condition *</label>
              <div className="grid grid-cols-2 gap-1.5 h-11">
                {(['Brand New', 'Used'] as const).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`rounded-xl text-xs font-bold transition-all ${
                      condition === cond
                        ? 'bg-black text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Product Display Name *</label>
              <button
                type="button"
                onClick={handleAutoGenerateName}
                className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Fill Name
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dell Latitude 5420 Intel Core i5 8GB RAM 256GB SSD Used"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-semibold"
              required
            />
          </div>
        </div>

        {/* Step 3: Dynamic Category-Specific Fields */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span>3. Category Specifications</span>
            <span className="text-red-600 font-mono">({category.toUpperCase()})</span>
          </div>

          {(category === 'laptop' || category === 'desktop') && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Processor (CPU)</label>
                <input
                  type="text"
                  value={cpu}
                  onChange={(e) => setCpu(e.target.value)}
                  placeholder="e.g. Core i5-1145G7"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">RAM</label>
                <input
                  type="text"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  placeholder="e.g. 16GB DDR4"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">SSD Storage</label>
                <input
                  type="text"
                  value={ssd}
                  onChange={(e) => setSsd(e.target.value)}
                  placeholder="e.g. 512GB NVMe"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">HDD Storage</label>
                <input
                  type="text"
                  value={hdd}
                  onChange={(e) => setHdd(e.target.value)}
                  placeholder="e.g. None or 1TB"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Graphics (GPU)</label>
                <input
                  type="text"
                  value={gpu}
                  onChange={(e) => setGpu(e.target.value)}
                  placeholder="e.g. Intel Iris Xe"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Screen / Form Factor</label>
                <input
                  type="text"
                  value={screenSize}
                  onChange={(e) => setScreenSize(e.target.value)}
                  placeholder='e.g. 14.0" FHD IPS or SFF'
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {category === 'power' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Capacity Rating *</label>
                <input
                  type="text"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 200 kVA, 400 kVA, 3600Wh, 1024Wh"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Voltage Rating</label>
                <input
                  type="text"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="e.g. 400V 3-Phase or 230V AC"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Power Output</label>
                <input
                  type="text"
                  value={powerRating}
                  onChange={(e) => setPowerRating(e.target.value)}
                  placeholder="e.g. 180 kW or 3600W (Surge 7200W)"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {category === 'accessories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  {[
                    'RAM',
                    'SSD',
                    'HDD',
                    'Cables',
                    'Laptop Chargers',
                    'Adapters',
                    'Keyboard',
                    'Mouse',
                    'Other Accessories',
                  ].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Technical Specs</label>
                <input
                  type="text"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="e.g. 3200MHz CL16 or PCIe 4.0 7000MB/s"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Inventory Quantities & Pricing */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            4. Stock Levels & Pricing ({settings.currency})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Initial Quantity *</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Min Stock Alert *</label>
              <input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Math.max(0, Number(e.target.value)))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Buying Price</label>
              <input
                type="number"
                min="0"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price</label>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-bold font-mono text-emerald-700"
              />
            </div>
          </div>

          {/* Live Potential Margin Display */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Estimated Unit Margin:</span>
            <span className="font-bold font-mono text-slate-900">
              {formatCurrency(sellingPrice - buyingPrice, settings.currency)}
            </span>
          </div>
        </div>

        {/* Step 5: Product Code & Tracking */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            5. Tracking, Code & Logistics
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Product Code */}
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Product Code *</label>
                <button
                  type="button"
                  onClick={handleAutoGenerateCode}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Generate
                </button>
              </div>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value.toUpperCase())}
                placeholder="e.g. LAP-DELL-5420-001"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-mono font-bold"
              />
            </div>

            {/* Storage Location */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Physical Location</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Store A Shelf 3 Section B"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Dubai Tech Import PLC"
                className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Serial Numbers (Requirement 7) */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Hash className="w-3.5 h-3.5 text-red-600" />
              Serial Numbers (For Tracking Individual Units)
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              Enter serial numbers separated by comma or new lines (up to {quantity} units).
            </p>
            <textarea
              value={serialNumbersText}
              onChange={(e) => setSerialNumbersText(e.target.value)}
              placeholder="e.g.&#10;ABC123&#10;ABC124&#10;ABC125"
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Warranty details, package contents, cosmetic condition..."
              rows={2}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={() => setActiveView('inventory')}
            className="flex-1 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 h-12 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-98 transition-transform"
          >
            Create Product in Inventory
          </button>
        </div>
      </form>
    </div>
  );
};
