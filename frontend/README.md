# Dakshkumar School Management System - Frontend SPA Client

This is the frontend single-page application (SPA) client for the **Dakshkumar School Management System**. Built on **React 19** and **Vite**, it delivers a highly interactive, responsive, and aesthetically premium dashboard experience for administrators, teachers, students, and parents.

---

## 🎨 Premium Theme & UI Design

The frontend application uses a custom vanilla CSS design system that implements state-of-the-art styling guidelines:
* **Typography:** Integrated with Google Fonts — `Outfit` for display headings and `Plus Jakarta Sans` for clean, readable body copy.
* **Dynamic Theme Modes:** Supports seamless, real-time light and dark modes controlled via custom CSS custom properties (variables) defined in [index.css](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/index.css).
* **Glassmorphism:** Elegant panels with background blur effects (`.glass-panel`) and interactive panels (`.glass-panel-interactive`) providing beautiful card borders and drop-shadows.
* **Micro-animations:** Subtle translation transitions, interactive button/card scale-ups, and smooth modal keyframes.

---

## 🌐 Localization (i18n)

The user interface supports multi-lingual operations configured inside [i18n.js](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/i18n.js). Supported languages include:
1. **English (EN)**
2. **Hindi (HI)**
3. **Gujarati (GU)**

Locale preferences are automatically detected and cached using `i18next-browser-languagedetector` and stored in local storage.

---

## 📂 Project Structure Breakdown

The frontend folder is organized as follows:
```text
├── src/
│   ├── assets/           # Static image assets and logo icons
│   ├── components/       # Common reusable UI elements (e.g., Modals, Cards, Loaders)
│   ├── context/          # React Context providers (AuthContext, ThemeContext)
│   ├── layouts/          # Responsive UI frame layouts wrapping specific user portals
│   │   ├── BaseLayout.jsx       # Global base panel structure with sidebar & header
│   │   ├── AdminLayout.jsx      # Admin specific routing wrapper
│   │   ├── TeacherLayout.jsx    # Teacher specific routing wrapper
│   │   ├── StudentLayout.jsx    # Student specific routing wrapper
│   │   └── ParentLayout.jsx     # Parent specific routing wrapper
│   ├── locales/          # Localization JSON dictionaries (en.json, hi.json, gu.json)
│   ├── pages/            # View components mapped to dashboard roles:
│   │   ├── admin/        # 20 Academic, Transport, Fees, Hostel & Inventory dashboards
│   │   ├── auth/         # Login, Password Reset, and First-login setups
│   │   ├── parent/       # Child academic records and fee monitoring dashboards
│   │   ├── student/      # Student-specific exam marks, fees, and attendance logs
│   │   └── teacher/      # Teacher registers, grading boards, and leave requests
│   ├── routes/           # Routing configuration powered by React Router v7
│   │   └── AppRoutes.jsx # Application router mapping path configurations
│   ├── services/         # Custom API clients wrapper for backend server requests
│   ├── App.css           # Local overrides and styling additions
│   ├── index.css         # Main design system stylesheet containing color systems & layouts
│   ├── App.jsx           # App entry container and Context Providers wrapper
│   ├── i18n.js           # Multi-language configuration setup
│   └── main.jsx          # DOM rendering/mounting point
├── package.json          # Dependencies, devDependencies, and run scripts
└── vite.config.js        # Vite configurations
```

---

## 🛠️ Main Dashboard Modules & Features

### 1. Unified Authentication ([auth/](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/pages/auth))
* **Login.jsx:** Role-based portal routing.
* **ForgotPassword.jsx:** Step-by-step account recovery portal.
* **ChangePasswordFirst.jsx:** Compulsory password setup on initial account login.

### 2. Admin Workspace ([admin/](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/pages/admin))
* **Dashboard.jsx:** Dynamic metrics indicators tracking students, teachers, books, and rooms.
* **Academic.jsx / Classes.jsx:** Manage academic terms, structures, sections, and classroom allocations.
* **Fees.jsx:** Invoice management, payment status logs, and tuition fee structure config.
* **Hostel.jsx & Transport.jsx / BusTracking.jsx:** Room bookings, warden registration, transport routes, and real-time transit bus status.
* **Library.jsx & Inventory.jsx:** Book catalogs, borrowing ledgers, and institutional asset supplies.
* **Settings.jsx:** Global portal parameters and theme parameters.

### 3. Teacher Dashboard ([teacher/](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/pages/teacher))
* **Attendance.jsx:** Daily student attendance trackers.
* **Marks.jsx & Homework.jsx:** Grading worksheets, exams, and class-level score sheets.
* **Leaves.jsx:** Manage teacher leave request submissions and history logs.

### 4. Student & Parent Dashboard ([student/](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/pages/student) & [parent/](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/pages/parent))
* **Dashboard.jsx:** Customized portals presenting quick access to class announcements and general metrics.
* **Attendance.jsx & Results.jsx:** Historical records checking, visual progress rings, and examination sheets.
* **Fees.jsx:** View and pay tuition invoices and download financial payment histories.

---

## 🚀 Installation and Setup

### 1. Installation
Navigate into the `frontend` folder and run the install command:
```bash
cd frontend
npm install
```

### 2. Running Local Dev Server
To start the Vite developer client, run:
```bash
npm run dev
```
*The client is active locally on `http://localhost:5173/` by default.*

### 3. Build & Preview
To bundle static assets for a production deployment:
```bash
npm run build
```
To review the local production distribution bundle:
```bash
npm run preview
```
