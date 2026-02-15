# Exercise 1: Hello World

In this exercise you'll run a Temporal Workflow, understand the four components of a Temporal application, and experience crash recovery firsthand.

**What you'll build:** A Workflow that calls an Activity, waits on a durable timer, and survives a process crash.

**What you'll learn:**
- What Workflows, Activities, Workers, and Clients are
- How to run a Temporal application locally
- How `sleep()` survives process death
- How Activity retries work after a crash

---

## The four files

Before running anything, let's understand the four files that make up a Temporal application.

### `src/activities.ts` — Activities

```ts
export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}
```

Activities are where side effects live — HTTP calls, database queries, file I/O, anything non-deterministic. They run in normal Node.js. Temporal handles retries and timeouts for you.

This Activity is simple (just returns a string), but in production it could call an external API, query SAP HANA, or invoke an LLM.

### `src/workflows.ts` — Workflows

```ts
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

const { greet } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function helloWorld(name: string): Promise<string> {
  return await greet(name);
}
```

Workflows are the durable orchestrators. They define the sequence of steps, and Temporal records every step in an event history. If the process crashes, Temporal replays the history to recover the Workflow's exact state.

Key details:
- **`proxyActivities`** creates type-safe proxies that schedule Activities on the Temporal server. You never call Activity functions directly from a Workflow.
- **`startToCloseTimeout`** sets how long an Activity execution can take before Temporal considers it failed.
- Only import **types** from the activities file (`import type * as activities`). Workflows run in a sandboxed environment — they can't import arbitrary Node.js code.

### `src/worker.ts` — Worker

```ts
const worker = await Worker.create({
  connection,
  namespace: 'default',
  taskQueue: 'hello-world',
  workflowsPath: require.resolve('./workflows'),
  activities,
});
```

The Worker is the process that executes your Workflows and Activities. It connects to the Temporal server and polls for work on a specific **Task Queue**. When the server has work, it dispatches it to the Worker.

You can run multiple Workers on the same Task Queue for scalability and fault tolerance.

### `src/client.ts` — Client

```ts
const handle = await client.workflow.start(helloWorld, {
  taskQueue: 'hello-world',
  args: ['Temporal'],
  workflowId: 'hello-world-' + nanoid(),
});
```

The Client tells the Temporal server to start a Workflow. It doesn't execute the Workflow itself — it sends a request to the server, which dispatches the work to a Worker.

The `workflowId` uniquely identifies this Workflow Execution. You can use it to query status, send signals, or retrieve results.

---

## Step 1: Start the Temporal Development Server

Open a terminal and start the dev server:

```bash
temporal server start-dev
```

This starts:
- **Temporal Service** on `localhost:7233` (gRPC)
- **Web UI** on `http://localhost:8233`

Leave this terminal running. Open the Web UI in your browser — you should see zero Workflows running.

---

## Step 2: Start the Worker

Open a second terminal:

```bash
npm start
```

You should see:
```
Worker started — listening on task queue: hello-world
Temporal UI: http://localhost:8233
```

The Worker is now polling the Temporal server for work. It will sit idle until a Workflow is started.

---

## Step 3: Run the Workflow

Open a third terminal:

```bash
npm run workflow
```

You should see output like:
```
Started workflow hello-world-abc123
View in Temporal UI: http://localhost:8233/namespaces/default/workflows/hello-world-abc123
Result: Hello, Temporal!
```

The Client started a Workflow, the server dispatched it to the Worker, the Worker executed the `greet` Activity, and the result came back.

---

## Step 4: Explore the Temporal UI

Open the Temporal UI link from the output. Click into the Workflow and explore:

- **Summary** — Workflow ID, status, timing
- **Event History** — every step recorded: `WorkflowExecutionStarted`, `ActivityTaskScheduled`, `ActivityTaskCompleted`, `WorkflowExecutionCompleted`
- **Input/Output** — click any event to see the data that flowed through

This event history is the foundation of Temporal's durability. On a crash, Temporal replays these events to restore the Workflow's exact state.

---

## Step 5: Modify the Activity

Change the greeting in `src/activities.ts`:

```ts
export async function greet(name: string): Promise<string> {
  return `Hey there, ${name}! Welcome to Temporal.`;
}
```

Run the workflow again (no need to restart the Worker — `ts-node` picks up changes):

```bash
npm run workflow
```

You should see the updated greeting. Check the Temporal UI — a new Workflow Execution appears with the new result.

---

## Step 6: Add a durable timer

Now let's make the Workflow more interesting. Add a `sleep()` call to `src/workflows.ts`:

```ts
import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

const { greet } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function helloWorld(name: string): Promise<string> {
  const greeting = await greet(name);
  console.log(greeting);

  await sleep('10s');

  return greeting;
}
```

Run the workflow:

```bash
npm run workflow
```

Watch the Temporal UI — you'll see a `TimerStarted` event. The Workflow pauses for 10 seconds, then completes.

> [!IMPORTANT]
> `sleep()` from `@temporalio/workflow` is **not** `setTimeout`. It's a durable timer managed by the Temporal server. If the Worker process dies during the sleep, the timer keeps ticking on the server. When a Worker reconnects, the Workflow resumes right where it left off.

---

## Step 7: Add a second Activity

Add a `goodbye` Activity to `src/activities.ts`:

```ts
export async function greet(name: string): Promise<string> {
  return `Hey there, ${name}! Welcome to Temporal.`;
}

export async function goodbye(name: string): Promise<string> {
  return `Goodbye, ${name}!`;
}
```

Now update `src/workflows.ts` to call both Activities with the timer between them:

```ts
import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from './activities';

const { greet, goodbye } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function helloWorld(name: string): Promise<string> {
  const greeting = await greet(name);
  console.log(greeting);

  await sleep('10s');

  const farewell = await goodbye(name);
  return `${greeting} ... ${farewell}`;
}
```

Run it to verify everything works:

```bash
npm run workflow
```

Expected output: `Hey there, Temporal! Welcome to Temporal. ... Goodbye, Temporal!`

---

## Step 8: Crash and recovery demo

Now for the key moment. Let's break `goodbye`, crash the Worker, fix the code, and watch Temporal recover.

### 8a. Make `goodbye` throw an error

Edit `src/activities.ts` — add a `throw` to the `goodbye` Activity:

```ts
export async function goodbye(name: string): Promise<string> {
  throw new Error('Something went wrong!');
  return `Goodbye, ${name}!`;
}
```

### 8b. Restart the Worker (pick up code changes)

In your Worker terminal, press `Ctrl+C` to stop it, then restart:

```bash
npm start
```

### 8c. Start a Workflow

```bash
npm run workflow
```

Now watch what happens:

1. **`greet` succeeds** — you see the greeting logged in the Worker terminal
2. **Timer ticks** — 10 seconds pass
3. **`goodbye` fails** — throws the error
4. **Temporal retries** — you'll see retry attempts in the Worker terminal, with increasing delays between them (exponential backoff)

Open the **Temporal UI** and look at the Workflow. You'll see:
- `ActivityTaskScheduled` for `goodbye`
- Multiple `ActivityTaskStarted` events (retries)
- Each retry attempt logged with the error

The Client terminal is still waiting — the Workflow hasn't completed or failed yet. Temporal keeps retrying.

### 8d. Kill the Worker

While `goodbye` is retrying, **kill the Worker process** (`Ctrl+C` in the Worker terminal).

Check the Temporal UI — the Workflow is still **Running**. The timer and completed `greet` Activity are all preserved in the event history. The Workflow is patiently waiting for a Worker to pick it up.

### 8e. Fix the error

Edit `src/activities.ts` — remove the `throw`:

```ts
export async function goodbye(name: string): Promise<string> {
  return `Goodbye, ${name}!`;
}
```

### 8f. Restart the Worker

```bash
npm start
```

Watch what happens:

1. The Worker picks up the Workflow from where it left off
2. **`greet` is NOT re-executed** — Temporal replays it from the event history
3. **The timer is NOT re-waited** — it already completed, so Temporal skips it
4. **`goodbye` now succeeds** — the fixed code runs
5. The Workflow completes with the full result

Check the Client terminal — it receives the result.

> [!NOTE]
> This is Temporal's core value proposition: **your code crashed, you fixed a bug, restarted the process, and the Workflow resumed from exactly where it left off.** No progress was lost. No steps were repeated. The event history is the source of truth.

---

## What you built

| Concept | What you saw |
|---------|-------------|
| **Workflow** | Durable function that orchestrates Activities and survives crashes |
| **Activity** | Side-effect function (I/O, API calls) with automatic retries |
| **Worker** | Process that executes Workflows and Activities |
| **Client** | Process that starts Workflows and retrieves results |
| **Durable timer** | `sleep()` that persists on the Temporal server, not in process memory |
| **Event history** | Every step recorded — the basis for replay and recovery |
| **Crash recovery** | Worker dies → restart → Workflow replays and resumes |
| **Activity retries** | Failed Activities automatically retried with exponential backoff |

---

Next: [Exercise 2: Haiku Agent](exercise-2-haiku-agent.md) — make LLM calls durable with the Vercel AI SDK.
