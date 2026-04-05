# ⚡ SkillForge — Skill Endorsement Platform

A full-stack skill endorsement system built with **React** (frontend) and **Node.js / Express / MongoDB** (backend).

---

## 📁 Project Structure

```
skillforge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                   # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Register / Login / Me
│   │   │   ├── user.controller.js       # Users CRUD + skills
│   │   │   ├── skill.controller.js      # Skills CRUD
│   │   │   └── endorsement.controller.js# Endorsements + stats
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT protect + adminOnly
│   │   ├── models/
│   │   │   ├── User.js                  # User schema
│   │   │   ├── Skill.js                 # Skill schema
│   │   │   └── Endorsement.js           # Endorsement schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── skill.routes.js
│   │   │   └── endorsement.routes.js
│   │   └── index.js                     # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── common/
    │   │       ├── ProtectedRoute.jsx
    │   │       ├── Topbar.jsx / .module.css
    │   │       ├── UI.jsx               # Reusable components
    │   │       └── UI.module.css
    │   ├── context/
    │   │   └── AuthContext.jsx          # Auth state + hooks
    │   ├── pages/
    │   │   ├── AppLayout.jsx / .module.css
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── Auth.module.css          # Shared auth styles
    │   │   ├── WelcomePage.jsx / .module.css
    │   │   ├── DashboardPage.jsx / .module.css
    │   │   ├── UsersPage.jsx / .module.css
    │   │   ├── SkillsPage.jsx / .module.css
    │   │   └── ProfilePage.jsx / .module.css
    │   ├── styles/
    │   │   └── globals.css              # CSS variables + base
    │   ├── utils/
    │   │   └── api.js                   # Axios instance + interceptors
    │   ├── App.jsx                      # Router
    │   └── index.js                     # React entry
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

---

### 1. Clone & Install

```bash
# Backend
cd skillforge/backend
cp .env.example .env          # Edit MONGO_URI and JWT_SECRET
npm install

# Frontend
cd ../frontend
cp .env.example .env          # Optional: set REACT_APP_API_URL
npm install
```

---

### 2. Configure Environment

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillforge
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 3. Run

```bash
# Terminal 1 — Backend
cd skillforge/backend
npm run dev          # starts on http://localhost:5000

# Terminal 2 — Frontend
cd skillforge/frontend
npm start            # starts on http://localhost:3000
```

---

## 🔐 Auth Flow

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Create account (name, email, password, role) |
| `POST /api/auth/login` | Login → returns JWT token |
| `GET  /api/auth/me` | Get current user (requires Bearer token) |

---

## 🛡️ Role Permissions

| Feature | User | Admin |
|---------|------|-------|
| View dashboard | ✅ | ✅ |
| Browse users | ✅ | ✅ |
| View skill profiles | ✅ | ✅ |
| **Endorse others** | ❌ | ✅ |
| Approve/reject endorsements | ❌ | ✅ |
| Create/edit/delete skills | ❌ | ✅ |
| Edit own profile & skills | ✅ | ✅ |

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Users
```
GET    /api/users              # List all (search, role, skill filters)
GET    /api/users/:id          # User profile + endorsements
PUT    /api/users/profile      # Update own profile
PUT    /api/users/skills       # Update own skills
PUT    /api/users/password     # Change password
DELETE /api/users/:id          # Deactivate user (admin)
```

### Skills
```
GET    /api/skills             # List all (search, category filter)
POST   /api/skills             # Create skill (admin)
PUT    /api/skills/:id         # Update skill (admin)
DELETE /api/skills/:id         # Delete skill (admin)
```

### Endorsements
```
GET    /api/endorsements/stats    # Dashboard stats
GET    /api/endorsements/pending  # Pending list (admin)
GET    /api/endorsements          # All / own endorsements
POST   /api/endorsements          # Create endorsement (admin)
PATCH  /api/endorsements/:id/status  # Approve / reject
```

---

## 🎨 Features

- **Login / Register** — JWT auth, role selection (user / admin)
- **Welcome Page** — Animated, personalized landing after login
- **Dashboard** — Stat cards, recent endorsements, pending approvals (admin), bar chart, donut chart, activity feed
- **Find Users** — Search, filter by role/skill, view profile modal with skill bars + LinkedIn/LeetCode links
- **Manage Skills** — Full sortable/filterable table, endorsement counts, growth %, Edit/Delete (admin only)
- **Edit Profile** — Basic info, skill picker with 5-level proficiency dots, external links, advanced toggles, password change, logout

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, CSS Modules, Recharts, react-hot-toast, Axios |
| Backend | Node.js, Express 4, Mongoose, bcryptjs, jsonwebtoken, express-validator |
| Database | MongoDB |
| Fonts | Syne (display), DM Sans (body) — Google Fonts |
