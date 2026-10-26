import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';
import { processAiPrompt } from './ai.service';

export async function askAi(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant?.id || req.user?.schoolId;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      throw new AppError('Prompt is required', 400, 'BAD_REQUEST');
    }

    const user = {
      userId: req.user!.id,
      role: req.user!.role,
      name: req.user!.name,
      email: req.user!.email,
    };

    const aiResponse = await processAiPrompt(prompt, schoolId, user);

    res.json({ success: true, data: { response: aiResponse } });
  } catch (error) {
    next(error);
  }
}
