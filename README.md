# Intro to Temporal + Vercel AI SDK

Build durable AI agents with [Temporal](https://temporal.io) and the [Vercel AI SDK](https://ai-sdk.dev/).
Three exercises take you from zero to running a crash-recoverable AI agent with tool calling.

## What you'll learn

| Exercise | Topic | Time |
|----------|-------|------|
| [Exercise 1: Hello World](exercise-1-hello-world.md) | Temporal basics — Workflows, Activities, Workers, crash recovery | ~25 min |
| [Exercise 2: Haiku Agent](exercise-2-haiku-agent.md) | Durable LLM calls via `@temporalio/ai-sdk` plugin | ~15 min |
| [Exercise 3: Tools Agent](exercise-3-tools-agent.md) | Durable agent with tool calling, crash demo | ~15 min |

## Prerequisites

- **Node.js 18+** (v22.x recommended)
- **Temporal CLI** installed
- **An LLM API key** (OpenAI, Anthropic, or Google — pick one)

### Install Temporal CLI

```bash
# macOS
brew install temporal

# Linux — download from https://temporal.download/cli/archive/latest?platform=linux&arch=amd64
# Extract and add `temporal` to PATH
```

Verify it's installed:

```bash
temporal --version
```

### Install project dependencies

```bash
cd intro-temporal-vercel-tutorial
npm install
```

## LLM Provider Setup

These exercises use the **Vercel AI SDK** with provider adapters. You need an API key for **one** of the following providers.

### Option A: OpenAI

```bash
export OPENAI_API_KEY=sk-...
```

In the exercise code, you'll uncomment:
```ts
import { openai } from '@ai-sdk/openai';
```
Model name: `gpt-4o-mini`

### Option B: Anthropic

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

In the exercise code, you'll uncomment:
```ts
import { anthropic } from '@ai-sdk/anthropic';
```
Model name: `claude-sonnet-4-5-20250929`

### Option C: Google

```bash
export GOOGLE_GENERATIVE_AI_API_KEY=...
```

In the exercise code, you'll uncomment:
```ts
import { google } from '@ai-sdk/google';
```
Model name: `gemini-2.0-flash`

> [!TIP]
> You only need provider credentials on the **Worker** process (the process that executes your code).
> The Client — the process that sends requests to Temporal — doesn't need API keys at all.

## Project structure

```
src/
├── activities.ts       # Activity definitions (side effects, I/O)
├── workflows.ts        # Workflow definition (durable orchestration)
├── worker.ts           # Worker process for Exercise 1
├── client.ts           # Client for Exercise 1
├── ai-workflows.ts     # AI workflow definitions (Exercises 2 & 3)
├── ai-worker.ts        # AI worker with AiSdkPlugin (Exercises 2 & 3)
└── ai-client.ts        # Client for AI workflows (Exercises 2 & 3)
```

## npm scripts

| Script | What it does |
|--------|-------------|
| `npm start` | Start the Hello World worker |
| `npm run workflow` | Run the Hello World workflow |
| `npm run start:ai` | Start the AI worker (Exercises 2 & 3) |
| `npm run workflow:ai:haiku` | Run the Haiku Agent workflow |
| `npm run workflow:ai:tools` | Run the Tools Agent workflow |

## Start here

Begin with [Exercise 1: Hello World](exercise-1-hello-world.md).
