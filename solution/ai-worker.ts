import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { AiSdkPlugin } from '@temporalio/ai-sdk';

// Alternative providers (uncomment ONE if not using SAP Gen AI Hub):
// import { openai } from '@ai-sdk/openai';
// import { anthropic } from '@ai-sdk/anthropic';
// import { google } from '@ai-sdk/google';

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    // Dynamic import for SAP Gen AI Hub (ESM module)
    const { createSAPAI } = await import('@sap/ai-sdk-vercel-adapter');
    
    // Create SAP Gen AI Hub provider (reads config from environment variables)
    // This implements ProviderV3 directly - no wrapper needed!
    const sapai = createSAPAI();

    const worker = await Worker.create({
      plugins: [
        new AiSdkPlugin({
          modelProvider: sapai,  // SAP provider works directly!
        }),
      ],
      // For alternative providers (OpenAI, Anthropic, Google), use:
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