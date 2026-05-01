const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM subjects ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Subject name required' });
  try {
    const result = await pool.query(
      'INSERT INTO subjects (name) VALUES ($1) RETURNING id, name',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Subject already exists' });
    console.error('Add subject error:', err);
    res.status(500).json({ error: 'Failed to add subject' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

module.exports = router;
