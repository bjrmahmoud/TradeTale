# TradeTale (Tradestory) ⚡

> **Quantitative behavioral trade autopsy & risk-normalized journaling system.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.18-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## 📖 Complete Documentation
For an in-depth explanation of the project's architecture, mathematical formulas, state machine, and data models, please see:
👉 **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** 👈

---

## 🎯 What is TradeTale?

Conventional trading journals operate as passive ledgers that record vanity dollar metrics. They cannot answer the most vital question in trading: **"How much money am I losing strictly because of broken rules and emotional mistakes?"**

TradeTale solves this by transforming trade journaling into an **active three-act narrative and quantitative behavioral autopsy engine**:
1. **$R$-Multiple Normalization**: Standardizes every trade into units of risk ($1R = \text{Planned Stop Distance} \times \text{Size}$), removing fiat currency distortion across accounts and asset classes.
2. **Discipline Overlay Curve**: Simultaneously charts your **Actual Realized Equity** versus your **100% Rule-Adherent Equity**, showing the exact cumulative dollar cost of emotional leaks (FOMO, chasing, moving stops, revenge trading).
3. **The 3-Act Narrative Logger**:
   - **Act I: The Thesis** (Pre-Trade invalidation, setup model, planned R:R, pre-trade chart).
   - **Act II: Execution & Mindset** (Fill price, slippage, position size, real-time neuro-state selector).
   - **Act III: Autopsy & Audit** (Pass/fail rule checklist, post-trade chart, structured 3-line post-mortem).
4. **Daily Drawdown Safety Gate**: Real-time ceiling tracking that sounds alerts if daily loss allowances (-3R or -$1,000) are breached.
5. **Playbook Edge Matrix**: Ranks strategy setups by mathematical expectancy ($E = (W \times \overline{R}_w) - (L \times \overline{R}_l)$) and flags negative-expectancy setups for retirement.

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/TradeTale.git
cd TradeTale

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to explore TradeTale.

---

## ⌨️ Global Hotkeys

- `N`: Instantly launch the **3-Act Narrative Trade Logger**.
- `Cmd + K` / `Ctrl + K`: Open **Global Command Search**.
- `Esc`: Close any open drawer or modal.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (Obsidian Command theme)
- **Icons & FX**: Lucide React, canvas-confetti
- **Cloud & Auth**: Firebase Auth, Firestore, and Cloud Storage (with automatic offline LocalStorage fallback)
- **Linter**: Oxlint for lightning-fast analysis
