-- ============================================================
--  Sequence Reset Script for PostgreSQL
--  Run this ONLY after deleting records to reset sequence gaps
-- ============================================================

-- Check current sequence values
SELECT sequence_name, last_value
FROM information_schema.sequences
WHERE
    sequence_schema = 'public'
ORDER BY sequence_name;

-- Reset individual sequences to remove gaps
-- Get max ID first, then reset sequence to max+1

-- Users table
SELECT MAX(id) FROM users;
-- ALTER SEQUENCE users_id_seq RESTART WITH [MAX_ID + 1];

-- Subjects table
SELECT MAX(id) FROM subjects;
-- ALTER SEQUENCE subjects_id_seq RESTART WITH [MAX_ID + 1];

-- Academic Years table
SELECT MAX(id) FROM academic_years;
-- ALTER SEQUENCE academic_years_id_seq RESTART WITH [MAX_ID + 1];

-- Schedules table
SELECT MAX(id) FROM schedules;
-- ALTER SEQUENCE schedules_id_seq RESTART WITH [MAX_ID + 1];

-- Attendance table
SELECT MAX(id) FROM attendance;
-- ALTER SEQUENCE attendance_id_seq RESTART WITH [MAX_ID + 1];

-- ============================================================
--  RECOMMENDED: Use Node utility instead
--  cd backend && node sequence-manager.js check-all
--  cd backend && node sequence-manager.js reset users
-- ============================================================