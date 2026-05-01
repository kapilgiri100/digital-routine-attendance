-- ============================================================
--  Routine & Attendance Management System
--  PostgreSQL Schema — Completely Empty Initial State
--  Run in pgAdmin Query Tool on database: attendance_db
-- ============================================================

-- Drop existing tables (safe re-run)
DROP TABLE IF EXISTS attendance     CASCADE;
DROP TABLE IF EXISTS schedules      CASCADE;
DROP TABLE IF EXISTS users          CASCADE;
DROP TABLE IF EXISTS subjects       CASCADE;
DROP TABLE IF EXISTS academic_years CASCADE;

-- ============================================================
--  TABLE: academic_years
-- ============================================================
CREATE TABLE academic_years (
    id          SERIAL PRIMARY KEY,
    year        TEXT NOT NULL,
    semester    TEXT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE: subjects
-- ============================================================
CREATE TABLE subjects (
    id          SERIAL PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE: users  (hod | teacher | student)
-- ============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    type          TEXT NOT NULL CHECK (type IN ('hod', 'teacher', 'student')),
    name          TEXT NOT NULL,
    roll          TEXT UNIQUE,           -- students only
    dob           DATE,                  -- students only (used as login key)
    subject       TEXT,                  -- teachers only
    password_hash TEXT,                  -- teachers & HOD
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE: schedules  (JSONB weekly timetable)
-- ============================================================
CREATE TABLE schedules (
    id          SERIAL PRIMARY KEY,
    data        JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  TABLE: attendance  (JSONB per session: { roll: true/false })
-- ============================================================
CREATE TABLE attendance (
    id          SERIAL PRIMARY KEY,
    day         TEXT        NOT NULL,
    time_slot   TEXT        NOT NULL,
    data        JSONB       NOT NULL DEFAULT '{}',
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
--  INDEXES
-- ============================================================
CREATE INDEX idx_users_type        ON users(type);
CREATE INDEX idx_users_roll        ON users(roll);
CREATE INDEX idx_att_day_time      ON attendance(day, time_slot);
CREATE INDEX idx_schedules_updated ON schedules(updated_at DESC);

-- ============================================================
--  NO SEED DATA — everything is created through the application
--  First run: HOD registers via the "System Setup" screen
-- ============================================================

-- Verify tables created:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
