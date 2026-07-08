import express from 'express';
import { supabase } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { logAction } from './audit.js';

const router = express.Router();

const STAFF_ROLES = ['lgu_admin', 'coop_officer', 'city_councilor'];

router.post('/', authenticate, async (req, res) => {
  try {
    if (!STAFF_ROLES.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Only staff can submit CI reports' });
    }

    const {
      application_id, officer_name, visit_date, employment_status,
      visit_notes, character_notes, score_financial, score_character,
      score_collateral, recommendation,
    } = req.body;

    if (!application_id) {
      return res.status(400).json({ success: false, error: 'application_id is required' });
    }

    for (const [label, val] of [
      ['score_financial', score_financial],
      ['score_character', score_character],
      ['score_collateral', score_collateral],
    ]) {
      if (val !== undefined && (val < 1 || val > 10)) {
        return res.status(400).json({ success: false, error: `${label} must be between 1 and 10` });
      }
    }

    const { data, error } = await supabase
      .from('ci_reports')
      .insert({
        application_id,
        officer_name: officer_name || req.user.email,
        visit_date,
        employment_status,
        visit_notes: visit_notes || '',
        character_notes: character_notes || '',
        score_financial,
        score_character,
        score_collateral,
        recommendation,
      })
      .select()
      .single();

    if (error) throw error;

    await logAction({
      username: req.user.email,
      role: req.user.role,
      action: 'CREATE_CI_REPORT',
      record: `ci_reports:${data.id} (application:${application_id})`,
      ip: req.ip,
    });

    res.status(201).json({ success: true, report: data });
  } catch (err) {
    console.error('Create CI report error:', err);
    res.status(500).json({ success: false, error: 'Failed to submit CI report' });
  }
});

router.get('/application/:applicationId', authenticate, async (req, res) => {
  try {
    const { data: app, error: appError } = await supabase
      .from('loan_applications')
      .select('borrower_id')
      .eq('id', req.params.applicationId)
      .single();

    if (appError || !app) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const isOwner = app.borrower_id === req.user.id;
    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, error: 'Not authorized to view these reports' });
    }

    const { data, error } = await supabase
      .from('ci_reports')
      .select('*')
      .eq('application_id', req.params.applicationId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, reports: data });
  } catch (err) {
    console.error('List CI reports error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch CI reports' });
  }
});

export default router;
