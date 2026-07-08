import express from 'express';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user.role !== 'lgu_admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

// Helper other routes can import to log actions — not exposed as an endpoint
export async function logAction({ username, role, action, record, ip }) {
  try {
    await supabase.from('audit_logs').insert({
      username,
      role,
      action,
      record,
      ip: ip || '0.0.0.0',
    });
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}

// GET /audit — list audit logs (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    res.json({ success: true, logs: data });
  } catch (err) {
    console.error('List audit logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

export default router;
