import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { AiSdkPlugin } from '@temporalio/ai-sdk';

// Choose ONE provider — match your API key:
import { openai } from '@ai-sdk/openai';          // Option A: OpenAI
// import { anthropic } from '@ai-sdk/anthropic';  // Option B: Anthropic
// import { google } from '@ai-sdk/google';        // Option C: Google

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    const worker = await Worker.create({
      plugins: [
        new AiSdkPlugin({
          modelProvider: openai,       // Match your import above
        }),
      ],
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
