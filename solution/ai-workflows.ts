import '@temporalio/ai-sdk/lib/load-polyfills';
import { generateText, stepCountIs, tool } from 'ai';
import { temporalProvider } from '@temporalio/ai-sdk';
import { proxyActivities } from '@temporalio/workflow';
import { z } from 'zod';
import type * as activities from './activities';

// Set your model name to match your provider:
const MODEL_NAME = 'anthropic--claude-4.5-sonnet';   // SAP Gen AI Hub (Recommended)
// const MODEL_NAME = 'gpt-4o-mini';                 // OpenAI
// const MODEL_NAME = 'claude-sonnet-4-5-20250929';  // Anthropic
// const MODEL_NAME = 'gemini-2.0-flash';            // Google

const { getWeather } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// Exercise 2 solution: Haiku Agent
export async function haikuAgent(prompt: string): Promise<string> {
  const result = await generateText({
    model: temporalProvider.languageModel(MODEL_NAME),
    prompt,
    system: 'You only respond in haikus.',
  });
  return result.text;
}

// Exercise 3 solution: Tools Agent
export async function toolsAgent(question: string): Promise<string> {
  const result = await generateText({
    model: temporalProvider.languageModel(MODEL_NAME),
    prompt: question,
    system: 'You are a helpful agent.',
    tools: {
      getWeather: tool({
        description: 'Get the weather for a given city',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: getWeather,
      }),
    },
    stopWhen: stepCountIs(5),
  });
  return result.text;
}