import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../database.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

const VALID_ROLES = ['lgu_admin', 'coop_officer', 'msme_borrower', 'city_councilor'];

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, cooperative, business, barangay } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: 'name, email, password, and role are required' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: `role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);

    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        role,
        cooperative: cooperative || '',
        business: business || '',
        barangay: barangay || '',
      })
      .select('id, name, email, role, status, created_at')
      .single();

    if (error) {
      if (error.code === '23505') { // unique_violation on email
        return res.status(409).json({ success: false, error: 'Email already registered' });
      }
      throw error;
    }

    res.status(201).json({ success: true, user: data });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// POST /login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password, role, status')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, error: 'Account is inactive' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

export default router;
