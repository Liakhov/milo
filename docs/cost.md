# Cost

## Per request

```
Agent loop (3 turns avg):    ~900 input + 200 output  = $0.00047
Verifier (if needed):        ~200 input + 30 output   = $0.00006
Whisper (voice only):        ~0.2 min                 = $0.00120
─────────────────────────────────────────────────────────────────
With voice:                                           ≈ $0.0018
Text only:                                            ≈ $0.0005
```

At 100 requests/day → **~$1–5/month** on LLM.

Phone calls via Vapi are billed separately at $0.05–0.10/min.

## Prompt caching

Parts of context that don't change often are cached — you pay 10% of normal cost on repeated requests.

```
SOUL.md (~300 tokens)         cached → $0.000008 instead of $0.000075
Skill headers (~100 tokens)   cached → $0.000003 instead of $0.000025
Summary (~200 tokens)         cached → $0.000005 instead of $0.000050
```

Caching saves ~70% on input tokens across a conversation.

## Model choice

Claude Haiku 4.5 — $0.25/$1.25 per 1M tokens.

For routing and single-domain tasks, Haiku matches Sonnet in quality at 12x lower cost. The most expensive part of the system is phone calls, not the LLM.

## Budget cap

Each request is limited to `max_turns = 5` and `max_budget_usd = 0.02`. If the agent doesn't finish in time, it returns an honest error instead of running indefinitely.

## Monthly estimate

| Usage | LLM cost | Calls cost | Total |
|---|---|---|---|
| Light (50 req/day) | ~$0.75 | ~$1 | ~$2 |
| Normal (100 req/day) | ~$1.50 | ~$2 | ~$4 |
| Heavy (200 req/day) | ~$3.00 | ~$5 | ~$8 |

VPS hosting adds ~$5/month on top.
