import { Router } from 'express';
import { authenticate, requireRole } from '../auth/auth.controller';
import * as tcTemplateController from './tc-template.controller';

const router = Router();

router.use(authenticate);

// Only Principals can manage TC templates
router.get('/', requireRole('PRINCIPAL'), tcTemplateController.getTemplates);
router.post('/', requireRole('PRINCIPAL'), tcTemplateController.uploadTemplate);
router.patch('/:id/activate', requireRole('PRINCIPAL'), tcTemplateController.activateTemplate);
router.patch('/:id/archive', requireRole('PRINCIPAL'), tcTemplateController.archiveTemplate);

// Generate TC (Principal generates TC for a student)
router.post('/generate/:tcId', requireRole('PRINCIPAL'), tcTemplateController.generateTc);

export default router;
