import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { AiSdkPlugin } from '@temporalio/ai-sdk';
import type { ProviderV3 } from '@ai-sdk/provider';

// Alternative providers (uncomment ONE if not using SAP Gen AI Hub):
// import { openai } from '@ai-sdk/openai';
// import { anthropic } from '@ai-sdk/anthropic';
// import { google } from '@ai-sdk/google';

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    // Dynamic import for ESM module
    const { createSAPAI } = await import('@sap/ai-sdk-vercel-adapter');
    
    // Create SAP Gen AI Hub provider (reads config from environment variables)
    const sapai = createSAPAI();

    // Wrap SAP provider to satisfy ProviderV3 interface
    // Temporal AI SDK only uses languageModel, but the type requires all methods
    const wrappedProvider: ProviderV3 = {
      specificationVersion: 'v3' as const,
      languageModel: (modelId: string) => sapai.languageModel(modelId),
      embeddingModel: () => { throw new Error('Embedding model not supported via SAP Gen AI Hub'); },
      imageModel: () => { throw new Error('Image model not supported via SAP Gen AI Hub'); },
    };

    const worker = await Worker.create({
      plugins: [
        new AiSdkPlugin({
          modelProvider: wrappedProvider,
        }),
      ],
      // For alternative providers (OpenAI, Anthropic, Google), use:
      // plugins: [
      //   new AiSdkPlugin({
      //     modelProvider: openai,  // or anthropic, or google
      //   }),
      // ],
      connection,
      namespace: 'default',
      taskQueue: 'ai-sdk',
      workflowsPath: require.resolve('./ai-workflows'),
      activities,
    });

    console.log('AI Worker started — listening on task queue: ai-sdk');
    console.log('Using SAP Gen AI Hub via Orchestration');
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