import express from 'express';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const STAFF_ROLES = ['lgu_admin', 'coop_officer', 'city_councilor'];

// GET /notifications — list all (shared/global board)
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, notifications: data });
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// POST /notifications — create one (staff only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Only staff can create notifications' });
    }

    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'title and message are required' });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({ title, message })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, notification: data });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ success: false, error: 'Failed to create notification' });
  }
});

// PATCH /notifications/:id/read — mark as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true, notification: data });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

export default router;
