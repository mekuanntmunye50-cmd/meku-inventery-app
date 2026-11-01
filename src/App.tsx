/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { SidebarMenu } from './components/SidebarMenu';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { AddItemModal } from './components/AddItemModal';
import { OutOfStockView } from './components/OutOfStockView';
import { LowStockView } from './components/LowStockView';
import { ReportsView } from './components/ReportsView';
import { StockHistoryView } from './components/StockHistoryView';
import { SettingsView } from './components/SettingsView';
import { DocumentationView } from './components/DocumentationView';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { NotificationModal } from './components/NotificationModal';
import { StockOutModal } from './components/StockOutModal';
import {
  LayoutDashboard,
  Package,
  Scan,
  AlertTriangle,
  Menu,
} from 'lucide-react';

import { NativeTabBar } from './components/NativeTabBar';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
  } = useInventory();

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Global Top Red Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 pb-24 sm:pb-12">
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'inventory' && <InventoryView />}
        {activeView === 'add_item' && <AddItemModal />}
        {activeView === 'stock_out' && (
          <StockOutModal
            onClose={() => setActiveView('inventory')}
          />
        )}
        {activeView === 'out_of_stock' && <OutOfStockView />}
        {activeView === 'low_stock' && <LowStockView />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'stock_history' && <StockHistoryView />}
        {activeView === 'settings' && <SettingsView />}
        {activeView === 'docs' && <DocumentationView />}
      </main>

      {/* React Native Mobile Bottom Navigation Bar */}
      <div className="sm:hidden">
        <NativeTabBar />
      </div>

      {/* Global Modals & Drawers */}
      <SidebarMenu />
      <ProductDetailsModal />
      <GlobalSearchModal />
      <BarcodeScannerModal />
      <NotificationModal />
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}
