# 🏥 Hospora — Hospital Management Software

A production-ready, multi-tenant hospital management software platform built with Django + React.

![Hospora](https://img.shields.io/badge/Hospora-HMS-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-4.2-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-ready-blue?style=flat-square)

---

## 🏗️ Architecture

```
hospora/
├── backend/                  # Django + DRF API
│   ├── apps/
│   │   ├── core/             # Mixins, multi-tenancy base
│   │   ├── hospitals/        # Hospital model & API
│   │   ├── users/            # Auth + Staff management
│   │   ├── patients/         # Patient records
│   │   ├── appointments/     # Scheduling
│   │   ├── medical_records/  # Clinical records
│   │   ├── billing/          # Invoices & payments
│   │   ├── pharmacy/         # Medicine inventory
│   │   ├── lab/              # Lab tests
│   │   ├── departments/      # Hospital departments
│   │   └── dashboard/        # Analytics API
│   └── config/               # Django settings, URLs
├── frontend/                 # React + Vite + TailwindCSS
│   └── src/
│       ├── api/              # Axios client & API functions
│       ├── components/       # Layout + shared UI
│       ├── context/          # Auth context
│       ├── hooks/            # React Query hooks
│       ├── pages/            # All route pages
│       ├── types/            # TypeScript types
│       └── lib/              # Utilities
├── docker-compose.yml        # Production Docker
├── docker-compose.dev.yml    # Development Docker
├── render.yaml               # Render.com deployment
└── vercel.json               # Vercel deployment
```

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose installed
- Git

### 1. Clone & Configure

```bash
git clone <your-repo-url>
cd hospora

# Copy and configure backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your SECRET_KEY
```

### 2. Run with Docker Compose

```bash
# Production build
docker-compose up --build

# OR development mode (hot reload)
docker-compose -f docker-compose.dev.yml up --build
```

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:8000/api
- API Docs: http://localhost:8000/api/docs

---

## 🛠️ Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env — set your database credentials

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm run dev
```

---

## 🔐 Authentication

### Register a Hospital + Admin
```bash
POST /api/auth/register/
{
  "hospital_name": "City General Hospital",
  "hospital_email": "admin@cityhospital.com",
  "admin_name": "Dr. John Smith",
  "admin_email": "john@cityhospital.com",
  "password": "securepassword"
}
```

### Login
```bash
POST /api/auth/login/
{
  "email": "john@cityhospital.com",
  "password": "securepassword"
}
# Returns: { access, refresh, user }
```

JWT tokens are stored in `localStorage` under key `hospora_auth`.

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register hospital + admin |
| POST | `/api/auth/login/` | Login (returns JWT) |
| GET | `/api/auth/me/` | Current user |
| GET/PUT | `/api/hospitals/:id/` | Hospital details |
| POST | `/api/hospitals/:id/upgrade/` | Upgrade plan |
| GET/POST | `/api/patients/` | List / create patients |
| GET/PUT/DELETE | `/api/patients/:id/` | Patient CRUD |
| GET/POST | `/api/appointments/` | Appointments |
| GET/POST | `/api/staff/` | Staff management |
| GET/POST | `/api/departments/` | Departments |
| GET/POST | `/api/medical-records/` | Medical records |
| GET/POST | `/api/billing/` | Invoices |
| GET | `/api/billing/summary/` | Revenue summary |
| GET/POST | `/api/pharmacy/` | Medicines (Advanced+) |
| GET/POST | `/api/lab/` | Lab tests (Advanced+) |
| GET | `/api/dashboard/stats/` | Dashboard stats |
| GET | `/api/dashboard/revenue-trends/` | 7-day revenue |
| GET | `/api/dashboard/recent-appointments/` | Recent appointments |
| GET | `/api/dashboard/patient-growth/` | Patient growth chart |

---

## 👥 Roles & Permissions

| Role | Access |
|------|--------|
| `super_admin` | All hospitals, all data |
| `hospital_admin` | Full access to own hospital |
| `doctor` | Patients, appointments, medical records |
| `receptionist` | Patients, appointments, billing |
| `lab_technician` | Lab tests |
| `pharmacist` | Pharmacy |

---

## 📦 Plan Features

| Feature | Trial | Basic | Advanced | Enterprise |
|---------|-------|-------|----------|------------|
| Max Doctors | 3 | 5 | 20 | Unlimited |
| Pharmacy | ❌ | ❌ | ✅ | ✅ |
| Lab | ❌ | ❌ | ✅ | ✅ |
| Multi-branch | ❌ | ❌ | ❌ | ✅ |

---

## ☁️ Deployment

### Render.com (Recommended)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Blueprint
3. Connect your repo
4. Render reads `render.yaml` and deploys everything automatically

### Vercel (Frontend Only)

```bash
cd frontend
vercel --prod
# Set VITE_API_URL to your Render backend URL
```

### Manual Docker (VPS/EC2)

```bash
# On your server
git clone <repo>
cd hospora
cp backend/.env.example backend/.env
# Edit backend/.env with production values
docker-compose up -d --build
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your-super-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,.onrender.com
DB_NAME=hospora
DB_USER=postgres
DB_PASSWORD=strongpassword
DB_HOST=db
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://yourfrontend.vercel.app
```

### Frontend
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 🧪 Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL (multi-tenant with `hospital` FK on every model)
- JWT Auth (djangorestframework-simplejwt)
- Gunicorn + WhiteNoise

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Query (server state)
- Recharts (analytics charts)
- React Router v6

**Infrastructure:**
- Docker + Docker Compose
- Nginx (frontend reverse proxy)
- Render.com / Vercel ready

---

## 📝 License

MIT License — free to use, modify, and deploy.
# HP
