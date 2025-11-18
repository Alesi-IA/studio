import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  imageUrl: z.string().optional(), // Image is now part of the message
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
