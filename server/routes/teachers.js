const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const router = express.Router();

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, subject FROM users WHERE type = $1 ORDER BY name',
      ['teacher']
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get teachers error:', err);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

// POST add teacher
router.post('/', async (req, res) => {
  const { name, subject, password = 'teacher123' } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Teacher name required' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (type, name, subject, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, subject',
      ['teacher', name.trim(), subject || '', hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add teacher error:', err);
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

// PUT update teacher
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subject } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Teacher name required' });
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, subject = $2, updated_at = NOW() WHERE id = $3 AND type = $4 RETURNING id, name, subject',
      [name.trim(), subject || '', id, 'teacher']
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Teacher not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update teacher error:', err);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND type = $2',
      [id, 'teacher']
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Teacher not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete teacher error:', err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

module.exports = router;
