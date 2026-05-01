const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// GET /api/auth/status
// Returns whether the system has been initialized (HOD exists)
router.get('/status', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE type = 'hod'"
    );
    const initialized = parseInt(result.rows[0].count) > 0;
    res.json({ initialized });
  } catch (err) {
    console.error('Status check error:', err.message);
    res.status(500).json({ error: 'Status check failed: ' + err.message });
  }
});

// POST /api/auth/register-hod
// One-time HOD registration — only works when no HOD exists yet
router.post('/register-hod', [
  body('name').notEmpty().withMessage('HOD name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    // Prevent duplicate HOD registration
    const existing = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE type = 'hod'"
    );
    if (parseInt(existing.rows[0].count) > 0) {
      return res.status(403).json({ error: 'System already initialized. Please log in.' });
    }

    const { name, password } = req.body;
    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      'INSERT INTO users (type, name, password_hash) VALUES ($1, $2, $3) RETURNING id, type, name',
      ['hod', name.trim(), hash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('HOD registration error:', err.message);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// POST /api/auth/login
router.post('/login', [
  body('type').isIn(['student', 'teacher', 'hod']).withMessage('Invalid type'),
  body('credentials').notEmpty().withMessage('Credentials required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { type, credentials } = req.body;
  const normalizedName = credentials.name ? credentials.name.trim().toLowerCase() : '';
  try {
    let result;
    if (type === 'student') {
      result = await pool.query(
        'SELECT * FROM users WHERE type = $1 AND roll = $2 AND dob = $3',
        [type, String(credentials.roll).trim(), String(credentials.dob).trim()]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM users WHERE type = $1 AND LOWER(TRIM(name)) = $2',
        [type, normalizedName]
      );
    }

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (type === 'student') {
      const token = jwt.sign(
        { userId: user.id, type: user.type },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      const { password_hash, ...safeUser } = user;
      return res.json({ user: safeUser, token });
    }

    // Teacher / HOD — need password
    if (!user.password_hash) {
      const setupToken = jwt.sign(
        { userId: user.id, type: user.type, setup: true },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      const { password_hash, ...safeUser } = user;
      return res.json({ needsSetup: true, user: safeUser, token: setupToken });
    }

    const validPass = await bcrypt.compare(credentials.password, user.password_hash);
    if (!validPass) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { userId: user.id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err.message, { type, credentials: { name: credentials.name, roll: credentials.roll } });
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// POST /api/auth/setup-password
router.post('/setup-password', [
  body('userId').notEmpty().withMessage('userId required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { userId, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Setup password error:', err);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.password_hash) {
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hash, decoded.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
