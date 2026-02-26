# Intro to Temporal + Vercel AI SDK Tutorial

Participant-facing exercises for Hour 2 of the SAP x Temporal workshop. Three exercises escalating from Temporal basics to durable AI agents with tool calling.

## Exercises

1. **Exercise 1: Hello World** (`exercise-1-hello-world.md`) — run a Workflow + Activity, add timer + second activity, crash + recovery demo
2. **Exercise 2: Haiku Agent** (`exercise-2-haiku-agent.md`) — fill in TODOs to configure `AiSdkPlugin` and implement `haikuAgent` with `generateText()`
3. **Exercise 3: Tools Agent** (`exercise-3-tools-agent.md`) — fill in TODOs to add `getWeather` activity and `toolsAgent` with tool calling, crash demo

## Code Structure

- `src/` — starter code. Exercise 1 files complete; AI files (`ai-*.ts`) have TODOs
- `solution/` — complete solutions for all exercises (using SAP Gen AI Hub)
- Separate workers/task queues: `worker.ts` (task queue `hello-world`) and `ai-worker.ts` (task queue `ai-sdk`)

## LLM Provider

**Primary: SAP Gen AI Hub** via `@sap/ai-sdk-vercel-adapter` (v0.3.0) — provides access to Anthropic Claude, OpenAI GPT, and Google Gemini through SAP BTP with OAuth authentication. The adapter implements the full Vercel AI SDK `ProviderV3` interface for seamless integration.

**Alternative providers**: Direct Vercel AI SDK adapters — `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`.

Participants uncomment their chosen provider in `ai-worker.ts` and set `MODEL_NAME` in `ai-workflows.ts`.

### SAP Gen AI Hub Configuration

Environment variables (in `.env`):
- `AICORE_SERVICE_KEY_BASE64` (or individual `AICORE_*` credentials)
- `ORCHESTRATION_DEPLOYMENT_ID` (required for language models)
- `EMBEDDING_DEPLOYMENT_ID` (optional, for embedding models)

Model names use format `provider--model-name` (e.g., `anthropic--claude-4.5-sonnet`).

## Key Files

| File | Purpose |
|------|---------|
| `src/activities.ts` | `greet()` complete, `getWeather()` TODO for Exercise 3 |
| `src/workflows.ts` | `helloWorld()` complete — participants modify in Exercise 1 |
| `src/worker.ts` | Exercise 1 worker (task queue `hello-world`) |
| `src/client.ts` | Exercise 1 client |
| `src/ai-workflows.ts` | `haikuAgent()` + `toolsAgent()` stubs with TODO instructions |
| `src/ai-worker.ts` | AI Worker with commented-out `AiSdkPlugin` config (SAP as Option A) |
| `src/ai-client.ts` | Client routing to haiku/tools via CLI arg (complete) |
| `solution/` | Complete solutions for all AI exercises |
| `.env.example` | Environment variable template for all providers |
| `sap-ai-sdk-vercel-adapter-0.3.0.tgz` | SAP Gen AI Hub Vercel adapter (ProviderV3) |

## SAP Adapter Integration

The `@sap/ai-sdk-vercel-adapter` (v0.3.0) is included as a local tarball and provides:
- **ProviderV3 interface** — works directly with Temporal's `AiSdkPlugin` (no wrapper needed)
- **LanguageModelV3** — for chat/completion via SAP Orchestration
- **EmbeddingModelV3** — for embeddings via Azure OpenAI
- Multi-provider support via SAP Orchestration (Claude, GPT, Gemini)
- Tool calling support
- OAuth 2.0 authentication with automatic token refresh

Usage in Worker:
```ts
import { createSAPAI } from '@sap/ai-sdk-vercel-adapter';

const sapai = createSAPAI();  // Reads config from environment
const worker = await Worker.create({
  plugins: [
    new AiSdkPlugin({ modelProvider: sapai }),  // Works directly!
  ],
  // ...
});
```

## Lesson Format

GitHub-flavored markdown. `> [!NOTE]` / `> [!TIP]` callouts. Collapsible `<details>` blocks for complete solutions. Step-by-step with code blocks. Writing style follows [temporal-learning deep-research tutorial](https://github.com/temporalio/temporal-learning/tree/main/docs/tutorials/ai/deep-research).

## This is a git submodule

This directory is a separate repo ([steveandroulakis/intro-temporal-vercel-ai-tutorial](https://github.com/steveandroulakis/intro-temporal-vercel-ai-tutorial)) added as a submodule to the SAP-workshop repo. Commits here must be pushed separately.