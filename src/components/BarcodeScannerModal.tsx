/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Barcode,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const BarcodeScannerModal: React.FC = () => {
  const {
    isScannerModalOpen,
    setIsScannerModalOpen,
    products,
    openProductDetails,
    setActiveView,
    setScannedCodeForAdd,
  } = useInventory();

  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    found: boolean;
    code: string;
    productId?: string;
    productName?: string;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera on unmount or close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!isScannerModalOpen) {
      stopCamera();
      setScanResult(null);
      setManualCode('');
      setCameraError(null);
    }
  }, [isScannerModalOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access not supported on this browser/environment.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setCameraError('Camera permission denied or camera unavailable in this frame.');
      setCameraActive(false);
    }
  };

  const handleLookup = (codeToLookup: string) => {
    const cleanCode = codeToLookup.trim();
    if (!cleanCode) return;

    // Check if matches productCode or any serial number
    const matched = products.find(
      (p) =>
        !p.archived &&
        (p.productCode.toUpperCase() === cleanCode.toUpperCase() ||
          p.serialNumbers.some(
            (sn) => sn.serialNumber.toUpperCase() === cleanCode.toUpperCase()
          ))
    );

    if (matched) {
      setScanResult({
        found: true,
        code: cleanCode,
        productId: matched.id,
        productName: matched.name,
      });
      // Automatically open after short visual confirmation
      setTimeout(() => {
        openProductDetails(matched.id);
        setIsScannerModalOpen(false);
      }, 700);
    } else {
      setScanResult({
        found: false,
        code: cleanCode,
      });
    }
  };

  const handleAddNewProductWithScanned = () => {
    if (scanResult) {
      setScannedCodeForAdd(scanResult.code);
      setIsScannerModalOpen(false);
      setActiveView('add_item');
    }
  };

  if (!isScannerModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#C8102E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            <h3 className="font-bold text-base">Barcode & QR Scanner</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setIsScannerModalOpen(false);
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/90 hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Scanner Viewport */}
          <div className="relative aspect-4/3 w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800">
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">
                  {cameraError || 'Camera feed ready'}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Enable Camera
                </button>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-red-500/80 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500 animate-pulse shadow-sm shadow-red-500" />
            </div>

            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center bg-black/60 backdrop-blur-xs py-1 rounded-lg text-[11px] text-white/90 font-mono">
              Align barcode or enter code below
            </div>
          </div>

          {/* Result Alert if evaluated */}
          {scanResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                scanResult.found
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {scanResult.found ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold font-mono">
                    Scanned: {scanResult.code}
                  </div>
                  <div className="text-xs font-semibold">
                    {scanResult.found
                      ? `Found: ${scanResult.productName}`
                      : 'Product not found'}
                  </div>
                </div>
              </div>

              {!scanResult.found && (
                <button
                  type="button"
                  onClick={handleAddNewProductWithScanned}
                  className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Product
                </button>
              )}
            </div>
          )}

          {/* Manual Code Input Bar */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Manual Barcode or Serial Number Entry
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualCode);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. LAP-DELL-5420-001 or serial..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none"
              />
              <button
                type="submit"
                className="px-4 h-11 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
              >
                Lookup
              </button>
            </form>
          </div>

          {/* Sample quick-scan buttons for rapid demo testing */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Test Codes (Tap to Test)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'LAP-DELL-5420-001',
                'UPS-KSTAR-200KVA-001',
                'ECO-DELTA-PRO-001',
                'DL5420-ABC123',
                'UNREGISTERED-BARCODE-999',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setManualCode(sample);
                    handleLookup(sample);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
