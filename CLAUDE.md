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

**Primary: SAP Gen AI Hub** via `@sap/ai-sdk-vercel-adapter` — provides access to Anthropic Claude, OpenAI GPT, and Google Gemini through SAP BTP with OAuth authentication.

**Alternative providers**: Direct Vercel AI SDK adapters — `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`.

Participants uncomment their chosen provider in `ai-worker.ts` and set `MODEL_NAME` in `ai-workflows.ts`.

### SAP Gen AI Hub Configuration

Environment variables (in `.env`):
- `AICORE_SERVICE_KEY_BASE64` (or individual `AICORE_*` credentials)
- `ORCHESTRATION_DEPLOYMENT_ID`

Model names use format `provider--model-name` (e.g., `anthropic--claude-4.5-sonnet`).

## Key Files

| File | Purpose |
|------|---------|
| `src/activities.ts` | `greet()` complete, `getWeather()` TODO for Exercise 3 |
| `src/workflows.ts` | `helloWorld()` complete — participants modify in Exercise 1 |
| `src/ai-workflows.ts` | `haikuAgent()` + `toolsAgent()` stubs with TODO instructions |
| `src/ai-worker.ts` | Worker with commented-out `AiSdkPlugin` config (SAP as Option A) |
| `src/ai-client.ts` | Client routing to haiku/tools via CLI arg (complete) |
| `.env.example` | Environment variable template for all providers |
| `sap-ai-sdk-vercel-adapter-0.2.0.tgz` | SAP Gen AI Hub Vercel adapter V3 |

## SAP Adapter Integration

The `@sap/ai-sdk-vercel-adapter` is included as a local tarball and provides:
- LanguageModelV3 interface (Vercel AI SDK 6.x compatible)
- Multi-provider support via SAP Orchestration
- Tool calling support
- OAuth 2.0 authentication with automatic token refresh

## Lesson Format

GitHub-flavored markdown. `> [!NOTE]` / `> [!TIP]` callouts. Collapsible `<details>` blocks for complete solutions. Step-by-step with code blocks. Writing style follows [temporal-learning deep-research tutorial](https://github.com/temporalio/temporal-learning/tree/main/docs/tutorials/ai/deep-research).

## This is a git submodule

This directory is a separate repo ([steveandroulakis/intro-temporal-vercel-ai-tutorial](https://github.com/steveandroulakis/intro-temporal-vercel-ai-tutorial)) added as a submodule to the SAP-workshop repo. Commits here must be pushed separately.