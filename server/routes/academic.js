const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT year, semester FROM academic_years ORDER BY updated_at DESC LIMIT 1'
    );
    res.json(result.rows[0] || { year: '2nd', semester: '4th' });
  } catch (err) {
    console.error('Get academic year error:', err);
    res.status(500).json({ error: 'Failed to fetch academic year' });
  }
});

router.put('/', async (req, res) => {
  const { year, semester } = req.body;
  if (!year || !semester) return res.status(400).json({ error: 'year and semester required' });
  try {
    const result = await pool.query(
      'INSERT INTO academic_years (year, semester) VALUES ($1, $2) RETURNING year, semester',
      [year, semester]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update academic year error:', err);
    res.status(500).json({ error: 'Failed to update academic year' });
  }
});

module.exports = router;
