import express from 'express';
import crypto from 'crypto';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { logAction } from './audit.js';

const router = express.Router();

const VALID_CATEGORIES = ['sari-sari', 'food-business', 'tricycle', 'agri-processor', 'other'];
const VALID_FUND_SOURCES = ['LGU', 'City_Councilor'];
const STAFF_ROLES = ['lgu_admin', 'coop_officer', 'city_councilor'];

function generateRef() {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `LOAN-${year}-${random}`;
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, business, category, barangay, amount, purpose, term, fund_source } = req.body;

    if (!name || amount === undefined || term === undefined) {
      return res.status(400).json({ success: false, error: 'name, amount, and term are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be greater than 0' });
    }
    if (term < 3 || term > 36) {
      return res.status(400).json({ success: false, error: 'term must be between 3 and 36 months' });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ success: false, error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    if (fund_source && !VALID_FUND_SOURCES.includes(fund_source)) {
      return res.status(400).json({ success: false, error: `fund_source must be one of: ${VALID_FUND_SOURCES.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('loan_applications')
      .insert({
        ref: generateRef(),
        borrower_id: req.user.id,
        name,
        business: business || '',
        category: category || 'sari-sari',
        barangay: barangay || '',
        amount,
        purpose: purpose || '',
        term,
        fund_source: fund_source || 'LGU',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: 'Duplicate reference number, please try again' });
      }
      throw error;
    }

    await logAction({
      username: req.user.email,
      role: req.user.role,
      action: 'CREATE_APPLICATION',
      record: `loan_applications:${data.id} (${data.ref})`,
      ip: req.ip,
    });

    res.status(201).json({ success: true, application: data });
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit application' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    let query = supabase.from('loan_applications').select('*').order('created_at', { ascending: false });
    if (!STAFF_ROLES.includes(req.user.role)) {
      query = query.eq('borrower_id', req.user.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, applications: data });
  } catch (err) {
    console.error('List applications error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const isOwner = data.borrower_id === req.user.id;
    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this application' });
    }

    res.json({ success: true, application: data });
  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch application' });
  }
});

// PATCH /applications/:id/status — staff updates application status (e.g. approve/reject)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Only staff can update application status' });
    }

    const VALID_STATUSES = ['Pending', 'Under Verification', 'Under CI', 'Approved', 'Released', 'Active', 'Overdue', 'Closed', 'Rejected'];
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const { data, error } = await supabase
      .from('loan_applications')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    await logAction({
      username: req.user.email,
      role: req.user.role,
      action: 'UPDATE_APPLICATION_STATUS',
      record: `loan_applications:${data.id} -> ${status}`,
      ip: req.ip,
    });

    res.json({ success: true, application: data });
  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update application status' });
  }
});

export default router;
