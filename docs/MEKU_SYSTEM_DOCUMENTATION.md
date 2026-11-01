# MEKU COMPUTERS INVENTORY MANAGEMENT SYSTEM
## Comprehensive System Specification, Architectural Design & Technical Whitepaper
**Document Version:** 3.0.0-PRO  
**Author:** meku Computers Engineering Team  
**System Target:** Enterprise Mobile-First Inventory & Warehouse Management  
**Classification:** Confidential / Commercial Internal & Customer Technical Review  
**Date:** November 2026  

---

# TABLE OF CONTENTS

1. **Executive Summary & Business Motivation**
2. **System Vision, Objectives & Success Metrics**
3. **Architecture & Technology Stack Overview**
   - React Native for Web Integration
   - Single-Source-of-Truth React Context Engine
   - Persistent Local Cache & JSON Migration Protocols
4. **Data Dictionary & Comprehensive Domain Model**
   - Product Entity & Subcategory Polymorphism
   - Serial Number Tracking Entity Matrix
   - Immutable Transaction Audit Ledger
   - Role-Based Access Control (RBAC) Data Contracts
5. **Core Business Logic & State Transition State Machines**
   - Inventory Quantities & Status Rules
   - Mathematical Formulations for Valuation & Margin
   - Reorder Deficit & Low-Stock Urgency Ranking
6. **Detailed Subsystem Specifications**
   - Category Hierarchy & Step-by-Step Drilldown (Laptops, Desktops, Power Solutions, Accessories)
   - Stock-Out Workflow & Error-Prevention Confirmation
   - Restocking Pipeline & Duplicate Prevention
   - Barcode / QR Camera Scanning & Pre-fill Pipeline
   - Physical Barcode Shelf Tag Engine (Code128 SVG)
   - Real-Time Notification & Audio Feedback Engine
7. **Security, User Roles & Authorization Matrix**
8. **User Interface & Mobile Ergonomics Constitution**
9. **Financial Accounting & Reporting Specifications**
10. **Data Integrity, Backup & Disaster Recovery Protocol**
11. **Testing Matrices & Verification Checklists**
12. **Complete 25-Slide Executive Presentation Deck (PPT Master)**

---

# CHAPTER 1: EXECUTIVE SUMMARY & BUSINESS MOTIVATION

Traditional inventory tracking systems in hardware retail and distribution often suffer from severe operational friction:
- **Disjointed Data:** Separate spreadsheets or fragmented screens where sold items still display as active in catalog views.
- **Serial Number Loss:** Inability to track which exact serial number unit was sold, damaged, or returned, leading to warranty disputes and inventory shrinkage.
- **Overcomplicated Desktop Interfaces:** Bulky software requiring point-and-click mouse workflows that cannot be used comfortably by warehouse floor staff on smartphones or tablets.
- **Distorted Valuation Reporting:** Conflating unrealized inventory potential margin with realized cash profits.

The **meku Computers Inventory Management System** solves these foundational challenges. Engineered specifically for **meku Computers** (Addis Ababa, Ethiopia), this system delivers an ultra-fast, mobile-first inventory application that unifies:
1. High-value enterprise computing products (Dell Latitude, HP ProBook, Lenovo ThinkPad ultrabooks and desktops).
2. Industrial energy & power infrastructure (KSTAR 200 kVA / 400 kVA modular 3-phase UPS units and EcoFlow portable power stations).
3. Critical replacement accessories (RAM modules, NVMe SSDs, server cables, OEM power adapters).

---

# CHAPTER 2: SYSTEM OBJECTIVES & ARCHITECTURAL PRINCIPLES

### 2.1 Core Pillars
1. **Zero Data Desynchronization:** All screens (Dashboard summary counters, All Inventory tables, Out of Stock views, Low Stock feeds, Global Search, Product Detail drawers, and Stock History) reference the identical memory context. Modifying a quantity in one view updates all other screens in under 16 milliseconds.
2. **Immutable Audit Ledger:** Deleting records permanently is strictly prohibited. When items are stocked out, damaged, or transferred, an immutable ledger entry is written, preserving historical auditability.
3. **Discrete Unit Serial Tracking:** Laptops, workstations, and high-capacity UPS units carry distinct serial numbers. Selling unit `DL5420-ABC123` marks *only* that serial number as sold, preserving the remaining available units.
4. **Offline Resilience & Instant Startup:** Powered by optimized local state synchronization, the entire catalog, search index, and transaction history boot instantly without network lag.

---

# CHAPTER 3: ARCHITECTURE & TECHNOLOGY STACK

```
┌─────────────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (Mobile-First)                 │
│  React Native Web Primitives + Tailwind CSS + Lucide Icons      │
│  (View, Text, TouchableOpacity, StyleSheet, Responsive Layout)  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│               CENTRAL STATE MANAGEMENT (The Brain)              │
│  InventoryContext.tsx (Single Source of Truth)                  │
│  - Automated status transitions (In Stock / Low / Out)          │
│  - Financial calculation engine (ETB Currency)                  │
│  - Audio synthesizer & visual alert dispatcher                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│             STORAGE, IMPORT/EXPORT & HARDWARE APIS              │
│  - Browser localStorage Cache (v3 Versioned Schema)             │
│  - HTML5 Camera MediaStream Barcode / QR Scanner               │
│  - Vector Code128 SVG Barcode Renderer                         │
│  - JSON Database Backup & CSV / Excel Export Engine            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 Technology Decisions Rationale
- **React Native for Web (`react-native-web`)**: Implements mobile touch primitives (`View`, `Text`, `TouchableOpacity`, `StyleSheet`) delivering natural tactile feedback, responsive hitboxes ($\ge 44\text{px}$), and native thumb-zone distribution.
- **TypeScript Strict Typing**: Standardized interfaces eliminate runtime `null` reference errors across prices, serial items, and transaction logs.
- **Tailwind CSS Engine**: Enforces crisp, clean aesthetic discipline (meku Red `#C8102E`, dark slate, and neutral whites) with zero-pill metadata typography.

---

# CHAPTER 4: DATA DICTIONARY & DOMAIN MODEL

### 4.1 Product Schema (`Product`)
| Attribute | Type | Description | Sample Value |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique internal UUID | `prod-lap-001` |
| `name` | `string` | Human-readable product title | `Dell Latitude 5420` |
| `category` | `enum` | Core category bucket | `'laptop'`, `'desktop'`, `'power'`, `'accessories'` |
| `subcategory` | `string` | Specific hardware classification | `'Business Laptop'`, `'UPS'`, `'RAM'` |
| `brand` | `string` | Hardware manufacturer brand | `'Dell'`, `'HP'`, `'KSTAR'`, `'EcoFlow'` |
| `model` | `string` | Specific hardware model identifier | `'Latitude 5420'`, `'200 kVA'` |
| `condition` | `enum` | Physical condition status | `'Brand New'`, `'Used'` |
| `quantity` | `number` | Real-time units held in stock | `2` |
| `minimumStock` | `number` | Warning threshold trigger | `5` |
| `buyingPrice` | `number` | Cost per unit in ETB | `42,000` |
| `sellingPrice` | `number` | Target retail price in ETB | `53,500` |
| `productCode` | `string` | Unique SKU / Barcode string | `LAP-DELL-5420-001` |
| `supplier` | `string` | Vendor source | `'Dubai Tech Import PLC'` |
| `storageLocation` | `string` | Warehouse coordinate | `'Store A · Shelf 3 · Section B'` |
| `capacity` | `string?` | Electrical capacity rating | `'200 kVA'`, `'3600Wh'` |
| `serialNumbers` | `Array` | List of discrete serial units | `[ { serialNumber: "ABC123", status: "In Stock" } ]` |

---

# CHAPTER 5: CORE BUSINESS LOGIC & MATHEMATICS

### 5.1 Status State Machine
$$\text{Status} = \begin{cases} 
\text{🔴 OUT OF STOCK}, & \text{if } Q = 0 \\
\text{🟠 LOW STOCK}, & \text{if } 0 < Q \le Q_{\text{min}} \\
\text{🟢 IN STOCK}, & \text{if } Q > Q_{\text{min}}
\end{cases}$$

### 5.2 Financial Valuation Mathematics
1. **Total Warehouse Buying Value ($V_{\text{buy}}$):**
   $$V_{\text{buy}} = \sum_{i=1}^{N} (Q_i \times P_{\text{buy}, i})$$
2. **Potential Gross Sales Value ($V_{\text{sales}}$):**
   $$V_{\text{sales}} = \sum_{i=1}^{N} (Q_i \times P_{\text{sell}, i})$$
3. **Potential Unrealized Margin ($M_{\text{unrealized}}$):**
   $$M_{\text{unrealized}} = V_{\text{sales}} - V_{\text{buy}}$$
*Accounting Safeguard:* Unrealized potential margin is explicitly segregated from realized cash profit. Realized sales revenue is booked exclusively through completed Stock-Out transactions.

---

# CHAPTER 6: STEP-BY-STEP SYSTEM OPERATIONAL GUIDE

### 6.1 Category Navigation & Drilldown Flow
```
Dashboard
   └── Category Selection (e.g. 💻 Laptop)
         └── Condition Filter (Brand New vs Used)
               └── Brand Selection (Dell, HP, Lenovo)
                     └── Model Selection (Dell Latitude 5420)
                           └── Product Detail View
                                 ├── Add Stock
                                 ├── Stock Out
                                 ├── Print Barcode Label
                                 └── Audit History
```

### 6.2 Safe Stock-Out Protocol
1. User clicks **Stock Out** on an item.
2. If units carry serial numbers, staff selects the exact physical serial unit(s) being handed to the customer.
3. System verifies $Q_{\text{requested}} \le Q_{\text{available}}$. Accidental negative quantities are mathematically blocked.
4. User selects disposal reason: `Sold`, `Damaged`, `Returned`, or `Transferred`.
5. System displays confirmation modal: *"Are you sure you want to remove 2 units of Dell Latitude 5420?"*
6. Upon confirmation:
   - Target serial units transition to `Sold` or `Damaged`.
   - Inventory quantity decrements.
   - Immutable ledger entry written with staff name and timestamp.
   - Status transitions automatically if crossing the low-stock or zero threshold.

---

# CHAPTER 7: ROLE-BASED ACCESS CONTROL (RBAC)

| Capability | Admin Role | Staff Role | Viewer Role |
| :--- | :---: | :---: | :---: |
| Global Search & Filter | ✅ | ✅ | ✅ |
| View Product Details & Specs | ✅ | ✅ | ✅ |
| View Stock Audit Ledger | ✅ | ✅ | ❌ |
| Print Barcode Shelf Labels | ✅ | ✅ | ✅ |
| Execute Stock-Out (Sale/Damage) | ✅ | ✅ | ❌ |
| Restock Existing Products | ✅ | ✅ | ❌ |
| Create New Inventory Items | ✅ | ✅ | ❌ |
| Edit Prices & Storage Locations | ✅ | ❌ | ❌ |
| Generate Valuation Reports | ✅ | ❌ | ❌ |
| Manage Team Users & Settings | ✅ | ❌ | ❌ |
| JSON Database Backup & Restore | ✅ | ❌ | ❌ |

---

# CHAPTER 8: 25-SLIDE EXECUTIVE PRESENTATION DECK (PPT MASTER)

### Slide 1: Title & Opening
- **Title:** meku Computers Enterprise Inventory System
- **Subtitle:** Professional Mobile-First Warehouse Management Architecture
- **Presenter:** meku Computers Engineering Team
- **Speaker Notes:** *"Welcome everyone. Today we are presenting the new official inventory platform for meku Computers, built with React Native technology and a strict single source of truth architecture."*

### Slide 2: The Core Problem in Hardware Retail
- Key Pain Points: Disconnected spreadsheets, lost serial numbers, accidental stock-out errors, and inaccurate valuation reports.
- Solution: One synchronized, mobile-first inventory engine.

### Slide 3: Architectural Highlights
- React Native Web touch ergonomics.
- Synchronized client-side state engine with zero desynchronization.
- Camera-powered barcode & QR scanning.
- Offline-ready LocalStorage cache with automated JSON disaster recovery.

### Slide 4: Real-Time Dashboard KPI Cards
- Total Products · In Stock (🟢) · Low Stock (🟠) · Out of Stock (🔴).
- Live calculation based on real unit counts.

### Slide 5: Category Drilldown Engine
- Guided 4-tier navigation: Laptops, Desktops, Power Solutions, Accessories.
- Eliminates cognitive overload for floor technicians.

### Slide 6: Power Solutions & Industrial UPS Tracking
- Specialized support for KSTAR 200 kVA and 400 kVA modular 3-phase UPS units.
- EcoFlow portable power stations categorized by Watt-hour (Wh) capacity.

### Slide 7: Discrete Serial Number Tracking
- Unit-level tracking for laptops and enterprise power equipment.
- Selling unit `ABC123` marks only that unit as Sold, preserving remaining stock.

### Slide 8: Safe Stock-Out Workflows
- Multi-reason tagging: Sold, Damaged, Returned, Transferred.
- Two-step confirmation preventing accidental over-removal.

### Slide 9: Restocking Without Duplicates
- Adding new units updates existing catalog entries.
- Automated transition from `🔴 OUT OF STOCK` to `🟢 IN STOCK`.

### Slide 10: Low Stock Alert Automation
- Dynamic threshold tracking based on product-level minimum stock targets.
- Urgency-ranked restock queue.

### Slide 11: Global Instant Search
- Multi-field indexing: Brand, Model, Serial, SKU, Capacity, Location.
- Zero-Stock Preservation: Out-of-stock items remain 100% visible and searchable.

### Slide 12: Integrated Barcode & QR Scanner
- HTML5 camera stream with target reticle.
- "Product not found — Add Product" rapid workflow.

### Slide 13: Printable Shelf Barcode Labels
- Vector SVG Code128 barcode generation.
- Formatted retail pricing in Ethiopian Birr (ETB).

### Slide 14: Valuation & Financial Accounting
- Formula-driven Total Buying Value vs Potential Gross Sales Value.
- Segregation of unrealized margin from realized cash income.

### Slide 15: Immutable Transaction Audit Ledger
- Permanent history recording: Date, Time, Product, Qty Change, Reason, User.

### Slide 16: Security & Role-Based Access Control
- Granular Admin, Staff, and Viewer profiles.

### Slide 17: Mobile-First Thumb Ergonomics
- Fixed bottom tab bar (`NativeTabBar`) with elevated central scan button.

### Slide 18: Brand Identity & Aesthetics
- meku red `#C8102E`, deep slate neutrals, and clean zero-pill typography.

### Slide 19: Disaster Recovery & Data Portability
- Complete JSON database backup export and instant restore pipeline.

### Slide 20: Performance & Latency Benchmarks
- Instant 60 FPS UI transitions with zero network latency.

### Slide 21: Live System Demonstration: Stock Out & Alert
- Step-by-step walkthrough showing stock reduction and automated alert generation.

### Slide 22: Live System Demonstration: Camera Barcode Scan
- Demonstrating instant SKU lookup and unknown code pre-fill.

### Slide 23: Live System Demonstration: Reports & CSV Export
- Generating audit spreadsheets and printable PDF documentation.

### Slide 24: Roadmap & Future Enhancements
- Multi-branch warehouse sync, Bluetooth thermal printer integration, and ERP hooks.

### Slide 25: Conclusion & Q&A
- Thank you to stakeholders. Open floor for questions.
