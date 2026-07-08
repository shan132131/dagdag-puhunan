import express from 'express';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const STAFF_ROLES = ['lgu_admin', 'coop_officer', 'city_councilor'];

function requireStaff(req, res, next) {
  if (!STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Staff access required' });
  }
  next();
}

// GET /reports/summary — dashboard totals (staff only)
router.get('/summary', authenticate, requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabase.from('loan_summary').select('*');

    if (error) throw error;

    const totalLoans = data.length;
    const totalAmountLoaned = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalPaid = data.reduce((sum, row) => sum + Number(row.paid || 0), 0);
    const totalBalance = data.reduce((sum, row) => sum + Number(row.balance || 0), 0);

    const byStatus = {};
    for (const row of data) {
      const key = row.status || 'Unknown';
      byStatus[key] = (byStatus[key] || 0) + 1;
    }

    const byRepayStatus = {};
    for (const row of data) {
      const key = row.repay_status || 'Unknown';
      byRepayStatus[key] = (byRepayStatus[key] || 0) + 1;
    }

    const byCategory = {};
    for (const row of data) {
      const key = row.category || 'Unknown';
      byCategory[key] = (byCategory[key] || 0) + 1;
    }

    res.json({
      success: true,
      summary: {
        totalLoans,
        totalAmountLoaned,
        totalPaid,
        totalBalance,
        byStatus,
        byRepayStatus,
        byCategory,
      },
    });
  } catch (err) {
    console.error('Reports summary error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate summary' });
  }
});

// GET /reports/loans — full loan_summary rows, with optional filters (staff only)
router.get('/loans', authenticate, requireStaff, async (req, res) => {
  try {
    const { status, category, barangay } = req.query;

    let query = supabase.from('loan_summary').select('*').order('submitted', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (barangay) query = query.eq('barangay', barangay);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, loans: data });
  } catch (err) {
    console.error('Reports loans error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch loan report' });
  }
});

// GET /reports/overdue — loans past due date with a balance remaining (staff only)
router.get('/overdue', authenticate, requireStaff, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('loan_summary')
      .select('*')
      .lt('due_date', today)
      .gt('balance', 0)
      .order('due_date', { ascending: true });

    if (error) throw error;

    res.json({ success: true, overdue: data });
  } catch (err) {
    console.error('Reports overdue error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch overdue report' });
  }
});

export default router;
