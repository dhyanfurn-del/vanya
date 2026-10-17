# VANYA LIVING — Digital Platform & Artisan Ecosystem

> **Furniture for rooms you actually live in.**  
> Sustainable engineered timber, traditional joinery, and tailored natural textiles. Handcrafted in small batches by master artisans and delivered straight to your home without middleman markups.

---

## 🏛 Platform Overview

The **Vanya Living** digital ecosystem is architected as a modular monorepo containing two dedicated applications:

1. **Customer Storefront (`VANYAPROD`)**:
   - Curated living room, dining, bedroom, and lighting collections.
   - Interactive 3D/AR customizer for fabric, finish, and dimension configurations.
   - Transparent pricing breakdowns and instant customer checkout.
   - Real-time customer order generation.

2. **Vendor Ecosystem & Admin Command Center (`VANYAVEN`)**:
   - **Bill of Materials (BOM) Manager**: Multi-tier component breakdown (timber, metal, textiles, packaging) with assigned artisan vendors.
   - **Artisan Production Pipeline**: Real-time PO lifecycle tracking (`ongoing`, `vdone`, `hold`, `rejected`, `closed`).
   - **Photographic Workshop Directory**: Artisan dossiers, craft classifications, contact links, and rapid PO issuance.
   - **Automated BOM Explosion**: One-click production batch pushing that explodes finished products into individual vendor purchase orders.
   - **Activity & Financial Audit Log**: Immutable record of all state transitions and settlements.

---

## 📂 Repository Structure

```
VANYA/
├── VANYAPROD/                 # Customer Storefront Application
│   ├── assets/               # High-resolution catalog photography & brand assets
│   ├── index.html            # Storefront single-page application
│   └── server.ps1            # Local PowerShell HTTP server (Port 5600)
├── VANYAVEN/                  # Vendor Ecosystem & Admin Center
│   ├── index.html            # Vendor portal & BOM Manager single-page application
│   └── server.ps1            # Local PowerShell HTTP server (Port 5500)
├── assets/                    # Shared photography & CAD assets
├── vercel.json               # Unified Vercel deployment configuration
├── .gitignore                # Git exclusions (logs, caches, OS files)
└── README.md                 # System documentation
```

---

## 🚀 Running Locally

### Storefront (Port 5600)
```powershell
cd VANYAPROD
powershell -ExecutionPolicy Bypass -File .\server.ps1
# Opens on http://localhost:5600
```

### Vendor Ecosystem & Admin Portal (Port 5500)
```powershell
cd VANYAVEN
powershell -ExecutionPolicy Bypass -File .\server.ps1
# Opens on http://localhost:5500
```

*Demo Login Credentials:*
- **Admin Command Center**: Enter code `admin`
- **Artisan Workshop**: Enter code `VND-70291` (Woodworking), `VND-81923` (Metal), or `VND-62180` (Textiles)

---

## ☁️ Deployment on Vercel

This repository is pre-configured with `vercel.json` for zero-configuration continuous deployment:

1. Push your changes to the `main` branch of `https://github.com/dhyanfurn-del/vanya.git`.
2. In your [Vercel Dashboard](https://vercel.com/new), select **Add New Project** and import the `vanya` repository.
3. Keep the default settings and click **Deploy**.

### Live URL Routing
- **Storefront**: `https://your-domain.vercel.app/`
- **Vendor & Admin Portal**: `https://your-domain.vercel.app/vendor` (or `/admin`)
- **Shared Assets**: `https://your-domain.vercel.app/assets/*`

---

## 🔥 Firebase Cloud Firestore Integration

The application supports real-time synchronization between customer storefront purchases and artisan workshop purchase orders via Firebase Firestore.

To configure Firebase:
1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Create a Cloud Firestore database.
3. Provide your `firebaseConfig` object in the application script or configuration file.
4. Run the one-click database seeder to populate initial sample artisans, catalog products, and initial POs into Cloud Firestore.
