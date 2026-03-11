# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DealFlow Pro is a real estate deal analysis and management tool. It is currently a **single-file React prototype** (`App.jsx`, ~774 lines) with no build infrastructure, no backend, and no external dependencies beyond React itself.

All state is client-side and in-memory (no persistence). The app requires React and ReactDOM to be provided by a parent application or added via a bundler.

## Architecture

The entire app lives in `App.jsx` as one default-exported React component with several internal sub-components. There is no build system (no package.json, webpack, vite, etc.) at this stage.

### Five main tabs (controlled by `TABS` constant):
1. **Deal Analyzer** — Purchase price, ARV, rehab cost tracking with auto-calculated metrics (MAO, NOI, cap rate, ROI) across deal types: fix-flip, wholesale, STR, ADU, BRRRR
2. **CMA Comp Grid** — Comparable sales analysis (NAR/USPAP standards) with subject + 3 comps, 28 adjustment line items, weighted ARV estimation
3. **Deals & Pipeline** — Deal tracker with 10-stage pipeline (Lead → Closed → Dead), color-coded stage management, profit calculations
4. **Lender** — Loan tracking with 8 loan types, LTV/LT-ARV calculations, closing cost breakdowns, draw schedules, cash-on-cash ROI
5. **Market Intel** — Profit projections for 4 strategies, expense waterfall, market statistics, syncs data from Deal Analyzer

### State management:
- Top-level `App` holds global state (`address`, `dealData`) passed via props
- Each tab manages its own local state with `useState`
- No context API or state library — pure props drilling
- Shared `dealData` shape: `{ purchasePrice, arv, rehabCost, sqft, aduSqft, grossIncome, opEx, propertyType, beds, baths, yearBuilt, lotSize, notes }`

### Shared utility functions:
- `fmt(v)` — format number as currency
- `pct(a, b)` — percentage string
- `num(v)` — parse string to number
- `calcAutoAdj()` / `getAdjAmount()` — CMA valuation adjustment calculations

### UI patterns:
- Dark theme: `#0d1117` background, `#e2e8f0` text, indigo (`#6366F1`) and green (`#10B981`) accents
- Reusable components: `Card`, `GreenCard`, `RedCard`, `PurpleCard`, `Field`, `Sel`, `SH`, `AddressBar`
- All styling is inline CSS-in-JS (no CSS files or Tailwind)
- Flex-based layouts with `flexWrap: "wrap"`

### Domain defaults:
- Adjustment rates defined in `DEFAULT_ADJ` ($50/sqft, $5K/bed, $8K/bath, etc.)
- 10 pipeline stages in `STAGES` with associated colors
- 70% rule for fix-flip MAO, 75% rule for wholesale MAO
- 6% default agent commission, 12-month default loan term
