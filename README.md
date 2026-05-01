# Routine & Attendance - Full Stack App

React frontend + Node.js/Express/PostgreSQL backend.

## Project Structure
```
digital-routine-attendance/
├── client/              ← React frontend
│     ├── src/
│     ├── public/
│     ├── package.json
│     └── .env.example    ← Frontend env template
├── server/              ← Node.js backend
│     ├── routes/
│     ├── middleware/
│     ├── server.js
│     └── .env.example    ← Backend env template
└── README.md
```

## Features
- Role-based: HOD, Teacher, Student
- CRUD: Teachers, Students, Subjects, Schedule, Attendance
- Professional API with JWT auth

## Local Setup

### 1. Backend
```
cd server
npm install
# Copy server/.env.example to server/.env and fill in your values
npm run dev  # http://localhost:5001
```

### 2. Postgres DB
```
psql -U postgres
CREATE DATABASE attendance_db;
\i server/schema.sql  # creates tables + default HOD
```

### 3. Frontend
```
cd client
npm install
npm run dev  # http://localhost:5173 (proxies /api to backend)
```

### Test
- HOD: Dr. HOD / hod2026
- Add teacher/student etc - data in DB!

## Deploy
- Frontend: Vercel/Netlify
- Backend: Render/Heroku
- DB: Neon/Supabase Postgres

## API Docs
All /api/* JWT protected (except auth/login)

See routes/*.js

Enjoy your professional attendance system! 🚀

