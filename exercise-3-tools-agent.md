# Exercise 3: Tools Agent — Durable Agent with Tool Calling

In this exercise you'll build an AI agent that can call tools (functions) to answer questions. Each step — LLM reasoning and tool execution — is a durable Temporal Activity.

**What you'll build:** An agent that uses `generateText()` with tools to answer questions about the weather, with full crash recovery across the agent loop.

**What you'll learn:**
- How to define tools using the Vercel AI SDK's `tool()` function
- How tool calls map to Temporal Activities
- How the multi-step agent loop (LLM → tool → LLM → respond) is fully durable
- How `stopWhen: stepCountIs()` caps agent iterations

**Prerequisites:**
- Exercise 2 completed (AI Worker configured and running)
- Temporal dev server running

---

## How the agent loop works

When you give an LLM tools, it can decide to call them during its reasoning. Here's the flow:

```
     User Question
          │
          ▼
    ┌───────────┐
    │    LLM    │  "I need to look up the weather in Tokyo"
    └─────┬─────┘
          │ tool call: getWeather({ location: "Tokyo" })
          ▼
    ┌───────────┐
    │  Activity │  Execute getWeather — returns weather data
    └─────┬─────┘
          │ result: { city: "Tokyo", temperatureRange: "14-20C", ... }
          ▼
    ┌───────────┐
    │    LLM    │  "The weather in Tokyo is 14-20°C and sunny."
    └───────────┘
          │
          ▼
     Final Answer
```

Each box is a separate Temporal Activity. If the Worker crashes at any point:
- Completed steps are **not** re-executed (replayed from history)
- The agent resumes from the exact step where it stopped
- No duplicate LLM calls, no duplicate tool executions

---

## Step 1: Implement the getWeather Activity

Open `src/activities.ts`. Below the existing `greet` function, add the `getWeather` Activity:

```ts
export async function getWeather(input: {
  location: string;
}): Promise<{ city: string; temperatureRange: string; conditions: string }> {
  return {
    city: input.location,
    temperatureRange: '14-20C',
    conditions: 'Sunny with wind.',
  };
}
```

This returns hardcoded data for simplicity. In production, this would call a real weather API. Because it's a Temporal Activity, it would automatically get retries, timeouts, and observability — even for flaky external APIs.

---

## Step 2: Implement the Tools Agent Workflow

Open `src/ai-workflows.ts`.

### 2a. Uncomment the Exercise 3 imports

```ts
import { proxyActivities } from '@temporalio/workflow';
import { tool, stepCountIs } from 'ai';
import { z } from 'zod';
import type * as activities from './activities';
```

> [!NOTE]
> Make sure the Exercise 2 imports are also uncommented (`generateText`, `temporalProvider`, `load-polyfills`). Exercise 3 builds on Exercise 2.
> Also ensure your `MODEL_NAME` is set correctly (e.g., `'anthropic--claude-4.5-sonnet'` for SAP Gen AI Hub).

### 2b. Implement toolsAgent

Replace the `throw` in `toolsAgent` with the full implementation. There are three parts: proxy the Activity, define the tool, and call `generateText`.

```ts
export async function toolsAgent(question: string): Promise<string> {
  // 1. Create a proxy to call the getWeather Activity
  const { getWeather } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
  });

  // 2. Call generateText with tools
  const result = await generateText({
    model: temporalProvider.languageModel(MODEL_NAME),
    prompt: question,
    system: 'You are a helpful agent.',
    tools: {
      getWeather: tool({
        description: 'Get the weather for a given city',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: getWeather,
      }),
    },
    stopWhen: stepCountIs(5),
  });

  // 3. Return the final text
  return result.text;
}
```

Let's break down what's happening:

**`proxyActivities`** — Same pattern as Exercise 1. Creates a type-safe proxy for the `getWeather` Activity. When the LLM calls this tool, Temporal executes it as a retryable, observable Activity.

**`tool()`** — Vercel AI SDK function that defines a tool for the LLM:
- `description` — tells the LLM what the tool does (so it knows when to use it)
- `inputSchema` — Zod schema defining the tool's input (the LLM generates valid JSON matching this schema)
- `execute` — the function to run when the LLM calls the tool (our proxied Activity)

**`stopWhen: stepCountIs(5)`** — Safety cap on the agent loop. Prevents runaway agents from looping forever. Each "step" is one LLM call (including tool calls). After 5 steps, `generateText` returns whatever it has.

> [!IMPORTANT]
> The `execute` function of a tool runs in the **Workflow context**. This means it must follow Workflow rules: no direct I/O, no non-deterministic operations. That's why we use `proxyActivities` — the actual HTTP call (or whatever I/O the Activity does) runs outside the Workflow sandbox, with Temporal managing retries and timeouts.

---

## Step 3: Run it

### Restart the AI Worker (to pick up the new Activity)

In your Worker terminal, press `Ctrl+C` and restart:

```bash
npm run start:ai
```

### Run the Tools Agent

```bash
npm run workflow:ai:tools
```

You should see output like:

```
Running tools workflow...
Started workflow tools-abc123
View in Temporal UI: http://localhost:8233/namespaces/default/workflows/tools-abc123

Result:
The weather in Tokyo is 14-20°C and sunny with wind.
```

---

## Step 4: Explore the Temporal UI

Open the Workflow in the Temporal UI. The event history shows the full agent loop:

1. **ActivityTaskCompleted** — First `generateText` call. The LLM decided to call the `getWeather` tool.
2. **ActivityTaskCompleted** — `getWeather` Activity executed, returned weather data.
3. **ActivityTaskCompleted** — Second `generateText` call. The LLM processed the weather data and generated the final answer.

Each step has full input/output visible. You can see exactly:
- What the LLM was asked
- That it decided to call `getWeather`
- What arguments it passed to the tool
- What the tool returned
- How the LLM incorporated the result into its final answer

This level of observability is automatic — you didn't write any logging code.

---

## Step 5: Crash and recovery demo

Let's prove that the multi-step agent loop survives a crash.

### 5a. Start a Tools Agent Workflow

```bash
npm run workflow:ai:tools
```

### 5b. Kill the Worker

As soon as you see "Started workflow" in the Client terminal, quickly kill the Worker (`Ctrl+C` in the Worker terminal).

Depending on timing, the Workflow may have completed the first LLM call, or it may be mid-call.

### 5c. Check the Temporal UI

Open the Workflow — its status is still **Running**. The event history shows which steps completed before the crash. Any completed LLM calls and tool executions are preserved.

### 5d. Restart the Worker

```bash
npm run start:ai
```

Watch what happens:

- **Completed steps are replayed** — Temporal skips them (no re-execution, no duplicate LLM calls)
- **The Workflow resumes from the crash point** — picks up at the next uncompleted step
- **The agent completes** — final answer appears in the Client terminal

No LLM calls were wasted. No tool executions were repeated. The agent recovered perfectly.

---

## What you built

| Concept | What you saw |
|---------|-------------|
| **Tool definition** | `tool()` with Zod schema — LLM knows when and how to call it |
| **Tool as Activity** | `proxyActivities` + `execute` — tool calls are retryable Temporal Activities |
| **Agent loop** | LLM → tool → LLM → respond — multi-step reasoning, each step durable |
| **`stopWhen`** | Safety cap on agent iterations — prevents runaway loops |
| **Full observability** | Every LLM call and tool call visible in Temporal UI with inputs/outputs |
| **Crash recovery** | Worker crash mid-agent-loop → restart → completed steps replayed, agent resumes |

---

## Summary

Across these three exercises, you've seen the core pattern:

1. **Exercise 1** — Temporal basics: Workflows orchestrate Activities, `sleep()` is durable, crashes are recoverable
2. **Exercise 2** — The AI SDK plugin auto-wraps `generateText()` as Activities — 2-line change from standard Vercel AI SDK code
3. **Exercise 3** — Tool calls are Activities too — the entire agent reasoning loop is durable and observable

The same patterns scale to production AI agents: multi-step research pipelines, tool-calling agents with external APIs, long-running workflows that wait for human input, and multi-agent orchestration. Every step is checkpointed, retryable, and observable.

<details>
<summary>Complete solution: ai-workflows.ts</summary>

```ts
import '@temporalio/ai-sdk/lib/load-polyfills';
import { generateText, stepCountIs, tool } from 'ai';
import { temporalProvider } from '@temporalio/ai-sdk';
import { proxyActivities } from '@temporalio/workflow';
import { z } from 'zod';
import type * as activities from './activities';

const MODEL_NAME = 'anthropic--claude-4.5-sonnet';   // SAP Gen AI Hub (Recommended)
// const MODEL_NAME = 'gpt-4o-mini';                 // OpenAI
// const MODEL_NAME = 'claude-sonnet-4-5-20250929';  // Anthropic
// const MODEL_NAME = 'gemini-2.0-flash';            // Google

export async function haikuAgent(prompt: string): Promise<string> {
  const result = await generateText({
    model: temporalProvider.languageModel(MODEL_NAME),
    prompt,
    system: 'You only respond in haikus.',
  });
  return result.text;
}

export async function toolsAgent(question: string): Promise<string> {
  const { getWeather } = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
  });

  const result = await generateText({
    model: temporalProvider.languageModel(MODEL_NAME),
    prompt: question,
    system: 'You are a helpful agent.',
    tools: {
      getWeather: tool({
        description: 'Get the weather for a given city',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: getWeather,
      }),
    },
    stopWhen: stepCountIs(5),
  });
  return result.text;
}
```

</details>

<details>
<summary>Complete solution: activities.ts (with getWeather)</summary>

```ts
export async function greet(name: string): Promise<string> {
  return `Hello, ${name}!`;
}

export async function goodbye(name: string): Promise<string> {
  return `Goodbye, ${name}!`;
}

export async function getWeather(input: {
  location: string;
}): Promise<{ city: string; temperatureRange: string; conditions: string }> {
  return {
    city: input.location,
    temperatureRange: '14-20C',
    conditions: 'Sunny with wind.',
  };
}
```

</details>
