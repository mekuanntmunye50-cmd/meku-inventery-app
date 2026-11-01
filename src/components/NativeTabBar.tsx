/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  LayoutDashboard,
  Package,
  Scan,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const NativeTabBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setDrillCategory,
    setIsScannerModalOpen,
    setIsSidebarOpen,
    summary,
  } = useInventory();

  const isAlertActive = activeView === 'out_of_stock' || activeView === 'low_stock';
  const hasAlerts = summary.outOfStockCount > 0 || summary.lowStockCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {/* Tab 1: Dashboard */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveView('dashboard');
            setDrillCategory(null);
          }}
          style={styles.tabButton}
        >
          <LayoutDashboard
            size={20}
            color={activeView === 'dashboard' ? '#C8102E' : '#64748B'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeView === 'dashboard' && styles.activeTabLabel,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Inventory */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveView('inventory');
            setDrillCategory(null);
          }}
          style={styles.tabButton}
        >
          <Package
            size={20}
            color={activeView === 'inventory' ? '#C8102E' : '#64748B'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeView === 'inventory' && styles.activeTabLabel,
            ]}
          >
            Inventory
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Center Elevated Scan Button */}
        <View style={styles.centerScanWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsScannerModalOpen(true)}
            style={styles.scanFloatingButton}
          >
            <Scan size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab 4: Alerts */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveView(summary.outOfStockCount > 0 ? 'out_of_stock' : 'low_stock');
            setDrillCategory(null);
          }}
          style={styles.tabButton}
        >
          <View style={styles.iconWithBadgeWrapper}>
            <AlertTriangle
              size={20}
              color={isAlertActive ? '#C8102E' : '#64748B'}
            />
            {hasAlerts && <View style={styles.alertDot} />}
          </View>
          <Text
            style={[
              styles.tabLabel,
              isAlertActive && styles.activeTabLabel,
            ]}
          >
            Alerts
          </Text>
        </TouchableOpacity>

        {/* Tab 5: Menu */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsSidebarOpen(true)}
          style={styles.tabButton}
        >
          <Menu size={20} color="#64748B" />
          <Text style={styles.tabLabel}>Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as unknown as 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
        }
      : {}),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    paddingHorizontal: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 3,
    letterSpacing: -0.2,
  },
  activeTabLabel: {
    color: '#C8102E',
    fontWeight: '700',
  },
  centerScanWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFloatingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C8102E',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 6px 14px rgba(200, 16, 46, 0.35)',
        }
      : {
          elevation: 6,
        }),
  },
  iconWithBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C8102E',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
