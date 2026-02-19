import { Router, Request, Response } from 'express';
import { db } from '../database/connection';
import { authenticateToken } from '../auth/middleware';
import { logger } from '../utils/logger';

export const reportRouter = Router();

// Get report by ID
reportRouter.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const analysis = await db.analysis.findById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check if user has permission to view this report
    if (analysis.user_id !== userId && req.user.role !== 'CLINICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.status(200).json({
      report: {
        id: analysis.id,
        userId: analysis.user_id,
        fileName: analysis.file_name,
        status: analysis.status,
        results: analysis.results,
        error: analysis.error,
        startedAt: analysis.started_at,
        completedAt: analysis.completed_at,
        processingTime: analysis.processing_time,
        userEmail: analysis.email,
        userFirstName: analysis.first_name,
        userLastName: analysis.last_name
      }
    });
  } catch (error: any) {
    logger.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Generate new report
reportRouter.post('/generate', authenticateToken, async (req: any, res: Response) => {
  try {
    const { analysisId, format = 'json' } = req.body;
    const userId = req.user.id;

    if (!analysisId) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    const analysis = await db.analysis.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    // Check permissions
    if (analysis.user_id !== userId && req.user.role !== 'CLINICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // In a real implementation, this would generate a formatted report
    // For now, we'll return the analysis results as the report
    const report = {
      id: `report_${Date.now()}`,
      analysisId,
      userId,
      format,
      generatedAt: new Date().toISOString(),
      content: analysis.results || { message: 'No results available' }
    };

    // Log the activity
    await db.activityLog.create({
      userId,
      analysisId,
      action: 'REPORT_GENERATED',
      details: { format, reportId: report.id }
    });

    logger.info(`Report generated: ${report.id} for analysis ${analysisId}`);

    res.status(201).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error: any) {
    logger.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});