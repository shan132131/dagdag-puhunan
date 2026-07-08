import express from 'express';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { logAction } from './audit.js';

const router = express.Router();

const VALID_ROLES = ['lgu_admin', 'coop_officer', 'msme_borrower', 'city_councilor'];
const VALID_STATUSES = ['Active', 'Inactive'];

function requireAdmin(req, res, next) {
  if (req.user.role !== 'lgu_admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

router.get('/me', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, cooperative, business, barangay, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: data });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, cooperative, business, barangay, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, users: data });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role, status } = req.body;
    const updates = {};

    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: `role must be one of: ${VALID_ROLES.join(', ')}` });
      }
      updates.role = role;
    }
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
      }
      updates.status = status;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, name, email, role, status')
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await logAction({
      username: req.user.email,
      role: req.user.role,
      action: 'UPDATE_USER',
      record: `users:${data.id} -> ${JSON.stringify(updates)}`,
      ip: req.ip,
    });

    res.json({ success: true, user: data });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

export default router;
