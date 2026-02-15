// =============================================================================
// Exercise 2 & 3: AI Workflows
//
// Fill in the TODOs below following the exercise instructions.
// =============================================================================

// ---------------------------------------------------------------------------
// Exercise 2: Uncomment these imports for the Haiku Agent
// ---------------------------------------------------------------------------
// import '@temporalio/ai-sdk/lib/load-polyfills';
// import { generateText } from 'ai';
// import { temporalProvider } from '@temporalio/ai-sdk';

// ---------------------------------------------------------------------------
// Exercise 3: Uncomment these imports for the Tools Agent
// ---------------------------------------------------------------------------
// import { proxyActivities } from '@temporalio/workflow';
// import { tool, stepCountIs } from 'ai';
// import { z } from 'zod';
// import type * as activities from './activities';

// ---------------------------------------------------------------------------
// Set your model name to match your provider (uncomment ONE):
// ---------------------------------------------------------------------------
// const MODEL_NAME = 'gpt-4o-mini';                    // OpenAI
// const MODEL_NAME = 'claude-sonnet-4-5-20250929';      // Anthropic
// const MODEL_NAME = 'gemini-2.0-flash';                // Google

// =============================================================================
// Exercise 2: Haiku Agent
// =============================================================================
//
// TODO: Implement this function using generateText() from the Vercel AI SDK.
//
//   1. Call generateText() with:
//      - model: temporalProvider.languageModel(MODEL_NAME)
//      - prompt: the prompt parameter
//      - system: 'You only respond in haikus.'
//   2. Return result.text
//
export async function haikuAgent(prompt: string): Promise<string> {
  throw new Error('Not implemented — complete this in Exercise 2');
}

// =============================================================================
// Exercise 3: Tools Agent
// =============================================================================
//
// TODO: Implement this function using generateText() with tools.
//
//   1. Use proxyActivities to get the getWeather activity:
//      const { getWeather } = proxyActivities<typeof activities>({
//        startToCloseTimeout: '1 minute',
//      });
//
//   2. Call generateText() with:
//      - model: temporalProvider.languageModel(MODEL_NAME)
//      - prompt: the question parameter
//      - system: 'You are a helpful agent.'
//      - tools: an object with a getWeather tool definition using tool() from 'ai'
//        (provide description, inputSchema with zod, and execute function)
//      - stopWhen: stepCountIs(5)
//
//   3. Return result.text
//
export async function toolsAgent(question: string): Promise<string> {
  throw new Error('Not implemented — complete this in Exercise 3');
}
