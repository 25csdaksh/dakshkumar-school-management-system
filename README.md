# Dakshkumar School Management System (School ERP)

A premium, full-featured School ERP system designed for managing academic tasks, school administrative operations, and user portals. The system supports multi-role dashboards (Admin, Teacher, Student, Parent) with rich aesthetics, real-time activity tracking, fees billing, and hostel management.

---

## 🚀 Technology Stack

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JWT (JSON Web Tokens) with custom role authorization middlewares
* **Asset Uploads:** Cloudinary (with local storage uploads fallback)
* **Dev Tooling:** Nodemon for auto-reloading

### Frontend
* **Build Tool:** Vite
* **Library:** React (v19)
* **Styling:** Vanilla CSS with a responsive premium theme system (dynamic light & dark themes, glassmorphism panel styles, and smooth micro-animations)
* **Routing:** React Router (v7)
* **Icons:** Lucide React

---

## 🎨 System Design & Aesthetics

The application follows state-of-the-art UI principles defined in the frontend layout:
* **Typography:** Built using Google Fonts (`Outfit` for headings, `Plus Jakarta Sans` for body text).
* **Dynamic Themes:** Full dark and light mode system powered by custom CSS custom properties (variables) defined in [index.css](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/index.css).
* **Glassmorphism:** Custom blur backdrops and clean borders for cards (`.glass-panel`, `.glass-panel-interactive`).
* **Micro-animations:** Interactive scaling, translation on hover, and smooth CSS keyframe modal transitions.

---

## 📂 Core Folder Structure

```text
├── backend/                           # Node/Express API Server
│   ├── src/
│   │   ├── config/                    # DB connections & external configurations
│   │   ├── controllers/               # Express request handlers
│   │   ├── middleware/                # JWT parsing, auth, and role verification
│   │   ├── models/                    # Mongoose schemas (19 schemas total)
│   │   ├── routes/                    # Route splitters
│   │   ├── services/                  # Business logic classes/services
│   │   ├── utils/                     # Utility helpers
│   │   └── app.js                     # Main Express App definitions
│   ├── server.js                      # Application server entrypoint
│   ├── scripts/                       # Database seed scripts
│   └── package.json                   # Backend configurations & scripts
│
└── frontend/                          # React/Vite SPA Client
    ├── src/
    │   ├── assets/                    # Static assets
    │   ├── context/                   # React context states (Auth, UI theme)
    │   ├── layouts/                   # Layout wrappers (Sidebar, Top Bar, Profile summaries)
    │   ├── pages/                     # Routed view components
    │   │   ├── admin/                 # Dashboard, Hostel, Inventory, Notices, etc.
    │   │   ├── auth/                  # Portal login and recovery views
    │   │   ├── parent/                # Parent monitoring dashboards
    │   │   ├── student/               # Student grades & attendance tracking
    │   │   └── teacher/               # Attendance markers & grade upload sheets
    │   ├── routes/                    # Router path definitions
    │   ├── services/                  # API client handlers/wrappers
    │   ├── index.css                  # Custom global design system stylesheet
    │   ├── App.jsx                    # App root setup (Auth & Router provider context)
    │   └── main.jsx                   # React mounting script
    └── package.json                   # Frontend dependencies & Vite setup
```

---

## ✨ Features Breakdown

### 🗝️ Authentication & Security
* Multi-portal unified Login system under [Login.jsx](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/pages/auth/Login.jsx).
* Custom JWT middleware validating user request authorization.
* Automated tracking of user operations in [ActivityLog.js](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/backend/src/models/ActivityLog.js).

### 👑 Administrator Dashboard
* **Dynamic Stats Panel:** Real-time school operation tracking counts (Students, Teachers, Classes, Books, Rooms).
* **Inventory & Supplies:** Management of equipment and supplies stock levels.
* **Hostel Management:** Booking rooms, assigning students, tracking warden records.
* **Library Systems:** Issuing books, inventory tracking, and cataloging.
* **Fees & Billing:** Generation of invoices and tracking invoice payments.
* **Announcements:** Post notifications and school notices to all portal roles.

### 🍎 Teacher Workspace
* **Attendance Ledger:** Mark and record daily class attendance lists.
* **Grading Portal:** Upload examination marks, submit grades, and view class-level score analytics.

### 🎓 Student & Parent Portals
* **Grades & Report Cards:** Direct tracking of exams and class performance.
* **Attendance History:** Review monthly attendance analytics and visual progress rings.
* **Fees Records:** Access invoice details and track payment histories.

---

## 🛠️ Installation & Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed and running.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Set up environment variables inside [backend/.env](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/backend/.env):
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/school_erp
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
4. Optional: Populate initial system seed data:
   ```bash
   npm run seed
   ```
5. Run the backend development server:
   ```bash
   npm run dev
   ```
   *The server starts listening on `http://localhost:5001/`*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   *The client opens locally on `http://localhost:5173/`*

---

## 🔍 Key Code References
* Main entry point routing: [AppRoutes.jsx](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/routes/AppRoutes.jsx)
* System styling and theme variables: [index.css](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/frontend/src/index.css)
* Backend server configuration: [app.js](file:///c:/Users/daksh/Desktop/dakshkumar%20school%20management%20system/backend/src/app.js)
* Backend Server Port: `5001`
* Frontend Port: `5173`
