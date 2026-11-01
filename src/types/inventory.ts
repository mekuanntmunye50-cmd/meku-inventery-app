/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'laptop' | 'desktop' | 'power' | 'accessories';

export type ProductCondition = 'Brand New' | 'Used';

export type StockStatus = 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';

export type SerialStatus = 'In Stock' | 'Sold' | 'Damaged' | 'Transferred';

export interface SerialNumberItem {
  id: string;
  serialNumber: string;
  status: SerialStatus;
  dateAdded: string;
  soldDate?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  subcategory: string;
  brand: string;
  model: string;
  condition: ProductCondition;
  quantity: number;
  minimumStock: number;
  buyingPrice: number;
  sellingPrice: number;
  productCode: string;
  supplier: string;
  storageLocation: string;
  image: string;
  notes: string;
  dateAdded: string;
  lastStockDate: string;
  lastStockOutDate?: string;
  archived?: boolean;

  // Computer specific fields
  cpu?: string;
  ram?: string;
  ssd?: string;
  hdd?: string;
  gpu?: string;
  screenSize?: string;

  // Power solutions specific fields
  capacity?: string;
  voltage?: string;
  powerRating?: string;

  // Accessory specific specs
  specs?: string;

  // Serial numbers tracking
  serialNumbers: SerialNumberItem[];
}

export type TransactionAction = 'Added' | 'Restocked' | 'Stock Out' | 'Edit' | 'Archive';

export type StockOutReason = 'Sold' | 'Damaged' | 'Returned' | 'Transferred' | 'Other' | 'Initial Stock' | 'Restock' | 'Adjustment';

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  date: string;
  time: string;
  quantityChange: number; // positive for additions, negative for stock outs
  resultingQuantity: number;
  action: TransactionAction;
  reason: StockOutReason;
  user: string;
  notes: string;
  serialNumbersAffected?: string[];
  unitPrice?: number;
}

export type UserRole = 'admin' | 'staff' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarBg: string;
}

export interface StoreSettings {
  storeName: string;
  storeSubname: string;
  currency: string;
  defaultMinStock: number;
  requireSerialConfirmation: boolean;
  enableSoundAlerts: boolean;
}

export type NotificationType = 'low_stock' | 'out_of_stock' | 'stock_in' | 'stock_out' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  productId?: string;
  read: boolean;
}

export type ActiveView = 
  | 'dashboard'
  | 'inventory'
  | 'add_item'
  | 'stock_out'
  | 'out_of_stock'
  | 'low_stock'
  | 'reports'
  | 'stock_history'
  | 'settings'
  | 'docs';
