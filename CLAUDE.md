# Intro to Temporal + Vercel AI SDK Tutorial

Participant-facing exercises for Hour 2 of the SAP x Temporal workshop. Three exercises escalating from Temporal basics to durable AI agents with tool calling.

## Exercises

1. **Exercise 1: Hello World** (`exercise-1-hello-world.md`) — run a Workflow + Activity, add timer + second activity, crash + recovery demo
2. **Exercise 2: Haiku Agent** (`exercise-2-haiku-agent.md`) — fill in TODOs to configure `AiSdkPlugin` and implement `haikuAgent` with `generateText()`
3. **Exercise 3: Tools Agent** (`exercise-3-tools-agent.md`) — fill in TODOs to add `getWeather` activity and `toolsAgent` with tool calling, crash demo

## Code Structure

- `src/` — starter code. Exercise 1 files complete; AI files (`ai-*.ts`) have TODOs
- `solution/` — complete solutions for all exercises
- Separate workers/task queues: `worker.ts` (task queue `hello-world`) and `ai-worker.ts` (task queue `ai-sdk`)

## LLM Provider

Uses Vercel AI SDK provider adapters directly — `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`. Participants uncomment their chosen provider in `ai-worker.ts` and set `MODEL_NAME` in `ai-workflows.ts`. No proxy or Python needed.

## Key Files

| File | Purpose |
|------|---------|
| `src/activities.ts` | `greet()` complete, `getWeather()` TODO for Exercise 3 |
| `src/workflows.ts` | `helloWorld()` complete — participants modify in Exercise 1 |
| `src/ai-workflows.ts` | `haikuAgent()` + `toolsAgent()` stubs with TODO instructions |
| `src/ai-worker.ts` | Worker with commented-out `AiSdkPlugin` config |
| `src/ai-client.ts` | Client routing to haiku/tools via CLI arg (complete) |

## Lesson Format

GitHub-flavored markdown. `> [!NOTE]` / `> [!TIP]` callouts. Collapsible `<details>` blocks for complete solutions. Step-by-step with code blocks. Writing style follows [temporal-learning deep-research tutorial](https://github.com/temporalio/temporal-learning/tree/main/docs/tutorials/ai/deep-research).

## This is a git submodule

This directory is a separate repo ([steveandroulakis/intro-temporal-vercel-ai-tutorial](https://github.com/steveandroulakis/intro-temporal-vercel-ai-tutorial)) added as a submodule to the SAP-workshop repo. Commits here must be pushed separately.
