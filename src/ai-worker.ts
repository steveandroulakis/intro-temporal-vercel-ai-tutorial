import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';

// =============================================================================
// Exercise 2: Configure the AI Worker
//
// TODO: Uncomment the AiSdkPlugin import and your chosen provider below.
// =============================================================================

// TODO: Import AiSdkPlugin
// import { AiSdkPlugin } from '@temporalio/ai-sdk';

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
    // TODO (Exercise 2): Create your provider and add the plugins array.
    //
    // For SAP Gen AI Hub (recommended):
    //   const sapai = createSAPAI();
    //
    //   plugins: [
    //     new AiSdkPlugin({ modelProvider: sapai }),
    //   ],
    //
    // For direct providers (OpenAI, Anthropic, Google):
    //   plugins: [
    //     new AiSdkPlugin({ modelProvider: openai }),
    //   ],

    const worker = await Worker.create({
      // TODO: Add plugins array here (see instructions above)
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