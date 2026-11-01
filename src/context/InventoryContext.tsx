/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  StockTransaction,
  UserProfile,
  StoreSettings,
  AppNotification,
  ActiveView,
  StockStatus,
  StockOutReason,
  SerialNumberItem,
  SerialStatus,
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
} from '../data/sampleData';
import {
  getStockStatus,
  getCurrentDateTimeFormatted,
  generateProductCode,
} from '../utils/formatters';

interface InventoryContextType {
  products: Product[];
  transactions: StockTransaction[];
  settings: StoreSettings;
  users: UserProfile[];
  currentUser: UserProfile;
  notifications: AppNotification[];
  unreadNotifCount: number;
  activeView: ActiveView;
  selectedProductId: string | null;
  globalSearchQuery: string;
  isSearchModalOpen: boolean;
  isScannerModalOpen: boolean;
  isNotifModalOpen: boolean;
  isSidebarOpen: boolean;
  drillCategory: string | null;
  scannedCodeForAdd: string | null;

  // Navigation & Modal triggers
  setActiveView: (view: ActiveView) => void;
  openProductDetails: (productId: string) => void;
  closeProductDetails: () => void;
  setGlobalSearchQuery: (query: string) => void;
  setIsSearchModalOpen: (open: boolean) => void;
  setIsScannerModalOpen: (open: boolean) => void;
  setIsNotifModalOpen: (open: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setDrillCategory: (category: string | null) => void;
  setScannedCodeForAdd: (code: string | null) => void;
  setCurrentUser: (user: UserProfile) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Core inventory operations
  addProduct: (productData: Omit<Product, 'id' | 'dateAdded' | 'lastStockDate'>) => { success: boolean; error?: string; product?: Product };
  updateProduct: (id: string, updates: Partial<Product>) => { success: boolean; error?: string };
  restockProduct: (
    productId: string,
    quantityToAdd: number,
    newSerialNumbers?: string[],
    notes?: string,
    unitCost?: number
  ) => { success: boolean; error?: string };
  stockOutProduct: (
    productId: string,
    quantityToRemove: number,
    serialNumbersSelected: string[],
    reason: StockOutReason,
    notes?: string
  ) => { success: boolean; error?: string };
  archiveProduct: (productId: string) => { success: boolean; error?: string };

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // Backup & Reset
  resetToSampleData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => { success: boolean; error?: string };

  // Computed summary metrics
  summary: {
    totalProducts: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalUnits: number;
    totalBuyingValue: number;
    potentialSalesValue: number;
    potentialMargin: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'meku_inventory_products_v3',
  TRANSACTIONS: 'meku_inventory_transactions_v3',
  SETTINGS: 'meku_inventory_settings_v3',
  USERS: 'meku_inventory_users_v3',
  NOTIFICATIONS: 'meku_inventory_notifications_v3',
  CURRENT_USER_ID: 'meku_inventory_current_user_id_v3',
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Transactions state
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Settings state
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Users state
  const [users] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current active user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const found = users.find((u) => u.id === savedId);
      return found || users[0];
    } catch {
      return users[0];
    }
  });

  // Notifications state
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // UI state
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [drillCategory, setDrillCategory] = useState<string | null>(null);
  const [scannedCodeForAdd, setScannedCodeForAdd] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    } catch (e) {
      console.error('Failed to save currentUser to localStorage', e);
    }
  }, [currentUser]);

  // Audio / Alert Helper
  const triggerAlertSound = (type: 'success' | 'warning' | 'alert') => {
    if (!settings.enableSoundAlerts) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(370, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // alert
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(240, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext not allowed or not supported in environment
    }
  };

  // Helper to push a notification
  const addAppNotification = (
    type: AppNotification['type'],
    title: string,
    message: string,
    productId?: string
  ) => {
    const { date, time } = getCurrentDateTimeFormatted();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      timestamp: `${date} ${time}`,
      productId,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Summary calculations
  const summary = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalUnits = 0;
    let totalBuyingValue = 0;
    let potentialSalesValue = 0;

    products.forEach((p) => {
      if (p.archived) return;
      const status = getStockStatus(p.quantity, p.minimumStock);
      if (status === 'IN STOCK') inStock++;
      else if (status === 'LOW STOCK') lowStock++;
      else outOfStock++;

      totalUnits += p.quantity;
      totalBuyingValue += p.quantity * p.buyingPrice;
      potentialSalesValue += p.quantity * p.sellingPrice;
    });

    return {
      totalProducts: products.filter((p) => !p.archived).length,
      inStockCount: inStock,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
      totalUnits,
      totalBuyingValue,
      potentialSalesValue,
      potentialMargin: potentialSalesValue - totalBuyingValue,
    };
  }, [products]);

  // Unread notifications count
  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Navigation triggers
  const openProductDetails = (productId: string) => {
    setSelectedProductId(productId);
  };

  const closeProductDetails = () => {
    setSelectedProductId(null);
  };

  // ADD ITEM
  const addProduct = (
    productData: Omit<Product, 'id' | 'dateAdded' | 'lastStockDate'>
  ): { success: boolean; error?: string; product?: Product } => {
    if (currentUser.role === 'viewer') {
      return { success: false, error: 'Viewer role cannot add products.' };
    }

    if (!productData.name.trim()) {
      return { success: false, error: 'Product name is required.' };
    }

    if (productData.buyingPrice < 0 || productData.sellingPrice < 0) {
      return { success: false, error: 'Prices cannot be negative.' };
    }

    if (productData.quantity < 0) {
      return { success: false, error: 'Initial quantity cannot be negative.' };
    }

    // Auto-generate code if empty
    const existingCodes = products.map((p) => p.productCode.toUpperCase());
    let finalCode = productData.productCode?.trim() || '';
    if (!finalCode) {
      finalCode = generateProductCode(
        productData.category,
        productData.brand,
        productData.model,
        existingCodes
      );
    } else {
      if (existingCodes.includes(finalCode.toUpperCase())) {
        return {
          success: false,
          error: `Product code "${finalCode}" already exists. Please choose a unique code.`,
        };
      }
    }

    const { date, time } = getCurrentDateTimeFormatted();
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // Prepare serial numbers
    const processedSerials: SerialNumberItem[] = (productData.serialNumbers || []).map(
      (sn, idx) => ({
        id: sn.id || `sn-${Date.now()}-${idx}`,
        serialNumber: sn.serialNumber.trim(),
        status: sn.status || 'In Stock',
        dateAdded: date,
        notes: sn.notes || '',
      })
    );

    const newProduct: Product = {
      ...productData,
      id: newId,
      productCode: finalCode,
      dateAdded: date,
      lastStockDate: date,
      serialNumbers: processedSerials,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Create initial stock transaction
    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      productId: newId,
      productName: newProduct.name,
      productCode: finalCode,
      date,
      time,
      quantityChange: newProduct.quantity,
      resultingQuantity: newProduct.quantity,
      action: 'Added',
      reason: 'Initial Stock',
      user: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      notes: newProduct.notes || 'Initial product creation into inventory.',
      serialNumbersAffected: processedSerials.map((s) => s.serialNumber),
      unitPrice: newProduct.buyingPrice,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Notification
    addAppNotification(
      'stock_in',
      'New Item Added',
      `📦 Added "${newProduct.name}" (${newProduct.quantity} units) to inventory.`,
      newId
    );

    triggerAlertSound('success');
    return { success: true, product: newProduct };
  };

  // UPDATE PRODUCT (Metadata / Specs / Pricing)
  const updateProduct = (
    id: string,
    updates: Partial<Product>
  ): { success: boolean; error?: string } => {
    if (currentUser.role === 'viewer') {
      return { success: false, error: 'Viewer role cannot edit products.' };
    }

    const existing = products.find((p) => p.id === id);
    if (!existing) {
      return { success: false, error: 'Product not found.' };
    }

    // If changing product code, ensure unique
    if (updates.productCode && updates.productCode !== existing.productCode) {
      const otherCodes = products
        .filter((p) => p.id !== id)
        .map((p) => p.productCode.toUpperCase());
      if (otherCodes.includes(updates.productCode.toUpperCase())) {
        return {
          success: false,
          error: `Product code "${updates.productCode}" is already in use by another product.`,
        };
      }
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updates };
      })
    );

    const { date, time } = getCurrentDateTimeFormatted();
    const updateTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      productId: existing.id,
      productName: updates.name || existing.name,
      productCode: updates.productCode || existing.productCode,
      date,
      time,
      quantityChange: 0,
      resultingQuantity: existing.quantity,
      action: 'Edit',
      reason: 'Adjustment',
      user: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      notes: `Updated product details: ${Object.keys(updates).join(', ')}`,
    };

    setTransactions((prev) => [updateTx, ...prev]);
    triggerAlertSound('success');
    return { success: true };
  };

  // RESTOCKING / ADD STOCK
  const restockProduct = (
    productId: string,
    quantityToAdd: number,
    newSerialNumbers: string[] = [],
    notes: string = '',
    unitCost?: number
  ): { success: boolean; error?: string } => {
    if (currentUser.role === 'viewer') {
      return { success: false, error: 'Viewer role cannot restock inventory.' };
    }

    if (quantityToAdd <= 0) {
      return { success: false, error: 'Quantity to add must be greater than zero.' };
    }

    const existing = products.find((p) => p.id === productId);
    if (!existing) {
      return { success: false, error: 'Product not found.' };
    }

    const { date, time } = getCurrentDateTimeFormatted();
    const newQuantity = existing.quantity + quantityToAdd;

    // Build new serial numbers
    const addedSerialItems: SerialNumberItem[] = newSerialNumbers.map((sn, idx) => ({
      id: `sn-${Date.now()}-${idx}`,
      serialNumber: sn.trim(),
      status: 'In Stock',
      dateAdded: date,
    }));

    const updatedSerials = [...existing.serialNumbers, ...addedSerialItems];

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          quantity: newQuantity,
          lastStockDate: date,
          buyingPrice: unitCost !== undefined && unitCost > 0 ? unitCost : p.buyingPrice,
          serialNumbers: updatedSerials,
        };
      })
    );

    // Create ledger transaction
    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      productId: existing.id,
      productName: existing.name,
      productCode: existing.productCode,
      date,
      time,
      quantityChange: quantityToAdd,
      resultingQuantity: newQuantity,
      action: 'Restocked',
      reason: 'Restock',
      user: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      notes: notes || `Restocked +${quantityToAdd} units.`,
      serialNumbersAffected: addedSerialItems.map((s) => s.serialNumber),
      unitPrice: unitCost || existing.buyingPrice,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Check status transition notifications
    if (existing.quantity === 0) {
      addAppNotification(
        'stock_in',
        'Back in Stock',
        `🟢 "${existing.name}" is now BACK IN STOCK (+${quantityToAdd} units).`,
        existing.id
      );
    } else {
      addAppNotification(
        'stock_in',
        'Stock Added',
        `📦 Restocked +${quantityToAdd} units for "${existing.name}". New total: ${newQuantity}.`,
        existing.id
      );
    }

    triggerAlertSound('success');
    return { success: true };
  };

  // STOCK OUT
  const stockOutProduct = (
    productId: string,
    quantityToRemove: number,
    serialNumbersSelected: string[] = [],
    reason: StockOutReason,
    notes: string = ''
  ): { success: boolean; error?: string } => {
    if (currentUser.role === 'viewer') {
      return { success: false, error: 'Viewer role cannot execute stock-outs.' };
    }

    if (quantityToRemove <= 0) {
      return { success: false, error: 'Quantity to remove must be at least 1.' };
    }

    const existing = products.find((p) => p.id === productId);
    if (!existing) {
      return { success: false, error: 'Product not found.' };
    }

    if (existing.quantity < quantityToRemove) {
      return {
        success: false,
        error: `Cannot remove ${quantityToRemove} units. Only ${existing.quantity} units are in stock.`,
      };
    }

    const { date, time } = getCurrentDateTimeFormatted();
    const newQuantity = existing.quantity - quantityToRemove;

    // Update selected serial numbers to the stock out reason
    const serialTargetStatus: SerialStatus =
      reason === 'Sold' ? 'Sold' : reason === 'Damaged' ? 'Damaged' : 'Transferred';

    const updatedSerials = existing.serialNumbers.map((sn) => {
      if (serialNumbersSelected.includes(sn.serialNumber) && sn.status === 'In Stock') {
        return {
          ...sn,
          status: serialTargetStatus,
          soldDate: date,
          notes: notes || `Stocked out: ${reason}`,
        };
      }
      return sn;
    });

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          quantity: newQuantity,
          lastStockOutDate: date,
          serialNumbers: updatedSerials,
        };
      })
    );

    // Add immutable ledger entry
    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      productId: existing.id,
      productName: existing.name,
      productCode: existing.productCode,
      date,
      time,
      quantityChange: -quantityToRemove,
      resultingQuantity: newQuantity,
      action: 'Stock Out',
      reason,
      user: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      notes: notes || `Stocked out ${quantityToRemove} units (${reason}).`,
      serialNumbersAffected: serialNumbersSelected,
      unitPrice: reason === 'Sold' ? existing.sellingPrice : existing.buyingPrice,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Check alerts for Out of Stock or Low Stock
    if (newQuantity === 0) {
      addAppNotification(
        'out_of_stock',
        'Out of Stock Alert',
        `🔴 "${existing.name}" is now OUT OF STOCK! Quantity: 0.`,
        existing.id
      );
      triggerAlertSound('alert');
    } else if (newQuantity <= existing.minimumStock) {
      addAppNotification(
        'low_stock',
        'Low Stock Warning',
        `⚠️ "${existing.name}" is LOW STOCK. Only ${newQuantity} remaining (Min: ${existing.minimumStock}).`,
        existing.id
      );
      triggerAlertSound('warning');
    } else {
      triggerAlertSound('success');
    }

    return { success: true };
  };

  // ARCHIVE PRODUCT
  const archiveProduct = (productId: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Only administrators can archive products.' };
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, archived: true } : p))
    );

    const target = products.find((p) => p.id === productId);
    if (target) {
      const { date, time } = getCurrentDateTimeFormatted();
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          productId: target.id,
          productName: target.name,
          productCode: target.productCode,
          date,
          time,
          quantityChange: 0,
          resultingQuantity: target.quantity,
          action: 'Archive',
          reason: 'Adjustment',
          user: `${currentUser.name} (Admin)`,
          notes: 'Product archived from active catalog.',
        },
        ...prev,
      ]);
    }

    return { success: true };
  };

  // NOTIFICATIONS HELPERS
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // SETTINGS
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // RESET / BACKUP
  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    triggerAlertSound('success');
  };

  const exportDatabaseJSON = (): string => {
    const backupObj = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      storeName: settings.storeName,
      products,
      transactions,
      settings,
      users,
    };
    return JSON.stringify(backupObj, null, 2);
  };

  const importDatabaseJSON = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        return { success: false, error: 'Invalid backup file: Missing products array.' };
      }
      setProducts(parsed.products);
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      triggerAlertSound('success');
      return { success: true };
    } catch (e) {
      return { success: false, error: `JSON Parse error: ${(e as Error).message}` };
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        transactions,
        settings,
        users,
        currentUser,
        notifications,
        unreadNotifCount,
        activeView,
        selectedProductId,
        globalSearchQuery,
        isSearchModalOpen,
        isScannerModalOpen,
        isNotifModalOpen,
        isSidebarOpen,
        drillCategory,
        scannedCodeForAdd,

        setActiveView,
        openProductDetails,
        closeProductDetails,
        setGlobalSearchQuery,
        setIsSearchModalOpen,
        setIsScannerModalOpen,
        setIsNotifModalOpen,
        setIsSidebarOpen,
        setDrillCategory,
        setScannedCodeForAdd,
        setCurrentUser,
        updateSettings,

        addProduct,
        updateProduct,
        restockProduct,
        stockOutProduct,
        archiveProduct,

        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,

        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,

        summary,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
