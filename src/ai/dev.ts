'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-plant-for-problems.ts';
import '@/ai/flows/identify-strain.ts';
import '@/ai/flows/assistant-chat-flow.ts';
