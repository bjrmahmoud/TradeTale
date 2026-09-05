# Tradestory (Tradify) — Product Requirements Document (PRD) & Product Brief

**Document Version:** 1.0.0  
**Author:** Principal Product Designer & Full-Stack Architect  
**Status:** Approved for Engineering & Sprint Planning  
**Target Platform:** Web (Desktop Command-Center & Mobile Web App)  
**Primary Design System:** Obsidian Command (`#0B0F17` / `#10B981` / `#EF4444` / Geist Mono)  

---

## 1. Executive Summary & Product Vision

### 1.1 The Core Problem
Conventional trading journals (TraderSync, Edgewonk, generic Google Sheets) operate as passive retrospective P&L ledgers. They incentivize vanity metrics (gross dollar profit) rather than repeatable mathematical edge and psychological discipline. Active financial traders (Futures, Forex, Equities) regularly suffer from:
1. **Behavioral Leaks**: Unconscious revenge trading, FOMO entries, and moving stop-losses under adverse market excursions.
2. **Invisible Cost of Rule Violations**: Inability to quantify the exact monetary loss attributable solely to non-compliant trades.
3. **Decoupled Planning vs. Execution**: Trade setups are planned in charting platforms (TradingView) but logged hours later in isolated spreadsheets, losing emotional and structural context.

### 1.2 The Tradestory Solution
Tradestory re-architects trade journaling into an **active, three-act narrative and behavioral autopsy engine**. By standardizing performance in **Risk-Adjusted Units ($R$-Multiples)** and auditing strict rule compliance before and after every order, Tradestory separates market randomness from execution fidelity.

### 1.3 Key Value Metrics & KPIs
- **Discipline Leak Delta**: The quantitative difference in $R$ between 100% rule-adherent equity and gross realized equity.
- **Rule Adherence Index (RAI)**: Target >90% adherence across all logged trades.
- **Expectancy per Playbook Setup**: Math-backed expectancy ($E = (\text{Win\%} \times \text{Avg Win } R) - (\text{Loss\%} \times \text{Avg Loss } R)$).
- **Time-to-Log**: <45 seconds per trade using structured 3-act keyboard workflows.

---

## 2. User Personas & Target Audience

### 2.1 The Systematic Prop Trader ("Marcus", 29)
- **Profile**: Trades CME Futures (NQ, ES) during the New York Open (09:30–11:30 EST). Funded by prop firms with strict maximum daily drawdown limits ($1,000/day).
- **Pain Point**: Tilting after an early stop-out, breaking size rules, and blowing evaluations.
- **Needs**: Real-time drawdown gate warnings, instant 3-click logging, and immediate behavioral accountability.

### 2.2 The Discretionary Swing/Day Trader ("Elena", 34)
- **Profile**: Trades tech equities (NVDA, TSLA, AAPL) and major FX pairs based on Liquidity Sweeps and Fair Value Gaps (FVG).
- **Pain Point**: Can't tell whether losses stem from flawed strategy models or poor execution discipline.
- **Needs**: Pre-trade vs. post-trade dual screenshot autopsies and setup-specific statistical expectancy curves.

---

## 3. Product Scope & Functional Feature Matrix

| Feature Module | Priority | Description | Key Deliverable |
|---|---|---|---|
| **Daily Pulse Dashboard** | P0 (Must Have) | High-density command bar with live $R$-realized, drawdown safety gate, process discipline heatmap, and chronological trade feed. | Live Canvas Screen `{{DATA:SCREEN:SCREEN_2}}` |
| **3-Act Narrative Logger** | P0 (Must Have) | Multi-phase modal/drawer capturing Act I (Thesis), Act II (Execution & Mindset), and Act III (Autopsy & Rule Audit). | Live Canvas Screen `{{DATA:SCREEN:SCREEN_8}}` |
| **Trade Autopsy Split-View** | P0 (Must Have) | Comparative dual-timeline review, 5-point pass/fail compliance checklist, and 3-line structured markdown post-mortem. | Live Canvas Screen `{{DATA:SCREEN:SCREEN_4}}` |
| **Edge & Discipline Engine** | P0 (Must Have) | Discipline Overlay Curve (Actual vs. 100% Rule Equity), Setup Matrix Expectancy, and Emotional Leak partition. | Live Canvas Screen `{{DATA:SCREEN:SCREEN_6}}` |
| **Risk Gate & Drawdown Engine** | P1 (Core) | Real-time calculation of max daily loss ceiling; locks trade entry triggers if daily loss threshold (-3R or -$1,000) is breached. | Backend Engine / UI alert banners |
| **Export & Tax / Reporting Engine**| P2 (Next) | CSV/JSON export and broker trade import (NinjaTrader, Tradovate, Interactive Brokers CSV sync). | Data export modal |

---

## 4. In-Depth Functional Specifications

### 4.1 Module 1: The Daily Pulse Dashboard
- **Top Command Strip**:
  - Live market session indicator (`● NY SESSION OPEN`).
  - Daily Realized Multiplier display in $R$-units (e.g., `+4.25R`) with secondary gross fiat translation (`+$2,125.00`).
  - Rule Discipline Badge with percentage adhere rate (`94.0% Plan Adherence`).
  - Daily Drawdown Safety Meter displaying consumed risk vs. maximum ceiling (`$340 / $1.0k Safe Operating Zone`).
- **Process Discipline Heatmap**:
  - 35-to-90 session rolling GitHub-style matrix.
  - Cell shading driven strictly by rule compliance percentage and $R$-multiple yield (Emerald for compliant profit, muted slate for compliant clean loss, brick crimson for rule violation losses).
  - Discipline Streak counter (`18-Session Zero Revenge Entries`).
- **Chronological Execution Stream**:
  - Compact trade rows displaying Ticker, Direction badge (LONG/SHORT), setup tag, entry/exit, adherence status, and "View Autopsy" drill-down button.

### 4.2 Module 2: The 3-Act Narrative Trade Logger
- **Act I — The Thesis (Pre-Trade)**:
  - Instrument specification (Asset class pills: Futures, Forex, Equities, Crypto).
  - Ticker with automated tick-size validation.
  - Active Session & Setup Timeframe (Anchor vs. Execution).
  - Playbook Strategy Model dropdown with historical win-rate badge.
  - Planned Entry, Stop Loss (invalidation level), Take Profit, and real-time calculated Risk-to-Reward ratio bar.
  - Drag-and-drop slot for Pre-Trade Chart screenshot.
  - Narrative Thesis & Catalyst markdown text input.
- **Act II — The Live Execution**:
  - Exact fill timestamp, fill price, position contract/share sizing, slippage offset calculation.
  - Mindset & Neuro-State selector: `Calm & Centered`, `FOMO Urge`, `Hesitant`, `Chasing Price`, `Revenge`.
- **Act III — The Autopsy & Compliance**:
  - Exit fill price, gross/net P&L, fees/commissions, realized $R$-multiple.
  - Binary Rule Adherence Checklist (e.g., *"Waited for candle close confirmation?"*, *"Risk adhered strictly under daily loss allowance?"*).
  - Post-trade chart screenshot upload.
  - 3-Line Review:
    1. *What worked* (Positive reinforcement)
    2. *What failed* (Execution drag / friction)
    3. *The lesson* (Actionable rule refinement)

### 4.3 Module 3: Trade Autopsy Split-View
- **Dual Timeline Trajectory Visualizer**:
  - Interactive SVG/Canvas chart tracing Planned vs. Realized market path.
  - Scale-out milestone markers (e.g., `Scale 50% @ +2.0R`, `Trailing Stop @ +2.6R`).
- **Audit Checklist Matrix**:
  - Expandable pass/fail verification nodes with timestamp validation and slippage tolerance confirmation.
- **Neuro-State Reflection**:
  - Trader biometric/mindset telemetry (e.g., `CALM | Score 10/10 | 0 BPM Elevation`).

### 4.4 Module 4: Edge & Discipline Analytics Engine
- **Discipline Overlay Curve**:
  - Dual equity curves tracking:
    - Line A (Muted Emerald): Theoretical equity if 100% of trades satisfied rule compliance.
    - Line B (Dotted Peach/Red): Realized equity inclusive of undisciplined executions.
  - Callout Banner calculating total **Discipline Leak** (e.g., `-19.3R / -$9,650 forfeited to 9 early FOMO entries and 7 widened stops`).
- **Emotional Impact Partition**:
  - Expectancy table categorized by psychological tag displaying trade volume, win rate %, and net $R$-yield.
- **Playbook Edge Matrix**:
  - Statistical ranking of trade setups sorted by positive mathematical expectancy. Flags setups with negative statistical edge for retirement.

---

## 5. Technical Architecture & Data Model

### 5.1 Technology Stack
- **Frontend Core**: Next.js 14 (App Router, Server Components, React Server Actions).
- **Styling**: Tailwind CSS configured with custom Obsidian Command tokens (`#0B0F17`, `#161F30`, `#1F293D`, `#10B981`, `#EF4444`).
- **Database & Identity**: Supabase (PostgreSQL with Row Level Security, pg_stat_statements for query profiling).
- **Object Storage**: Supabase Storage (`trade-screenshots` private bucket with presigned upload URLs).
- **Client State & Caching**: TanStack Query (React Query) v5 + Zustand for high-speed hotkey drawers.
- **Data Visualization**: Lightweight Charts (TradingView) and Visx for SVG equity curves and process heatmaps.

### 5.2 Key Database Schema Entity Relationships
```
[ users ] 1 ───< [ daily_journals ]
    │
    ├───< [ setups ] 1 ───< [ trades ]
    │                            │
    ├───< [ trade_rules ]        ├───< [ trade_rule_responses ]
    │         │                  │
              └─── 1 ────────────┘
```

---

## 6. Design System & UI/UX Guidelines

- **Palette Tokens**:
  - Background Canvas: `#0B0F17` (Surface lowest)
  - Card / Panel Elevated: `#161F30` (Surface low)
  - Card Hover / Border: `#1F293D` (Surface outline)
  - Positive Execution / Discipline: `#10B981` (Emerald 500)
  - Rule Failure / Risk Warning: `#EF4444` (Rose 500)
  - Inactive / Secondary Text: `#94A3B8` (Slate 400)
- **Typography Hierarchy**:
  - Display / Numbers: Geist Mono / JetBrains Mono (monospaced tabular figures for all prices, sizes, and $R$-multiples).
  - UI Labels & Editorial Copy: Geist Sans / Inter.
- **Keyboard Navigation Shortcuts**:
  - `N`: Open 3-Act Narrative Trade Logger.
  - `Cmd + K`: Global search across setups, tickers, and autopsies.
  - `Esc`: Dismiss drawer / modal.
  - `Cmd + Enter`: Submit trade act / save thesis.

---

## 7. Release Milestones & Implementation Roadmap

- **Phase 1: Alpha Core (Weeks 1–3)**:
  - Database provisioning on Supabase with custom enums and tables.
  - 3-Act Logger Drawer (`Act I` & `Act II`) with live $R:R$ calculation.
  - Daily Pulse Dashboard with basic trade card feed.
- **Phase 2: Autopsy & Audit Engine (Weeks 4–6)**:
  - Trade Autopsy Split-View with dual screenshot uploads.
  - Rule adherence checklist engine and automated $R$-realized accounting.
  - Daily Drawdown Safety Gate banner and alert modal.
- **Phase 3: Quantitative Edge Engine (Weeks 7–9)**:
  - Discipline Overlay Curve calculation worker.
  - Emotional state correlation analysis table.
  - Playbook Edge Matrix with expectancy retirement triggers.
- **Phase 4: Integrations & Polishing (Weeks 10–12)**:
  - Broker CSV auto-import (NinjaTrader, Tradeovate).
  - Keyboard shortcut overlay and mobile PWA optimization.
