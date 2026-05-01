const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET current schedule — PostgreSQL returns JSONB as a JS object directly
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT data FROM schedules ORDER BY updated_at DESC LIMIT 1'
    );
    res.json(result.rows[0] ? result.rows[0].data : {});
  } catch (err) {
    console.error('Get schedule error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// PUT update schedule — validates data before saving
router.put('/', async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'Schedule data required' });

  try {
    // Collect all unique teacher IDs and subjects from the schedule
    const teacherIds = new Set();
    const subjects = new Set();

    for (const day in data) {
      const daySchedule = data[day];
      if (typeof daySchedule === 'object') {
        for (const slot in daySchedule) {
          const entry = daySchedule[slot];
          if (entry && entry.type !== 'break') {
            if (entry.teacherId) {
              teacherIds.add(entry.teacherId);
            }
            if (entry.subject) {
              subjects.add(entry.subject);
            }
          }
        }
      }
    }

    // Validate all teacher IDs exist
    if (teacherIds.size > 0) {
      const teacherIdArray = Array.from(teacherIds);
      const teacherResult = await pool.query(
        'SELECT id FROM users WHERE type = $1 AND id = ANY($2)',
        ['teacher', teacherIdArray]
      );
      const existingTeacherIds = teacherResult.rows.map(r => r.id);
      const missingTeachers = teacherIdArray.filter(id => !existingTeacherIds.includes(id));

      if (missingTeachers.length > 0) {
        return res.status(400).json({
          error: `Teachers not found: ${missingTeachers.join(', ')}`
        });
      }
    }

    // Validate all subjects exist
    if (subjects.size > 0) {
      const subjectArray = Array.from(subjects);
      const subjectResult = await pool.query(
        'SELECT name FROM subjects WHERE name = ANY($1)',
        [subjectArray]
      );
      const existingSubjects = subjectResult.rows.map(r => r.name);
      const missingSubjects = subjectArray.filter(s => !existingSubjects.includes(s));

      if (missingSubjects.length > 0) {
        return res.status(400).json({
          error: `Subjects not found: ${missingSubjects.join(', ')}`
        });
      }
    }

    // All validations passed — save the schedule
    await pool.query('INSERT INTO schedules (data) VALUES ($1)', [data]);
    res.json(data);
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

module.exports = router;
