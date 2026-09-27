import { z } from 'zod';

export const askAiSchema = z.object({
  body: z.object({
    prompt: z.string().min(2, 'Prompt is required')
  })
});
