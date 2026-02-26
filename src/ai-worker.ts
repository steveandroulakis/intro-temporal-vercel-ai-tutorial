import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';

// =============================================================================
// Exercise 2: Configure the AI Worker
//
// TODO: Uncomment the AiSdkPlugin import and your chosen provider below.
// =============================================================================

// TODO: Import AiSdkPlugin
// import { AiSdkPlugin } from '@temporalio/ai-sdk';
// import type { ProviderV3 } from '@ai-sdk/provider';

// TODO: Import your chosen provider (uncomment ONE):
// import { createSAPAI } from '@sap/ai-sdk-vercel-adapter';  // Option A: SAP Gen AI Hub (Recommended)
// import { openai } from '@ai-sdk/openai';                    // Option B: OpenAI
// import { anthropic } from '@ai-sdk/anthropic';              // Option C: Anthropic
// import { google } from '@ai-sdk/google';                    // Option D: Google

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    // TODO (Exercise 2): For SAP Gen AI Hub, create the provider and wrapper:
    //
    // const { createSAPAI } = await import('@sap/ai-sdk-vercel-adapter');
    // const sapai = createSAPAI();
    //
    // // Wrap SAP provider to satisfy ProviderV3 interface
    // const wrappedProvider: ProviderV3 = {
    //   specificationVersion: 'v3' as const,
    //   languageModel: (modelId: string) => sapai.languageModel(modelId),
    //   embeddingModel: () => { throw new Error('Not supported'); },
    //   imageModel: () => { throw new Error('Not supported'); },
    // };

    const worker = await Worker.create({
      // TODO (Exercise 2): Add the plugins array.
      //
      // For SAP Gen AI Hub:
      // plugins: [
      //   new AiSdkPlugin({ modelProvider: wrappedProvider }),
      // ],
      //
      // For direct providers (OpenAI, Anthropic, Google):
      // plugins: [
      //   new AiSdkPlugin({ modelProvider: openai }),
      // ],
      connection,
      namespace: 'default',
      taskQueue: 'ai-sdk',
      workflowsPath: require.resolve('./ai-workflows'),
      activities,
    });

    console.log('AI Worker started — listening on task queue: ai-sdk');
    console.log('Temporal UI: http://localhost:8233');
    await worker.run();
  } finally {
    await connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});