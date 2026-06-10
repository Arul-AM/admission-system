# 🎓 University Admission Workflow & Token Management System

**Anna University — College of Engineering, Guindy**

A production-ready full-stack admission portal with student registration, multi-stage workflow, JWT authentication, RBAC, SMS notifications, and real-time analytics.

---

## 🗂️ Project Structure

```
admission-system/
├── backend/                  ← Node.js + Express API
│   ├── src/
│   │   ├── config/firebase.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   ├── .env.example
│   └── render.yaml
├── frontend/                 ← React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   ├── .env.example
│   └── vercel.json
├── firestore.rules
├── firestore.indexes.json
└── README.md
```

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1 — Prerequisites

Install these before starting:
- Node.js v18+ → https://nodejs.org
- Git → https://git-scm.com

---

### STEP 2 — Firebase Setup (Database)

1. Go to https://console.firebase.google.com
2. Click **"Add Project"** → name it `admission-system`
3. Disable Google Analytics (optional) → Create project
4. Click **"Firestore Database"** in the left sidebar
5. Click **"Create database"** → choose **Production mode** → select region (e.g. `asia-south1`) → Enable
6. Go to **Project Settings** (⚙️ gear icon) → **Service accounts**
7. Click **"Generate new private key"** → **Generate key**
8. A JSON file downloads — **keep it safe, don't share it**
9. Open the JSON file and note these values:
   - `project_id`
   - `client_email`
   - `private_key`

---

### STEP 3 — Backend Setup

```bash
# 1. Go to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

**Edit `.env` with your values:**

```env
PORT=5000
JWT_SECRET=change_this_to_a_random_64char_string

# From Firebase JSON key:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# SMS (optional — leave blank for dev mode logging)
MSG91_AUTH_KEY=
MSG91_SENDER_ID=UNIADM
MSG91_TEMPLATE_ID=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Admin login password (change this!)
ADMIN_PASSWORD=Admin@123456
```

**⚠️ Important:** Copy the `private_key` from the Firebase JSON exactly as-is, keeping the `\n` characters.

```bash
# 4. Start backend server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Admin account seeded
```

---

### STEP 4 — Frontend Setup

Open a **new terminal**:

```bash
# 1. Go to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

**Edit `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# 4. Start frontend dev server
npm run dev
```

Open http://localhost:5173 in your browser.

---

### STEP 5 — Firestore Indexes

Some queries require composite indexes. When you first run the app and use filters, Firestore will log URLs in the backend console to create the needed indexes. Click each URL and create the index.

Alternatively, deploy the `firestore.indexes.json`:
```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
firebase deploy --only firestore:indexes
```

---

## 🔐 Default Login Credentials

| Role  | Username | Password      | Notes                  |
|-------|----------|---------------|------------------------|
| Admin | `admin`  | `Admin@123456`| Change after first login |

Staff accounts are created by admin from the Admin Panel → Staff Accounts.

---

## 👤 User Roles & Access

### Student
- Register via `/register`
- Login via `/student-login` using Application Number + Mobile
- View admission status, token, stage progress, history

### Staff (created by Admin)
- Login via `/login`
- Each staff is assigned exactly ONE stage (1–5)
- Can only view and process students at their assigned stage
- Stage-lock enforced: cannot skip or access other stages

### Admin
- Full dashboard with analytics charts
- Create/edit/disable up to 20 staff accounts
- View all students with search and filter
- Export CSV reports (all, completed, pending, by department, by round)
- View SMS logs and audit trail
- Send manual SMS notifications

---

## 🔄 Admission Workflow

```
Registration
    ↓
Stage 1: Document Verification
    ↓
Stage 2: Certificate Verification
    ↓
Stage 3: Online Verification
    ↓
Stage 4: Photo Capture
    ↓
Stage 5: Admission Completion
    ↓
✅ Completed
```

**Token Generation Rules:**
- Both validations complete → Admission Token (e.g. `R1-CSE-0001`)
- Online Admission Pending → Help Desk Token (e.g. `HD-001`)
- Fee Pending → Help Desk Token (e.g. `HD-002`)

---

## 🌐 API Routes

### Auth
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/student-login` | Public |

### Students
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/students/register` | Public |
| GET | `/api/students/me` | Student |
| GET | `/api/students` | Admin, Staff |
| GET | `/api/students/stats` | Admin |
| GET | `/api/students/:id` | Admin, Staff |
| POST | `/api/students/:id/advance` | Admin, Staff |

### Staff
| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/staff` | Admin |
| GET | `/api/staff` | Admin |
| PUT | `/api/staff/:id` | Admin |
| PATCH | `/api/staff/:id/toggle` | Admin |

### Notifications
| Method | Route | Access |
|--------|-------|--------|
| GET | `/api/notifications/sms-logs` | Admin |
| POST | `/api/notifications/send-sms` | Admin |
| GET | `/api/notifications/audit-logs` | Admin |

---

## ☁️ DEPLOYMENT

### Deploy Backend to Render

1. Go to https://render.com → Sign up / Log in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (push the `backend/` folder)
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add all environment variables from `.env` in the Render dashboard
6. Click **"Create Web Service"**
7. Copy the deployed URL (e.g. `https://admission-backend.onrender.com`)

### Deploy Frontend to Vercel

1. Go to https://vercel.com → Sign up / Log in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo (point to `frontend/` folder)
4. Set environment variable:
   - `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`
5. Click **"Deploy"**

---

## 📱 SMS Integration (MSG91)

1. Sign up at https://msg91.com
2. Create a template for each SMS type
3. Get your Auth Key from Dashboard
4. Add to backend `.env`:
   ```
   MSG91_AUTH_KEY=your_auth_key
   MSG91_SENDER_ID=UNIADM
   MSG91_TEMPLATE_ID=your_template_id
   ```

**If MSG91 keys are not set**, the system runs in **dev mode** — SMS content is logged to the console instead of being sent.

---

## 🔒 Security Features

- JWT Authentication (8-hour session)
- bcrypt password hashing (12 salt rounds)
- Role-Based Access Control (student / staff / admin)
- Rate limiting (500 req/15min global, 10 login attempts/15min)
- Helmet.js HTTP security headers
- CORS restricted to frontend URL
- Stage-lock workflow enforcement
- Audit logging for all key actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Hook Form, Recharts |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Auth | JWT + bcrypt |
| SMS | MSG91 |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

---

## ❓ Troubleshooting

**"Firebase: Error connecting"**
→ Double-check `FIREBASE_PRIVATE_KEY` in `.env`. The `\n` in the key must be literal `\n` characters, not actual newlines. Keep the outer quotes.

**"CORS error" in browser**
→ Make sure `FRONTEND_URL` in backend `.env` matches exactly the frontend URL (no trailing slash).

**Indexes error from Firestore**
→ Click the URL printed in the backend console to create the required composite index in Firebase Console.

**"Too many login attempts"**
→ Wait 15 minutes or restart the backend server in development.

**SMS not being sent**
→ Check that `MSG91_AUTH_KEY` is set. Without it, SMS is logged to console only (dev mode).
