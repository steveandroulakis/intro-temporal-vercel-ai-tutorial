import { Connection, Client } from '@temporalio/client';
import { helloWorld } from './workflows';
import { nanoid } from 'nanoid';

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  const handle = await client.workflow.start(helloWorld, {
    taskQueue: 'hello-world',
    args: ['Temporal'],
    workflowId: 'hello-world-' + nanoid(),
  });

  console.log(`Started workflow ${handle.workflowId}`);
  console.log(`View in Temporal UI: http://localhost:8233/namespaces/default/workflows/${handle.workflowId}`);

  const result = await handle.result();
  console.log(`Result: ${result}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
