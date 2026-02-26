# Exercise 2: Haiku Agent — Durable LLM Calls

In this exercise you'll add the Vercel AI SDK to your Temporal project and make LLM calls automatically durable.

**What you'll build:** A Workflow that calls an LLM to generate haikus, with automatic retries and crash recovery.

**What you'll learn:**
- How `@temporalio/ai-sdk` auto-wraps LLM calls as Activities
- How to configure the `AiSdkPlugin` on the Worker
- The "2-line change" from standard Vercel AI SDK code to durable code

**Prerequisites:**
- Exercise 1 completed
- Temporal dev server running (`temporal server start-dev`)
- LLM provider configured (see [README.md](README.md#llm-provider-setup))

---

## How it works

If you were using the Vercel AI SDK without Temporal, you'd write:

```ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'Temporal',
  system: 'You only respond in haikus.',
});
```

To make this durable with Temporal, you change **two things**:

1. Replace `openai('gpt-4o-mini')` with `temporalProvider.languageModel('gpt-4o-mini')`
2. Add the `AiSdkPlugin` to the Worker

That's it. The plugin intercepts `generateText()` calls and runs them as Temporal Activities behind the scenes. You get automatic retries, timeouts, crash recovery, and full observability — with no changes to the AI SDK's developer experience.

---

## Step 1: Configure the AI Worker

Open `src/ai-worker.ts`. You'll see TODO comments where you need to add three things:

### 1a. Import AiSdkPlugin

Uncomment the AiSdkPlugin import:

```ts
import { AiSdkPlugin } from '@temporalio/ai-sdk';
```

### 1b. Import your provider

Uncomment **one** provider import based on your configuration:

```ts
// Option A: SAP Gen AI Hub (Recommended)
import { createSAPAI } from '@sap/ai-sdk-vercel-adapter';

// Option B: OpenAI
// import { openai } from '@ai-sdk/openai';

// Option C: Anthropic
// import { anthropic } from '@ai-sdk/anthropic';

// Option D: Google
// import { google } from '@ai-sdk/google';
```

### 1c. Create provider instance and add plugins array

For SAP Gen AI Hub, create the provider instance and add the `plugins` array in `Worker.create()`:

```ts
async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    // For SAP Gen AI Hub, create the provider instance
    const sapai = createSAPAI();

    const worker = await Worker.create({
      plugins: [
        new AiSdkPlugin({
          modelProvider: sapai,       // SAP provider instance
        }),
      ],
      connection,
      namespace: 'default',
      taskQueue: 'ai-sdk',
      workflowsPath: require.resolve('./ai-workflows'),
      activities,
    });
    // ...
  }
}
```

For direct providers (OpenAI, Anthropic, Google), it's simpler:

```ts
const worker = await Worker.create({
  plugins: [
    new AiSdkPlugin({
      modelProvider: openai,       // Match your import above
    }),
  ],
  // ...
});
```

The `modelProvider` tells the plugin which LLM provider to use when creating models. The string you pass to `temporalProvider.languageModel()` in workflows (like `'anthropic--claude-4.5-sonnet'`) gets forwarded to this provider.

> [!TIP]
> Only the Worker needs your credentials. The Client process — the one that starts Workflows — has no knowledge of LLM providers or credentials.

<details>
<summary>Complete ai-worker.ts (SAP Gen AI Hub)</summary>

```ts
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { AiSdkPlugin } from '@temporalio/ai-sdk';
import { createSAPAI } from '@sap/ai-sdk-vercel-adapter';

async function run() {
  const connection = await NativeConnection.connect({
    address: 'localhost:7233',
  });

  try {
    const sapai = createSAPAI();

    const worker = await Worker.create({
      plugins: [
        new AiSdkPlugin({
          modelProvider: sapai,
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
```

</details>

---

## Step 2: Implement the Haiku Workflow

Open `src/ai-workflows.ts`. You'll implement the `haikuAgent` function.

### 2a. Uncomment the imports

At the top of the file, uncomment the Exercise 2 imports:

```ts
import '@temporalio/ai-sdk/lib/load-polyfills';
import { generateText } from 'ai';
import { temporalProvider } from '@temporalio/ai-sdk';
```

> [!NOTE]
> The `load-polyfills` import is required for the AI SDK to work inside Temporal's Workflow sandbox. It must be at the top of your Workflow file.

### 2b. Set your model name

Uncomment the `MODEL_NAME` constant that matches your provider:

```ts
const MODEL_NAME = 'anthropic--claude-4.5-sonnet';   // SAP Gen AI Hub (Recommended)
// const MODEL_NAME = 'gpt-4o-mini';                 // OpenAI
// const MODEL_NAME = 'claude-sonnet-4-5-20250929';  // Anthropic
// const MODEL_NAME = 'gemini-2.0-flash';            // Google
```

> [!NOTE]
> SAP Gen AI Hub model names use the format `provider--model-name` (e.g., `anthropic--claude-4.5-sonnet`).
> Direct providers use their native model names (e.g., `gpt-4o-mini`).

### 2c. Implement haikuAgent

Replace the `throw` in `haikuAgent` with:

```ts
export async function haikuAgent(prompt: string): Promise<string> {
  const result = await generateText({
    model: temporalProvider.languageModel(MODEL_NAME),
    prompt,
    system: 'You only respond in haikus.',
  });
  return result.text;
}
```

This is standard Vercel AI SDK code. The only difference from non-Temporal code is `temporalProvider.languageModel()` instead of calling the provider directly (e.g. `openai()`). Behind the scenes, the plugin runs this `generateText()` call as a Temporal Activity.

---

## Step 3: Run it

Make sure your `.env` file is configured with your provider credentials (for SAP Gen AI Hub) or your API key is exported (for direct providers).

### Terminal 2: Start the AI Worker

```bash
npm run start:ai
```

You should see:
```
AI Worker started — listening on task queue: ai-sdk
Using SAP Gen AI Hub via Orchestration
```

### Terminal 3: Run the Haiku Workflow

```bash
npm run workflow:ai:haiku
```

You should see output like:
```
Running haiku workflow...
Started workflow haiku-abc123
View in Temporal UI: http://localhost:8233/namespaces/default/workflows/haiku-abc123

Result:
Code flows like a stream
Durable through every crash
Temporal prevails
```

---

## Step 4: Explore the Temporal UI

Open the Temporal UI link from the output. Look at the event history:

- `WorkflowExecutionStarted` — the Workflow began
- `ActivityTaskScheduled` — the `generateText()` call was scheduled as an Activity
- `ActivityTaskCompleted` — the LLM responded
- `WorkflowExecutionCompleted` — the Workflow returned the haiku

Click on the `ActivityTaskCompleted` event to see the LLM response stored in the event history. If the Worker had crashed after this call completed, Temporal would **not** re-call the LLM — it would replay the stored result from history.

This means:
- No duplicate LLM charges on crash recovery
- The exact same response is returned, even after a crash
- Every LLM call is individually observable and auditable

---

## What you built

| Concept | What you saw |
|---------|-------------|
| **AiSdkPlugin** | Worker plugin that auto-wraps LLM calls as Activities |
| **temporalProvider** | Workflow-side model factory — passes model names to the Worker's configured provider |
| **SAP Gen AI Hub** | Access multiple LLM providers through SAP BTP with OAuth authentication |
| **Auto-wrapped Activity** | `generateText()` call became a Temporal Activity with zero boilerplate |
| **Observability** | LLM call visible in Temporal UI with full input/output |
| **Crash safety** | If Worker crashes after LLM responds, result is replayed — no re-invocation, no double charges |

---

Next: [Exercise 3: Tools Agent](exercise-3-tools-agent.md) — add tool calling to your durable agent.