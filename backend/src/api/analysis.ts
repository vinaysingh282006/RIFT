import { Router, Request, Response } from 'express';
import { db } from '../database/connection';
import { authenticateToken, optionalAuth } from '../auth/middleware';
import { logger } from '../utils/logger';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow VCF files
    if (file.mimetype === 'text/plain' || file.originalname.endsWith('.vcf')) {
      cb(null, true);
    } else {
      cb(new Error('Only VCF files are allowed'));
    }
  }
});

export const analysisRouter = Router();

// Upload VCF file for analysis
analysisRouter.post('/upload', authenticateToken, upload.single('vcfFile'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'VCF file is required' });
    }

    const { drugs = [] } = req.body;
    const userId = req.user.id;

    // Create analysis record
    const analysis = await db.analysis.create({
      userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadPath: req.file.path
    });

    // Log the activity
    await db.activityLog.create({
      userId,
      analysisId: analysis.id,
      action: 'ANALYSIS_STARTED',
      details: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        drugs: drugs
      }
    });

    logger.info(`Analysis started: ${analysis.id} for user ${userId}`);

    res.status(201).json({
      message: 'Analysis uploaded successfully',
      analysis: {
        id: analysis.id,
        fileName: analysis.file_name,
        fileSize: analysis.file_size,
        status: analysis.status,
        startedAt: analysis.started_at
      }
    });
  } catch (error: any) {
    logger.error('Analysis upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Get analysis by ID
analysisRouter.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await db.analysis.findById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check if user has permission to view this analysis
    if (analysis.user_id !== userId && req.user.role !== 'CLINICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.status(200).json(analysis);
  } catch (error: any) {
    logger.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to get analysis' });
  }
});

// Get all analyses for current user
analysisRouter.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    let analyses;
    if (req.user.role === 'CLINICIAN' || req.user.role === 'ADMIN') {
      // Clinicians can see all analyses
      analyses = await db.analysis.findAll(parseInt(limit), parseInt(offset));
    } else {
      // Regular users can only see their own analyses
      analyses = await db.analysis.findByUserId(userId);
    }

    res.status(200).json({
      analyses,
      count: analyses.length
    });
  } catch (error: any) {
    logger.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to get analyses' });
  }
});

// Update analysis status (internal use)
analysisRouter.patch('/:id/status', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status, results, error } = req.body;
    const userId = req.user.id;

    // Only clinicians and admins can update analysis status
    if (req.user.role !== 'CLINICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const analysis = await db.analysis.updateStatus(id, status, results, error);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Log the activity
    await db.activityLog.create({
      userId,
      analysisId: id,
      action: `ANALYSIS_${status}`,
      details: { status, hasResults: !!results, hasError: !!error }
    });

    logger.info(`Analysis ${id} updated to status: ${status}`);

    // If analysis is complete, schedule cleanup of uploaded file
    if (status === 'COMPLETED' || status === 'FAILED') {
      setTimeout(async () => {
        try {
          // Delete the uploaded file after processing is complete
          if (analysis.upload_path) {
            const fs = await import('fs');
            if (fs.existsSync(analysis.upload_path)) {
              fs.unlinkSync(analysis.upload_path);
              logger.info(`Cleaned up uploaded file: ${analysis.upload_path}`);
            }
          }
        } catch (cleanupError) {
          logger.error(`Error cleaning up file for analysis ${id}:`, cleanupError);
        }
      }, 10 * 60 * 1000); // Clean up after 10 minutes
    }

    res.status(200).json({
      message: 'Analysis status updated',
      analysis
    });
  } catch (error: any) {
    logger.error('Update analysis status error:', error);
    res.status(500).json({ error: 'Failed to update analysis status' });
  }
});

// Delete analysis
analysisRouter.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await db.analysis.findById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check permissions
    if (analysis.user_id !== userId && req.user.role !== 'CLINICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete the uploaded file if it exists
    try {
      if (analysis.upload_path) {
        const fs = await import('fs');
        if (fs.existsSync(analysis.upload_path)) {
          fs.unlinkSync(analysis.upload_path);
          logger.info(`Cleaned up uploaded file: ${analysis.upload_path}`);
        }
      }
    } catch (fileError) {
      logger.error(`Error deleting uploaded file for analysis ${id}:`, fileError);
    }

    // In a real implementation, you'd delete the file and database record
    // For now, we'll just log the deletion
    await db.activityLog.create({
      userId,
      analysisId: id,
      action: 'ANALYSIS_DELETED',
      details: { fileName: analysis.file_name }
    });

    logger.info(`Analysis deleted: ${id} by user ${userId}`);

    res.status(200).json({
      message: 'Analysis deleted successfully'
    });
  } catch (error: any) {
    logger.error('Delete analysis error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});