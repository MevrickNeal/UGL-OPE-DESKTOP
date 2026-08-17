# 🖥️ Urban Gaz Limited — OPE Desktop Commissioning Platform

> **Standalone Windows Desktop Application for LPG Operations Engineers**  
> **100% Offline-First Architecture · Real-Time Cloud Synchronization · Engineering Splash Screen**

---

## 🌟 Executive Summary

The **Urban Gaz Limited OPE Desktop Platform** is a dedicated Windows engineering software designed specifically for LPG site testing, vertical riser pressure analysis, customer meter commissioning, and automated audit report generation.

It operates **100% offline** on remote sites without needing an active internet connection. When an internet connection is available, it automatically syncs all site data, test logs, and maintenance comments to the **Urban Gaz Cloud Database (Supabase)**.

---

## ✨ Key Features & Technical Specifications

### 1. 🖥️ Standalone Desktop Window
* Native desktop app window with high-tech dark/glass **engineering splash screen**.
* Auto-hides browser chrome — runs as a dedicated software application (`.exe`).

### 2. ⚡ 100% Offline-First Data Storage
* All project details, pressure test readings, timestamps, and technician remarks are stored directly on the local PC disk using **IndexedDB / localforage**.
* **Zero Data Loss**: Field engineers can work in basements, rural sites, or remote towers without cell service.

### 3. ☁️ Real-Time & Resilient Cloud Sync
* **Live Status Badge**:
  * 🟢 `ONLINE · CLOUD SYNC` (when connected to internet)
  * 🟡 `OFFLINE MODE · DISK SAVED` (when working offline on site)
* Automatically pushes pending local records to **Supabase Database** as soon as internet connectivity is detected.

### 4. 💨 Engineering Test Tolerances & Validation Rules
* **Stage 5: Vertical Riser Air Test (200 mbar)**:
  * Max Permissible Delta: **`0.003`** (Initial & End readings expected to be identical).
  * Status: **`HEALTHY (PASS ✓)`** if delta ≤ `0.003`, otherwise **`LEAK DETECTED ✗`**.
* **Stage 7: LPG Meter Commissioning (40 mbar)**:
  * Recorded **after 15-minute gas stabilization prep time**.
  * Low Pressure Delta Threshold: **`0.001 m³`**.
  * Status: **`PASS ✓`** if delta ≤ `0.001 m³`, otherwise **`ABNORMAL LEAK DETECTED`** + closure alert.
* **Forward-Flow Meter Safety Validation**:
  * Gas meters flow forward only. If a user enters a **Final Reading < Initial Reading**, an instant warning banner is triggered.

### 5. 📊 Dynamic Manifolds & Pixel-Perfect Excel Reports
* Supports any custom manifold arrangement (`1, 2, 3...` or `A, B, C...` or `M1, M2...`).
* Generated flats match the configured labels (e.g. `1A, 2A...` or `101, 201...`).
* Exports official maintenance Excel reports (`.xlsx`) matching exact corporate guidelines.

---

## 📦 For Non-Technical Users: Quick Setup Guide

1. Download the repository folder or release ZIP.
2. Open the app folder and double-click `Urban-Gaz-OPE-Platform.exe` (or run `npm run electron:dev` if Node is installed).
3. The high-tech **Urban Gaz Splash Screen** will launch, initialize the local offline engine, and open the platform!

---

## 🛠️ For Developers & Tech Administrators

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run Desktop App in Development Mode (Native Window)
npm run electron:dev

# 3. Build Standalone Windows (.exe) Installer Package
npm run electron:build
```

---

## 🗄️ Database & Cloud Integration

* **Supabase Project URL**: Configured in `.env`
* **Local Migration Schema**: Available in `supabase_migration.sql`

---

## 📄 License & Attribution

**Urban Gaz Limited** · LPG Reticulated Systems & Engineering Commissioning Platform  
*All Rights Reserved © 2026 Urban Gaz Limited.*
