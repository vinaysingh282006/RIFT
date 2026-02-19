import { Router, Request, Response } from 'express';
import { db } from '../database/connection';
import { authenticateToken, requireClinician } from '../auth/middleware';
import { logger } from '../utils/logger';

export const patientRouter = Router();

// Get all patients (clinician only)
patientRouter.get('/', authenticateToken, requireClinician, async (req: any, res: Response) => {
  try {
    // This would fetch all patients from database
    // For now, return empty array as we're using mock database
    const patients: any[] = []; // await db.user.findMany({ role: 'PATIENT' });
    
    res.status(200).json({
      patients: patients.map((p) => ({
        id: p.id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        createdAt: p.created_at
      })),
      count: patients.length
    });
  } catch (error: any) {
    logger.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to get patients' });
  }
});

// Get patient by ID (clinician only)
patientRouter.get('/:id', authenticateToken, requireClinician, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const patient = await db.user.findById(id);
    
    if (!patient || patient.role !== 'PATIENT') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json({
      patient: {
        id: patient.id,
        email: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name,
        createdAt: patient.created_at,
        lastLoginAt: patient.last_login_at
      }
    });
  } catch (error: any) {
    logger.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to get patient' });
  }
});

// Get patient analyses (clinician only)
patientRouter.get('/:id/analyses', authenticateToken, requireClinician, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify patient exists
    const patient = await db.user.findById(id);
    if (!patient || patient.role !== 'PATIENT') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const analyses = await db.analysis.findByUserId(id);
    
    res.status(200).json({
      analyses,
      count: analyses.length
    });
  } catch (error: any) {
    logger.error('Get patient analyses error:', error);
    res.status(500).json({ error: 'Failed to get patient analyses' });
  }
});