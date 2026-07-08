import { Router }              from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.js';
import { validate, schemas }   from '../middleware/validate.js';
import { asyncHandler }        from '../middleware/errorHandler.js';
import * as ctrl               from '../controllers/applications.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/applications — list (role-filtered)
router.get('/', asyncHandler(ctrl.list));

// GET /api/applications/:id — single
router.get('/:id', asyncHandler(ctrl.getOne));

// POST /api/applications — submit new application
router.post('/',
  authorize(ROLES.MSME_BORROWER, ROLES.LGU_ADMIN, ROLES.COUNCILOR),
  validate(schemas.loanApplication),
  asyncHandler(ctrl.create)
);

// PATCH /api/applications/:id/status — update status
router.patch('/:id/status',
  authorize(ROLES.LGU_ADMIN, ROLES.COOP_OFFICER, ROLES.COUNCILOR),
  validate(schemas.statusUpdate),
  asyncHandler(ctrl.updateStatus)
);

// PUT /api/applications/:id/checklist — save verification checklist
router.put('/:id/checklist',
  authorize(ROLES.COOP_OFFICER, ROLES.COUNCILOR),
  validate(schemas.checklist),
  asyncHandler(ctrl.saveChecklist)
);

// POST /api/applications/:id/ci — submit CI report
router.post('/:id/ci',
  authorize(ROLES.COOP_OFFICER, ROLES.COUNCILOR),
  validate(schemas.ciReport),
  asyncHandler(ctrl.submitCI)
);

export default router;
