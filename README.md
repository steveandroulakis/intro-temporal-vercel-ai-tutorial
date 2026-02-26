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
- **An LLM API key** (SAP Gen AI Hub recommended, or OpenAI/Anthropic/Google)

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
cd intro-temporal-vercel-ai-tutorial
npm install
```

## LLM Provider Setup

These exercises use the **Vercel AI SDK** with provider adapters. You need credentials for **one** of the following providers.

### Option A: SAP Gen AI Hub (Recommended)

SAP Gen AI Hub provides access to multiple LLM providers (Anthropic Claude, OpenAI GPT, Google Gemini) through a unified SAP BTP interface with enterprise-grade security and governance.

1. Get your SAP AI Core service key from BTP cockpit
2. Create a `.env` file with your credentials:

```bash
# Option A1: Service Key as Base64 (simplest)
AICORE_SERVICE_KEY_BASE64=eyJjbGllbnRpZCI6...

# Option A2: Individual credentials
AICORE_CLIENT_ID=your-client-id
AICORE_CLIENT_SECRET=your-client-secret
AICORE_AUTH_URL=https://your-tenant.authentication.sap.hana.ondemand.com/oauth/token
AICORE_BASE_URL=https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com
AICORE_RESOURCE_GROUP=default

# Required: Orchestration deployment ID
ORCHESTRATION_DEPLOYMENT_ID=your-deployment-id
```

In the exercise code, you'll uncomment:
```ts
import { createSAPAI } from '@sap/ai-sdk-vercel-adapter';
const sapai = createSAPAI();
```

Model name: `anthropic--claude-4.5-sonnet` (or `gpt-5`, `gemini-2.5-pro`)

### Option B: OpenAI

```bash
export OPENAI_API_KEY=sk-...
```

In the exercise code, you'll uncomment:
```ts
import { openai } from '@ai-sdk/openai';
```
Model name: `gpt-4o-mini`

### Option C: Anthropic

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

In the exercise code, you'll uncomment:
```ts
import { anthropic } from '@ai-sdk/anthropic';
```
Model name: `claude-sonnet-4-5-20250929`

### Option D: Google

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
solution/               # Complete solutions for reference
├── ai-worker.ts        # Completed AI worker (SAP Gen AI Hub)
├── ai-workflows.ts     # Completed AI workflows
└── activities.ts       # Completed activities
```

## npm scripts

| Script | What it does |
|--------|-------------|
| `npm start` | Start the Hello World worker |
| `npm run workflow` | Run the Hello World workflow |
| `npm run start:ai` | Start the AI worker (Exercises 2 & 3) |
| `npm run workflow:ai:haiku` | Run the Haiku Agent workflow |
| `npm run workflow:ai:tools` | Run the Tools Agent workflow |

## SAP Gen AI Hub Integration

This workshop includes the `@sap/ai-sdk-vercel-adapter` which provides:

- **LanguageModelV3 Interface**: Full Vercel AI SDK 6.x compatibility
- **Multi-Provider Support**: Access Anthropic Claude, OpenAI GPT, Google Gemini via SAP Gen AI Hub
- **Tool Calling**: Native function calling via SAP Orchestration
- **Streaming**: Full SSE streaming support
- **OAuth 2.0**: Native SAP BTP authentication with automatic token refresh

The adapter connects the Vercel AI SDK to SAP's Gen AI Hub Orchestration service:

```
Temporal Workflow → Vercel AI SDK → SAP Adapter → SAP Orchestration → Gen AI Hub → LLM
```

## Start here

Begin with [Exercise 1: Hello World](exercise-1-hello-world.md).