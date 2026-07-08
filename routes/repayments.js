import express from 'express';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { logAction } from './audit.js';

const router = express.Router();

const STAFF_ROLES = ['lgu_admin', 'coop_officer', 'city_councilor'];

router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase
      .from('repayments')
      .select('*, loan_applications!inner(borrower_id)')
      .order('due_date', { ascending: true });

    if (!STAFF_ROLES.includes(req.user.role)) {
      query = query.eq('loan_applications.borrower_id', req.user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, repayments: data });
  } catch (err) {
    console.error('List repayments error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch repayments' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repayments')
      .select('*, loan_applications!inner(borrower_id)')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Repayment not found' });
    }

    const isOwner = data.loan_applications?.borrower_id === req.user.id;
    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this repayment' });
    }

    res.json({ success: true, repayment: data });
  } catch (err) {
    console.error('Get repayment error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch repayment' });
  }
});

router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Only staff can record payments' });
    }

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'A positive payment amount is required' });
    }

    const { data: current, error: fetchError } = await supabase
      .from('repayments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({ success: false, error: 'Repayment not found' });
    }

    const newPaid = Number(current.paid) + Number(amount);
    const newBalance = Number(current.loaned) - newPaid;

    if (newBalance < 0) {
      return res.status(400).json({ success: false, error: 'Payment exceeds remaining balance' });
    }

    const newStatus = newBalance === 0 ? 'Closed' : current.status;

    const { data, error } = await supabase
      .from('repayments')
      .update({ paid: newPaid, balance: newBalance, status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      username: req.user.email,
      role: req.user.role,
      action: 'RECORD_PAYMENT',
      record: `repayments:${data.id} +${amount} (balance now ${newBalance})`,
      ip: req.ip,
    });

    res.json({ success: true, repayment: data });
  } catch (err) {
    console.error('Record payment error:', err);
    res.status(500).json({ success: false, error: 'Failed to record payment' });
  }
});

export default router;
