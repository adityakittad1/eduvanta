import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middleware/errorHandler';

export async function askAi(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schoolId = req.tenant!.id;
    if (!schoolId) throw new AppError('No school context', 400, 'BAD_REQUEST');

    const { prompt } = req.body;

    // TODO: Integrate actual LLM logic here.
    // For now, return a mock response.
    const mockResponse = `This is a simulated AI response to: "${prompt}".\n\nTo integrate a real LLM, update \`ai.controller.ts\` and ensure API keys are set in \`.env\`.`;

    res.json({ success: true, data: { response: mockResponse } });
  } catch (error) {
    next(error);
  }
}
