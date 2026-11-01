/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StockStatus } from '../types/inventory';

export function formatCurrency(amount: number, currency: string = 'ETB'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount || 0);

  return `${formatted} ${currency}`;
}

export function getStockStatus(quantity: number, minimumStock: number): StockStatus {
  if (quantity <= 0) {
    return 'OUT OF STOCK';
  }
  if (quantity <= minimumStock) {
    return 'LOW STOCK';
  }
  return 'IN STOCK';
}

export function getStatusStyle(status: StockStatus) {
  switch (status) {
    case 'IN STOCK':
      return {
        label: 'IN STOCK',
        dotClass: 'bg-emerald-500',
        badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
        textClass: 'text-emerald-600',
        icon: '🟢',
      };
    case 'LOW STOCK':
      return {
        label: 'LOW STOCK',
        dotClass: 'bg-amber-500',
        badgeClass: 'text-amber-700 bg-amber-50 border border-amber-200',
        textClass: 'text-amber-600',
        icon: '🟠',
      };
    case 'OUT OF STOCK':
      return {
        label: 'OUT OF STOCK',
        dotClass: 'bg-rose-500',
        badgeClass: 'text-rose-700 bg-rose-50 border border-rose-200',
        textClass: 'text-rose-600',
        icon: '🔴',
      };
  }
}

export function generateProductCode(
  category: string,
  brand: string,
  model: string,
  existingCodes: string[]
): string {
  const catPrefix = 
    category === 'laptop' ? 'LAP' :
    category === 'desktop' ? 'DESK' :
    category === 'power' ? 'PWR' : 'ACC';

  const cleanBrand = (brand || 'GEN')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);

  const cleanModel = (model || 'MOD')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

  let seq = 1;
  let code = `${catPrefix}-${cleanBrand}-${cleanModel}-${String(seq).padStart(3, '0')}`;
  
  while (existingCodes.includes(code)) {
    seq++;
    code = `${catPrefix}-${cleanBrand}-${cleanModel}-${String(seq).padStart(3, '0')}`;
  }

  return code;
}

export function getCurrentDateTimeFormatted(): { date: string; time: string } {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { date, time };
}

export function downloadCSV(filename: string, csvData: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
