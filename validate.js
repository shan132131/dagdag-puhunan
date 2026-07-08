import { z } from 'zod';

// Validate request body against a Zod schema
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    const errors = err.errors?.map(e => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }
};

// ── Shared schemas ──────────────────────────────────────────────
export const schemas = {
  login: z.object({
    email:    z.string().email('Invalid email format.').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
  }),

  loanApplication: z.object({
    name:      z.string().min(2).max(100),
    business:  z.string().max(100).optional().default(''),
    category:  z.enum(['sari-sari','food-business','tricycle','agri-processor','other']),
    barangay:  z.string().min(1).max(50),
    amount:    z.number().int().min(1000).max(500000),
    purpose:   z.string().min(5).max(500),
    term:      z.number().int().min(3).max(36),
    fundSource:z.enum(['LGU','City_Councilor']).optional().default('LGU'),
  }),

  repayment: z.object({
    repaymentId: z.number().int().positive(),
  }),

  penalty: z.object({
    repaymentId: z.number().int().positive(),
    penaltyAmt:  z.number().positive(),
  }),

  statusUpdate: z.object({
    status: z.enum(['Pending','Under Verification','Under CI','Approved','Released','Active','Overdue','Closed','Rejected']),
  }),

  ciReport: z.object({
    applicationId:   z.number().int().positive(),
    visitDate:       z.string().regex(/^\d{4}-\d{2}-\d{2}/),
    employmentStatus:z.string().max(50),
    visitNotes:      z.string().max(1000).optional().default(''),
    characterNotes:  z.string().max(1000).optional().default(''),
    scoreFinancial:  z.number().int().min(1).max(10),
    scoreCharacter:  z.number().int().min(1).max(10),
    scoreCollateral: z.number().int().min(1).max(10),
    recommendation:  z.string().max(200),
  }),

  checklist: z.object({
    applicationId:    z.number().int().positive(),
    validId:          z.boolean(),
    proofIncome:      z.boolean(),
    residence:        z.boolean(),
    barangayClearance:z.boolean(),
    references:       z.boolean(),
  }),

  userStatus: z.object({
    status: z.enum(['Active','Inactive']),
  }),
};
