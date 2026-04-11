# Tools

Tools are functions that Claude can call during the agent loop. There are two types: custom tools (executed locally) and server tools (executed by Anthropic).

## Available tools

### web_search (server tool)
Search the web for current information. Executed server-side by Anthropic — no local handling needed.

```
Max uses per request: 5
```

### read_data (custom tool)
Read a file from `user/memory/`.

```typescript
input:  { path: string }  // e.g. "memory/fitness/workouts.md"
output: string             // file contents or "(empty)"
```

### write_data (custom tool)
Write or append content to a file under `user/memory/`.

```typescript
input:  { path: string, content: string, mode: "overwrite" | "append" }
output: string  // success message or error
```

Path is validated — writes outside `user/memory/` are blocked.

## Adding a new tool

1. Add logic to `src/tools/data.ts` (or create a new file)
2. Add tool definition in `src/tools/index.ts` (name, description, input schema)
3. Add case to `executeTool()` switch in `src/tools/index.ts`

Claude will see the new tool on next restart.

## Tool execution flow

```
Custom tool:
  Claude returns stop_reason: "tool_use"
  → agent.ts calls executeTool(name, input)
  → tool returns result string
  → result sent back as tool_result message
  → Claude continues loop

Server tool (web_search):
  Claude returns stop_reason with server_tool_use
  → executed by Anthropic automatically
  → results included in next response
  → no local handling needed
```
