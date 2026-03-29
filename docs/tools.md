# Tools

Tools are TypeScript functions that Claude can call during the agent loop. Each tool has a name, description, and input schema. Claude decides which tools to use based on the user's request.

## Available tools

### web_search
Search the web for current information.

```typescript
input:  { query: string }
output: { results: { title, url, snippet }[] }
```

Use cases: pharmacy hours, restaurant info, current prices, news.

### get_calendar_events
Read events from Google Calendar.

```typescript
input:  { date_range: string }  // e.g. "today", "this week", "2026-03-28"
output: { events: { title, start, end, location }[] }
```

### create_calendar_event
Create a new event in Google Calendar.

```typescript
input:  { title: string, datetime: string, duration_min: number, location?: string }
output: { event_id: string, url: string }
```

### make_phone_call
Make an outbound call via Vapi. Returns transcript when call ends.

```typescript
input:  { phone: string, goal: string }
output: { transcript: string, success: boolean, summary: string }
```

### log_workout
Save a workout session to the fitness log.

```typescript
input:  { exercises: { name, sets, reps, weight }[], notes?: string }
output: { saved: boolean, pr_detected: boolean }
```

### send_email
Send an email via Gmail MCP.

```typescript
input:  { to: string, subject: string, body: string }
output: { message_id: string }
```

## Adding a new tool

1. Create `src/tools/your-tool.ts`
2. Export a `definition` (name, description, input schema) and `execute` function
3. Register in `src/tools/index.ts`

Claude will automatically know about it on next restart.

## Tool execution flow

```
Claude decides to call web_search({ query: "pharmacy hours" })
  → src/tools/search.ts execute()
  → returns results
  → Claude reads results, decides next step
  → continues loop or forms reply
```
