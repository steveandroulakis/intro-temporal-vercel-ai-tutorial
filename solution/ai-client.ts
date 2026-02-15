import { Connection, Client } from '@temporalio/client';
import { haikuAgent, toolsAgent } from './ai-workflows';
import { nanoid } from 'nanoid';

async function run() {
  const workflow = process.argv[2] ?? 'haiku';
  console.log(`Running ${workflow} workflow...`);

  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  let handle;
  switch (workflow) {
    case 'haiku':
      handle = await client.workflow.start(haikuAgent, {
        taskQueue: 'ai-sdk',
        args: ['Temporal'],
        workflowId: 'haiku-' + nanoid(),
      });
      break;
    case 'tools':
      handle = await client.workflow.start(toolsAgent, {
        taskQueue: 'ai-sdk',
        args: ['What is the weather in Tokyo?'],
        workflowId: 'tools-' + nanoid(),
      });
      break;
    default:
      throw new Error(`Unknown workflow: ${workflow}. Use 'haiku' or 'tools'.`);
  }

  console.log(`Started workflow ${handle.workflowId}`);
  console.log(`View in Temporal UI: http://localhost:8233/namespaces/default/workflows/${handle.workflowId}`);

  const result = await handle.result();
  console.log(`\nResult:\n${result}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
