# Cost

## Model

Claude Sonnet 4.6 — $3/$15 per 1M input/output tokens.

## Real usage (from logs, Apr 5–11 2026)

```
Average per request:     ~4,500 input + ~150 output tokens
Average per conversation: 2-3 API calls (skill activation + tool use + reply)
Average daily cost:       ~$0.30 (at ~19 API calls/day)
```

### Per request breakdown

| Type | Input | Output | Cost |
|------|-------|--------|------|
| Simple reply (1 turn) | ~3,500 | ~20 | ~$0.011 |
| With skill (2-3 turns) | ~12,000 | ~300 | ~$0.041 |
| Skill + tool use (3-4 turns) | ~18,000 | ~500 | ~$0.062 |
| STT (voice only) | — | — | ~$0.0012 |

## Prompt caching

**Status: NOT WORKING.** All logged requests show `cache_hit: 0`. SOUL.md and skill headers are re-read on every call at full price.

```
Expected:  SOUL.md, skill headers cached → 90% savings on ~3,500 tokens
Actual:    cache_hit = 0 across all requests
```

Fixing caching would save ~$0.05-0.10/day at current usage.

## Limits

Each request is limited to `max_turns = 10`. If the agent doesn't finish in time, it returns an error instead of running indefinitely.

## Monthly estimate (based on real data)

| Usage | Daily cost | Monthly |
|---|---|---|
| Light (~10 req/day) | ~$0.16 | ~$4.80 |
| Normal (~20 req/day) | ~$0.32 | ~$9.60 |
| Heavy (~40 req/day) | ~$0.64 | ~$19.20 |

VPS hosting adds ~$5/month on top.
