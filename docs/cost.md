# Cost

## Model

Claude Haiku 4.5 — $0.25/$1.25 per 1M input/output tokens.

## Real usage (from logs, Apr 5–11 2026)

```
Average per request:     ~4,500 input + ~150 output tokens
Average per conversation: 2-3 API calls (skill activation + tool use + reply)
Average daily cost:       ~$0.024 (at ~19 API calls/day)
```

### Per request breakdown

| Type | Input | Output | Cost |
|------|-------|--------|------|
| Simple reply (1 turn) | ~3,500 | ~20 | ~$0.001 |
| With skill (2-3 turns) | ~12,000 | ~300 | ~$0.004 |
| Skill + tool use (3-4 turns) | ~18,000 | ~500 | ~$0.005 |
| STT (voice only) | — | — | ~$0.0012 |

## Prompt caching

**Status: NOT WORKING.** All logged requests show `cache_hit: 0`. SOUL.md and skill headers are re-read on every call at full price.

```
Expected:  SOUL.md, skill headers cached → 90% savings on ~3,500 tokens
Actual:    cache_hit = 0 across all requests
```

Fixing caching would save ~$0.005-0.01/day at current usage.

## Limits

Each request is limited to `max_turns = 10`. If the agent doesn't finish in time, it returns an error instead of running indefinitely.

## Monthly estimate (based on real data)

| Usage | Daily cost | Monthly |
|---|---|---|
| Light (~10 req/day) | ~$0.01 | ~$0.30 |
| Normal (~20 req/day) | ~$0.025 | ~$0.75 |
| Heavy (~40 req/day) | ~$0.05 | ~$1.50 |

VPS hosting adds ~$5/month on top.
