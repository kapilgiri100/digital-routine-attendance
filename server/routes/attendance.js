const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET all attendance — returns { day: { time_slot: { timestamp, data } } }
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (day, time_slot) day, time_slot, timestamp, data
       FROM attendance
       ORDER BY day, time_slot, timestamp DESC`
    );
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.day]) grouped[row.day] = {};
      grouped[row.day][row.time_slot] = {
        timestamp: row.timestamp,
        data: row.data
      };
    });
    res.json(grouped);
  } catch (err) {
    console.error('Get attendance error:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// POST mark attendance
router.post('/', async (req, res) => {
  const { day, time_slot, rollsPresent } = req.body;
  if (!day || !time_slot) return res.status(400).json({ error: 'day and time_slot required' });

  try {
    // Fetch all students
    const studentsResult = await pool.query(
      'SELECT roll FROM users WHERE type = $1',
      ['student']
    );
    const studentRolls = studentsResult.rows.map(r => String(r.roll));

    // Build attendance map: { "roll": true/false }
    const presentSet = new Set((rollsPresent || []).map(r => String(r)));
    const data = {};
    studentRolls.forEach(roll => {
      data[roll] = presentSet.has(roll);
    });

    // Update existing record if one exists for the same slot, otherwise insert a new one
    const updateResult = await pool.query(
      'UPDATE attendance SET data = $3, timestamp = NOW() WHERE day = $1 AND time_slot = $2 RETURNING *',
      [day, time_slot, data]
    );

    let result;
    if (updateResult.rowCount === 0) {
      result = await pool.query(
        'INSERT INTO attendance (day, time_slot, data) VALUES ($1, $2, $3) RETURNING *',
        [day, time_slot, data]
      );
    } else {
      result = updateResult;
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Mark attendance error:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

module.exports = router;
