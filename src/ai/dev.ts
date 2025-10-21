'use server';

import { config } from 'dotenv';
config();

// Import flows here.
import '@/app/analyze/actions';
import '@/app/identify/actions';
import '@/ai/flows/assistant-chat-flow';
