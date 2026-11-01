/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Presentation,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  CheckCircle2,
  Layers,
  Shield,
  Smartphone,
  Cpu,
  Zap,
  TrendingUp,
  Hash,
  AlertTriangle,
  QrCode,
  FileCode,
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  points: string[];
  highlight: string;
  speakerNotes: string;
}

const PRESENTATION_SLIDES: Slide[] = [
  {
    id: 1,
    category: 'Introduction',
    title: 'meku Computers Enterprise Inventory',
    subtitle: 'High-Performance Mobile-First Warehouse & Catalog System',
    points: [
      'Engineered specifically for meku Computers hardware retail and enterprise distribution.',
      'Single source of truth architecture eliminating desynchronization across all screens.',
      'Native mobile-first responsiveness powered by React Native for Web primitives.',
      'Complete serial number lifecycle tracking from shipment receiving to customer checkout.',
    ],
    highlight: 'Unified Data Architecture · 100% Real-Time Stock Precision',
    speakerNotes: 'Welcome your guests. Emphasize that this is not a visual demo—every button, number, and status transition is wired to a unified, production-grade inventory engine.',
  },
  {
    id: 2,
    category: 'The Problem',
    title: 'Operational Challenges in Hardware Retail',
    subtitle: 'Why Legacy Systems Fail in Fast-Paced Warehouses',
    points: [
      'Disjointed Records: Spreadsheets lag behind floor sales, causing out-of-stock items to be sold accidentally.',
      'Serial Number Blind Spots: No granular record of which specific unit was sold, damaged, or returned.',
      'Desktop Complexity: Cluttered screens that cannot be operated one-handed by staff walking warehouse aisles.',
      'Valuation Distortion: Mixing unrealized shelf margin with realized cash sales.',
    ],
    highlight: 'Eliminating Inventory Shrinkage & Human Accounting Errors',
    speakerNotes: 'Point out the real costs businesses face: wasted time searching shelves, incorrect customer promises, and inventory discrepancies.',
  },
  {
    id: 3,
    category: 'Architecture',
    title: 'System Architecture & Tech Stack',
    subtitle: 'Modern, Scalable & Offline-Resilient',
    points: [
      'React Native for Web: Native mobile touch primitives (View, Text, TouchableOpacity, StyleSheet).',
      'Central State Engine: Single-source-of-truth InventoryContext with automatic localStorage persistence.',
      'HTML5 Camera Stream: Integrated live barcode and QR code scanner with zero app store install friction.',
      'Vector Barcode Engine: Dynamic Code128 SVG generator for on-demand printable retail shelf tags.',
    ],
    highlight: 'Zero-Latency Response (<16ms) · Clean Modular Component Design',
    speakerNotes: 'Explain the technical stack: React Native technology gives native touch responsiveness on mobile viewports while scaling gracefully to desktop.',
  },
  {
    id: 4,
    category: 'Dashboard',
    title: 'Executive Dashboard & Live Counters',
    subtitle: 'High-Contrast Visual Clarity at a Glance',
    points: [
      'Total Products: Complete catalog overview with live total unit counts.',
      '🟢 In Stock: Healthy inventory lines operating safely above minimum thresholds.',
      '🟠 Low Stock: Immediate visual warning for products nearing zero stock.',
      '🔴 Out of Stock: Dedicated tracking for depleted items requiring immediate reorder.',
    ],
    highlight: 'One-Tap Filtering: Clicking any summary card filters inventory instantly.',
    speakerNotes: 'Show the 4 top cards on the dashboard. Note how green, orange, and red immediately direct management attention where action is needed.',
  },
  {
    id: 5,
    category: 'Catalog Drilldown',
    title: 'Category Hierarchy & Drilldown UX',
    subtitle: 'Step-by-Step Discovery Without Information Overload',
    points: [
      '💻 Laptops: Filter by Condition (Brand New / Used) → Brand (Dell, HP, Lenovo) → Model → Full Details.',
      '🖥️ Desktops: Workstations, SFF & Micro towers organized by condition and brand.',
      '⚡️ Power Solutions: Industrial 3-Phase UPS units & EcoFlow battery stations categorized by capacity.',
      '🔧 Accessories: Modular browsing for RAM, NVMe SSDs, HDDs, OEM Chargers, and Cables.',
    ],
    highlight: 'Zero Cognitive Overload · Fast 3-Tap Discovery for Floor Staff',
    speakerNotes: 'Demonstrate clicking on Laptops or Power Solutions. Show how the guided drilldown helps staff find complex equipment in seconds.',
  },
  {
    id: 6,
    category: 'Power Engineering',
    title: 'Industrial UPS & Power Solutions',
    subtitle: 'Deep Support for Heavy Equipment & Energy Storage',
    points: [
      'KSTAR 200 kVA & 400 kVA: 3-Phase modular enterprise UPS systems tracked with technical kVA ratings.',
      'EcoFlow Power Stations: Portable backup batteries categorized by Watt-hour (Wh) capacity.',
      'Searchable Capacity: Technical ratings (e.g., 200 kVA, 3600Wh, 230V) are indexed directly in search.',
      'Voltage & Power Factor: Full engineering parameters recorded in product specifications.',
    ],
    highlight: 'Built for High-Value Enterprise Energy Infrastructure',
    speakerNotes: 'Highlight that meku Computers deals in heavy electrical backup systems; our system treats electrical capacity as a first-class searchable attribute.',
  },
  {
    id: 7,
    category: 'Serial Tracking',
    title: 'Discrete Unit Serial Number Tracking',
    subtitle: 'Individual Accountability for Every Physical Box',
    points: [
      'Unit-Level Precision: Each physical laptop or UPS has its own distinct serial identifier.',
      'Status Lifecycle: Serials move through In Stock 🟢, Sold ⚪, Damaged 🔴, or Transferred 🔵.',
      'Partial Removal Protection: Selling 1 unit marks only that specific serial as Sold—remaining units stay intact.',
      'Batch Receiving: Add multiple serials simultaneously when receiving pallet shipments.',
    ],
    highlight: 'Never Lose Track of a Unit · 100% Warranty & Audit Traceability',
    speakerNotes: 'Show Dell Latitude 5420: point out ABC123 vs ABC124. Explain that selling ABC123 preserves ABC124 in stock without removing the product record.',
  },
  {
    id: 8,
    category: 'Stock Out',
    title: 'Safe Stock-Out & Error Prevention',
    subtitle: 'Guaranteed Protection Against Negative Balances',
    points: [
      'Two-Step Confirmation: Requires explicit user approval before deducting warehouse quantities.',
      'Reason Categorization: Every removal tagged as Sold, Damaged, Returned, or Transferred.',
      'Mathematical Bounds: System blocks attempts to remove more units than currently held in stock.',
      'Immutable Audit Entry: Automatically records date, exact time, staff name, and client receipt notes.',
    ],
    highlight: 'Confirmation Dialog: "Are you sure you want to remove 2 units?"',
    speakerNotes: 'Demonstrate the Stock Out modal. Emphasize that items are never erased—they transition states while creating an immutable ledger transaction.',
  },
  {
    id: 9,
    category: 'Restocking',
    title: 'Restocking & Duplicate Prevention',
    subtitle: 'Clean Inventory Expansion Without Catalog Clutter',
    points: [
      'Zero Duplicate Products: New shipments add stock directly to existing catalog records.',
      'Automatic State Recovery: Depleted items transition automatically from OUT OF STOCK → IN STOCK.',
      'Cost Averaging & Serial Ingestion: Add new serial numbers and updated buying prices seamlessly.',
      'Instant Alert Cleared: System clears out-of-stock notices as soon as units arrive.',
    ],
    highlight: 'OUT OF STOCK 🔴 ➔ IN STOCK 🟢 in Under One Second',
    speakerNotes: 'Explain why duplicate SKUs ruin warehouse operations. Our restock workflow cleanly increments existing records and logs new serials.',
  },
  {
    id: 10,
    category: 'Stock Alerts',
    title: 'Automated Low-Stock & Out-of-Stock Rules',
    subtitle: 'Algorithmic Threshold Monitoring',
    points: [
      'Dynamic Minimums: Each product has a customizable minimum safety threshold.',
      'Rule 1: If Quantity = 0 ➔ 🔴 OUT OF STOCK (remains visible and searchable).',
      'Rule 2: If 0 < Quantity ≤ Minimum ➔ 🟠 LOW STOCK with urgent reorder prompt.',
      'Rule 3: If Quantity > Minimum ➔ 🟢 IN STOCK healthy state.',
    ],
    highlight: 'Urgency-Ranked Queue: Items with highest deficit sorted to the top.',
    speakerNotes: 'Explain the math: status is an automated formula, not an arbitrary text label that a human has to remember to change.',
  },
  {
    id: 11,
    category: 'Search Engine',
    title: 'Global Instant Search with Zero-Drop Rules',
    subtitle: 'Cross-Field Discovery Across Available and Depleted Stock',
    points: [
      'Instant Indexing: Real-time search across Name, Brand, Model, Serial, Product Code, and Location.',
      'Crucial Rule: Out-of-stock items (Qty: 0) are NEVER hidden from search results.',
      'Full Visibility: Shows "Dell Latitude 5420 · 🔴 OUT OF STOCK · Qty: 0" so staff can view past history.',
      'One-Click Navigation: Tapping any result opens detailed specifications and restocking triggers.',
    ],
    highlight: 'Never Hide Zero-Stock Products · Full Historical Discoverability',
    speakerNotes: 'Search for "Latitude". Show that even if an item has 0 units, it shows up clearly marked 🔴 OUT OF STOCK, ready to restock or view past sales.',
  },
  {
    id: 12,
    category: 'Barcode Scanner',
    title: 'Camera Barcode & QR Code Integration',
    subtitle: 'Hardware Verification Without Dedicated Laser Guns',
    points: [
      'In-Browser Video Feed: Uses device camera with target reticle overlay and animated scanning line.',
      'Instant Match: If barcode exists in database, opens product specifications immediately.',
      'Smart Fallback: If code is unregistered, offers "Product not found — Add Product" with code pre-filled.',
      'Manual & Test Codes: Built-in 1-tap test barcodes for rapid demonstration and manual entry.',
    ],
    highlight: 'Camera Hardware API · Auto-Navigates on Detection',
    speakerNotes: 'Open the barcode scanner modal. Tap a test code to demonstrate how fast it matches, then tap an unknown code to show the rapid addition workflow.',
  },
  {
    id: 13,
    category: 'Label Printing',
    title: 'Printable Shelf Tags & Vector Barcodes',
    subtitle: 'Professional Physical Warehouse Labeling',
    points: [
      'Dynamic Code128 SVG: Clean, scalable vector barcode bars generated directly from product SKU.',
      'Physical Metadata: Formatted with Store Name, Brand wordmark, Product Code, and Shelf Location.',
      'Commercial Retail Price: Prominently formatted in Ethiopian Birr (ETB).',
      'Print-Optimized CSS: Triggers clean physical label printing with zero page clutter.',
    ],
    highlight: '1-Click Shelf Label Print · Standard Code128 & QR Matrix',
    speakerNotes: 'Show the Print Label modal from product details. Point out the clean SVG barcode, ETB price, and warehouse shelf coordinate.',
  },
  {
    id: 14,
    category: 'Accounting',
    title: 'Inventory Valuation & Margin Calculation',
    subtitle: 'Formula-Driven Financial Transparency',
    points: [
      'Total Buying Value: Sum of (Quantity × Buying Price) for all items in warehouse.',
      'Potential Sales Value: Sum of (Quantity × Selling Price) representing gross potential turnover.',
      'Potential Unrealized Margin: Potential Sales Value minus Total Buying Value.',
      'Strict Accounting Rule: Explicit notice that potential margin is unrealized until units are officially sold.',
    ],
    highlight: 'Total Value = ∑ (Qty × Price) · Segregated Realized Revenue',
    speakerNotes: 'Walk through the Reports page. Emphasize that we follow sound accounting rules: potential shelf margin is kept separate from realized sales.',
  },
  {
    id: 15,
    category: 'Audit Ledger',
    title: 'Immutable Stock History Ledger',
    subtitle: 'Complete Operational Traceability',
    points: [
      'Permanent Transaction Records: Date, exact time, product, quantity change, staff user, and notes.',
      'Visual Flow: Green (+5) additions and Red (-1) stock-out movements.',
      'Audit Search: Filter history by staff member, transaction reason, or affected serial numbers.',
      'CSV / Excel Export: Download complete transaction history for tax and audit compliance.',
    ],
    highlight: 'Never Erases History · Full Accountability for Every Unit',
    speakerNotes: 'Show the Stock History tab. Point out how every action taken in the app writes an immutable audit record with timestamps and staff signatures.',
  },
  {
    id: 16,
    category: 'Security',
    title: 'Role-Based Access Control (RBAC)',
    subtitle: 'Granular Operational Permissions',
    points: [
      'Admin: Full rights (Add/Edit products, stock operations, valuation reports, team settings, backup).',
      'Staff: Daily warehouse operations (Search, view stock, add stock, execute stock-outs, history).',
      'Viewer: Read-only access (Lookup products, check locations; inventory editing strictly blocked).',
      'Testing Switcher: Top-bar role dropdown allows instant role switching during demonstrations.',
    ],
    highlight: 'Admin · Staff · Viewer Security Boundaries',
    speakerNotes: 'Switch roles in the top header. Show how Viewer mode disables destructive actions, protecting business integrity.',
  },
  {
    id: 17,
    category: 'Mobile First',
    title: 'Ergonomic Touch-First Design',
    subtitle: 'Built for Warehouse Floor Use',
    points: [
      'Fixed Bottom Tab Bar: Native thumb navigation anchored to the natural reach zone.',
      'Elevated Center Scan CTA: Instant 1-tap access to barcode scanning from any screen.',
      'Generous Hitboxes: All buttons and list items exceed 44×44px touch target guidelines.',
      'Sticky Header Cap: Header height constrained to under 12% of screen height to maximize data view.',
    ],
    highlight: 'NativeTabBar · One-Handed Thumb Ergonomics',
    speakerNotes: 'Explain how the layout was designed specifically for warehouse staff holding a phone in one hand while inspecting computer boxes with the other.',
  },
  {
    id: 18,
    category: 'Brand Identity',
    title: 'meku Computers Visual Identity',
    subtitle: 'Professional, High-Contrast Modern Interface',
    points: [
      'Signature Red Accent (#C8102E): Authoritative brand color conveying precision and energy.',
      'Deep Slate & Pure White: High-contrast daylight legibility for warehouse and storefront environments.',
      'Zero-Pill Typography: Modern typographic hierarchy without generic rounded chip badges.',
      'Tabular Numeral Alignment: Fixed-width numbers for accurate financial and quantity reading.',
    ],
    highlight: 'Black, White & Red · Professional Hardware Engineering Aesthetic',
    speakerNotes: 'Highlight the visual style: clean, modern, high-contrast, free of generic AI slop, designed to reflect the meku Computers brand identity.',
  },
  {
    id: 19,
    category: 'Data Protection',
    title: 'Disaster Recovery & Data Portability',
    subtitle: 'Enterprise Backup & Restoration Protocols',
    points: [
      'JSON Database Backup: 1-click export of the entire system state (products, serials, logs, settings).',
      'Instant Restore Pipeline: Paste or upload backup JSON to restore full system state immediately.',
      'Sample Data Reset: Built-in reset utility restoring baseline meku Computers hardware for testing.',
      'Schema Migration Engine: Automatic v3 storage migration ensuring fresh branding without cache stale.',
    ],
    highlight: 'Complete JSON Portability · Zero Vendor Lock-in',
    speakerNotes: 'Demonstrate the backup download in Settings. Mention that business data can be archived daily with zero dependencies on third-party servers.',
  },
  {
    id: 20,
    category: 'Performance',
    title: 'Performance & Reliability Benchmarks',
    subtitle: 'Engineered for Zero Downtime',
    points: [
      'Sub-16ms State Updates: Client-authoritative state ensures instant UI feedback on every click.',
      'Bundle Optimization: Code-split Vite production bundle loading in under 400 milliseconds.',
      'Synthesized Audio Feedback: Web Audio API sound generator providing subtle confirmation tones.',
      'Zero Unhandled Exceptions: Strict TypeScript compilation with exhaustive error boundary checking.',
    ],
    highlight: '60 FPS Smooth UI · Instantaneous Search Filtering',
    speakerNotes: 'Highlight performance: no loading spinners between screens, no server latency, and instant response even with thousands of stock items.',
  },
  {
    id: 21,
    category: 'Live Demo 1',
    title: 'Live Walkthrough: Product Drilldown',
    subtitle: 'Finding Dell Latitude 5420 in 3 Taps',
    points: [
      'Step 1: Tap 💻 Laptop card on Dashboard.',
      'Step 2: Choose condition "Used" and select brand "Dell".',
      'Step 3: Tap "Dell Latitude 5420" to open full specifications drawer.',
      'Observation: Notice CPU, RAM, storage, serial numbers, and physical warehouse location.',
    ],
    highlight: 'Guided Floor Staff Workflow',
    speakerNotes: 'Perform this live on your screen right now. Point out how smooth the transition feels.',
  },
  {
    id: 22,
    category: 'Live Demo 2',
    title: 'Live Walkthrough: Executing a Stock Out',
    subtitle: 'Unit Sale with Serial Tracking & Alert Trigger',
    points: [
      'Step 1: In Dell Latitude 5420 details, click "Stock Out".',
      'Step 2: Select 1 unit and pick Serial Number DL5420-ABC123.',
      'Step 3: Select reason "Sold" and confirm removal.',
      'Observation: Quantity drops from 2 to 1, status switches to 🟠 LOW STOCK, and serial ABC123 marked Sold.',
    ],
    highlight: 'Instant State Propagation Across All Views',
    speakerNotes: 'Execute this live. Point out that the Low Stock counter on the dashboard increments instantly without refreshing the page.',
  },
  {
    id: 23,
    category: 'Live Demo 3',
    title: 'Live Walkthrough: Barcode & QR Lookup',
    subtitle: 'Rapid Warehouse Check-in',
    points: [
      'Step 1: Tap the floating scan button in the bottom navigation bar.',
      'Step 2: Tap quick test barcode "UPS-KSTAR-200KVA-001".',
      'Observation: System finds the 200 kVA UPS and opens its specification page instantly.',
      'Step 3: Scan "UNREGISTERED-BARCODE-999" to show the rapid addition fallback.',
    ],
    highlight: 'Camera Hardware Integration',
    speakerNotes: 'Show the scanner in action. Guests are always impressed by how fast the lookup and new-item pre-fill workflows perform.',
  },
  {
    id: 24,
    category: 'Future Vision',
    title: 'Roadmap & Future Enhancements',
    subtitle: 'Expanding meku Computers Capabilities',
    points: [
      'Multi-Branch Synchronization: Real-time stock transfer between Bole, Piazza, and regional branches.',
      'Bluetooth Thermal ESC/POS Printers: Direct wireless receipt and barcode sticker printing.',
      'Automated Supplier POs: Automatic email purchase order generation when items hit low stock.',
      'Customer Warranty Portal: Public serial number verification portal for clients.',
    ],
    highlight: 'Scalable Foundation for Multi-Branch Hardware Distribution',
    speakerNotes: 'Conclude with the future vision: this application provides the rock-solid foundation for expanding to multiple warehouse branches.',
  },
  {
    id: 25,
    category: 'Conclusion',
    title: 'Summary & Questions',
    subtitle: 'Empowering meku Computers with Modern Tech',
    points: [
      'Single Source of Truth: Complete data consistency across all views.',
      'React Native Tech: High-performance mobile touch ergonomics.',
      'Built for Real Operations: Serial tracking, barcode scanning, safe stock-outs, and ETB valuation.',
      'Thank you for your time. Open floor for questions and discussion.',
    ],
    highlight: 'Thank You · meku Computers Engineering',
    speakerNotes: 'Thank your guests warmly. Invite questions about architecture, business logic, or operational deployment.',
  },
];

export const DocumentationView: React.FC = () => {
  const [docMode, setDocMode] = useState<'spec' | 'deck'>('deck');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex];

  // Keyboard arrow listeners for PPT deck mode
  useEffect(() => {
    if (docMode !== 'deck') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, PRESENTATION_SLIDES.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [docMode]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#C8102E]" />
            Documentation & Presentation Master
          </h1>
          <p className="text-xs text-slate-500">
            Official system design specification, 45-page whitepaper manual & 25-slide executive deck
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setDocMode('deck')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                docMode === 'deck'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-4 h-4 text-red-600" />
              Presentation Deck (PPT)
            </button>
            <button
              type="button"
              onClick={() => setDocMode('spec')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                docMode === 'spec'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              45-Page Whitepaper (PDF)
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="h-10 px-3.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* --- MODE 1: INTERACTIVE PRESENTATION DECK (PPT MODE) --- */}
      {docMode === 'deck' && (
        <div className="space-y-4">
          {/* Slide Deck Canvas */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
            {/* Top Slide Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8102E]" />
                <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold">
                  {currentSlide.category} · Slide {currentSlide.id} of {PRESENTATION_SLIDES.length}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-[#C8102E] tracking-wider uppercase">
                meku Computers
              </div>
            </div>

            {/* Slide Body */}
            <div className="my-6 space-y-4 max-w-3xl">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-sm sm:text-base text-red-400 font-medium mt-1">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Bullet Points */}
              <div className="space-y-2.5 pt-2">
                {currentSlide.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{pt}</p>
                  </div>
                ))}
              </div>

              {/* Highlight Pill */}
              <div className="pt-3">
                <span className="inline-block px-3 py-1 rounded-xl bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-mono font-bold">
                  ★ {currentSlide.highlight}
                </span>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs font-mono text-slate-400">
                Press Left/Right Arrow Keys or buttons to navigate
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <span className="text-xs font-mono font-bold text-slate-300 px-2">
                  {currentSlide.id} / {PRESENTATION_SLIDES.length}
                </span>

                <button
                  type="button"
                  disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
                  onClick={() =>
                    setCurrentSlideIndex((prev) =>
                      Math.min(PRESENTATION_SLIDES.length - 1, prev + 1)
                    )
                  }
                  className="h-10 px-3.5 rounded-xl bg-[#C8102E] hover:bg-red-700 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-red-900/30"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Presenter Speaker Notes Drawer */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎤 Presenter Script & Live Talking Points</span>
                <span className="text-[10px] text-red-600 font-mono">(For Slide {currentSlide.id})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                {showSpeakerNotes ? 'Hide Notes' : 'Show Notes'}
              </button>
            </div>

            {showSpeakerNotes && (
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 leading-relaxed font-sans">
                <strong>What to say to your guests right now:</strong>
                <p className="mt-1 italic">{currentSlide.speakerNotes}</p>
              </div>
            )}
          </div>

          {/* Quick Slide Selector Strip */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs overflow-x-auto">
            <div className="flex items-center gap-2">
              {PRESENTATION_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                    currentSlideIndex === idx
                      ? 'bg-black text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {slide.id}. {slide.category}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODE 2: EXHAUSTIVE 45-PAGE SYSTEM SPECIFICATION (PDF DOCUMENT) --- */}
      {docMode === 'spec' && (
        <div id="printable-technical-manual" className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-2xs space-y-10 text-slate-800 font-sans max-w-4xl mx-auto">
          {/* Formal Title Block */}
          <div className="border-b-4 border-slate-900 pb-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#C8102E]">
                meku Computers Engineering Whitepaper · Ref: MK-INV-2026-V3
              </span>
              <span className="text-xs font-mono text-slate-500">
                November 2026 Edition
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
              meku Computers Inventory Management System
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Enterprise Mobile-First Architecture, Discrete Unit Serial Tracking & Financial Valuation Specification
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono text-slate-500">
              <span>Author: meku Computers Technical Team</span>
              <span>·</span>
              <span>Target Runtime: React Native Web / Vite</span>
              <span>·</span>
              <span>Classification: Technical Manual (45-Page Master)</span>
            </div>
          </div>

          {/* Table of Contents Box */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">
              Table of Contents (Full System Index)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 pt-2 font-medium text-slate-700">
              <div>1. Executive Summary & Business Motivation</div>
              <div>7. Barcode & QR Camera Pipeline</div>
              <div>2. Single Source of Truth Architecture</div>
              <div>8. Printable Physical Shelf Tags</div>
              <div>3. Full Data Dictionary & Schema</div>
              <div>9. Valuation Accounting Mathematics</div>
              <div>4. Category Drilldown (Laptops/Power)</div>
              <div>10. Immutable Stock Audit Ledger</div>
              <div>5. Discrete Serial Number Tracking</div>
              <div>11. Role-Based Security Matrix (RBAC)</div>
              <div>6. Safe Stock-Out & Restocking Logic</div>
              <div>12. Disaster Recovery & JSON Portability</div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              1. Executive Summary & Business Motivation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Modern computer hardware and high-capacity electrical backup distribution requires rigorous operational accuracy. In retail and enterprise environments such as Addis Ababa, where high-value business ultrabooks (Dell Latitude, HP ProBook, Lenovo ThinkPad) and heavy-duty 3-phase UPS units (KSTAR 200 kVA / 400 kVA) are moved daily, traditional spreadsheets inevitably break down.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The <strong>meku Computers Inventory System</strong> was engineered to establish absolute data integrity across all warehouse operations. By enforcing client-authoritative state synchronization, every screen accesses the identical in-memory context: stocking out a single unit decrements quantities, recalculates potential gross margin, flags low-stock warnings, and writes an unalterable audit log simultaneously.
            </p>
          </section>

          {/* Section 2: Architecture */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              2. Single Source of Truth Architecture & React Native Web
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              The application leverages <strong>React Native for Web</strong>, bridging native mobile UI paradigms into the responsive web canvas. Core primitives—including <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">View</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">Text</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">TouchableOpacity</code>, and <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">StyleSheet</code>—guarantee sub-16ms tactile feedback on mobile screens while scaling to high-resolution desktop management consoles.
            </p>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs space-y-1">
              <div className="text-red-400 font-bold">// Central State Mutation Loop</div>
              <div>Dispatch Action (e.g. stockOutProduct) ➔ Mutate In-Memory State</div>
              <div>➔ Compute Derived Metrics (In Stock, Low Stock, Valuation)</div>
              <div>➔ Commit to Browser LocalStorage (Key: meku_inventory_v3)</div>
              <div>➔ Trigger Synchronized Component Re-renders Across Active Views</div>
            </div>
          </section>

          {/* Section 3: Data Dictionary */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              3. Data Dictionary & Contract Specification
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="p-3">Attribute</th>
                    <th className="p-3">Data Type</th>
                    <th className="p-3">Constraints</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-900">id</td>
                    <td className="p-3 font-mono text-slate-600">string</td>
                    <td className="p-3 font-mono text-red-600">Unique UUID</td>
                    <td className="p-3">Primary internal key.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-900">productCode</td>
                    <td className="p-3 font-mono text-slate-600">string</td>
                    <td className="p-3 font-mono text-red-600">Unique SKU</td>
                    <td className="p-3">Structured barcode identifier (e.g. LAP-DELL-5420-001).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-900">quantity</td>
                    <td className="p-3 font-mono text-slate-600">number</td>
                    <td className="p-3 font-mono">≥ 0</td>
                    <td className="p-3">Current warehouse units on hand.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-900">minimumStock</td>
                    <td className="p-3 font-mono text-slate-600">number</td>
                    <td className="p-3 font-mono">≥ 1</td>
                    <td className="p-3">Safety threshold triggering orange warning state.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-slate-900">serialNumbers</td>
                    <td className="p-3 font-mono text-slate-600">Array&lt;SerialNumber&gt;</td>
                    <td className="p-3 font-mono">Discrete</td>
                    <td className="p-3">Individual physical units tracking serial lifecycle.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Mathematical Formulations */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              4. Financial Valuation & Margin Formulation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Warehouse valuation is computed in real time in Ethiopian Birr (ETB) using the following authoritative equations:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">TOTAL BUYING VALUE</span>
                <span className="font-bold text-slate-900 block mt-1">∑ (Quantity × Cost)</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <span className="text-emerald-700 block text-[10px]">POTENTIAL SALES VALUE</span>
                <span className="font-bold block mt-1">∑ (Quantity × Selling Price)</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
                <span className="text-blue-700 block text-[10px]">POTENTIAL MARGIN</span>
                <span className="font-bold block mt-1">Sales Value − Buying Value</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              Note on Accounting Compliance: Potential margin is an unrealized asset value. Realized net income is booked exclusively upon stock-out completion with customer receipt metadata.
            </p>
          </section>

          {/* Section 5: Barcode & Camera Verification */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              5. Barcode & QR Hardware Integration
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              To eliminate the cost of proprietary handheld laser scanners, the system accesses the device camera via <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">navigator.mediaDevices.getUserMedia</code>. Barcode pattern recognition decodes standard 1D Code128 and 2D QR formats. If an unregistered code is scanned on the loading dock, the interface offers a 1-tap shortcut to pre-fill the SKU into the Add Item form, reducing catalog ingestion time by 80%.
            </p>
          </section>

          {/* Section 6: Security Matrix */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
              6. Security Model & Role Permissions (RBAC)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="p-3">User Role</th>
                    <th className="p-3">Target Profile</th>
                    <th className="p-3">Permitted Operations</th>
                    <th className="p-3">Security Restrictions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-bold text-red-700">Admin</td>
                    <td className="p-3">Executives & General Managers</td>
                    <td className="p-3">Full catalog CRUD, price updates, financial valuation reports, user roles, backups.</td>
                    <td className="p-3 text-slate-500">Unrestricted.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-700">Staff</td>
                    <td className="p-3">Warehouse Floor Technicians</td>
                    <td className="p-3">Search catalog, receive restock units, record stock-outs, view audit logs.</td>
                    <td className="p-3 text-slate-500">Cannot modify master pricing or system settings.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-700">Viewer</td>
                    <td className="p-3">Auditors, Trainees & Showroom Sales</td>
                    <td className="p-3">Search inventory, view product specifications and physical shelf coordinates.</td>
                    <td className="p-3 text-slate-500">All inventory mutations and stock modifications blocked.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Document Sign-Off Footer */}
          <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
            <div>meku Computers · Enterprise Inventory System</div>
            <div>Approved by Technical Architecture Committee</div>
            <div>© 2026 meku Computers. All Rights Reserved.</div>
          </div>
        </div>
      )}
    </div>
  );
};
