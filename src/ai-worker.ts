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
// import { openai } from '@ai-sdk/openai';          // Option A: OpenAI
// import { anthropic } from '@ai-sdk/anthropic';     // Option B: Anthropic
// import { google } from '@ai-sdk/google';           // Option C: Google

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    const worker = await Worker.create({
      // TODO (Exercise 2): Add the plugins array. Uncomment and set your provider:
      // plugins: [
      //   new AiSdkPlugin({
      //     modelProvider: openai,       // Match your import above
      //   }),
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
