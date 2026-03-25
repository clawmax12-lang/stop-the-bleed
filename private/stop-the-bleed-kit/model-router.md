# Model Router — OpenClaw Token Cost Control Skill

## What This Does

Automatically routes every task to the cheapest model that can handle it correctly. Eliminates the most common cause of runaway API bills: sending everything to Sonnet (or worse, Opus) by default.

**Expected savings: 60–85% on monthly API spend.**

---

## Install

Copy the routing rules below into your `AGENTS.md` file, replacing or merging with your existing model config.

---

## The Routing Framework

Paste this into `AGENTS.md` under `## Model Assignment by Task Type`:

```markdown
## Model Routing — Cost Control Rules

ALWAYS route by task type. Never use a more expensive model than needed.

### Tier 1 — Free / Near-Free (use by default for everything below)
**Model:** `ollama/llama3.2:3b` (if self-hosted Ollama available)  
**OR:** `claude-haiku-4-5-20251001` (if cloud-only)

Use for:
- Boolean checks ("is this an email?", "is this urgent?")
- Simple keyword extraction
- Format conversion (JSON → markdown, etc.)
- Routing decisions ("which agent should handle this?")
- Heartbeat checks
- Short summarisation under 500 words
- Inbox scanning / triage

### Tier 2 — Cheap (Haiku)
**Model:** `claude-haiku-4-5-20251001`

Use for:
- Research filtering and summarising
- Sub-agent worker tasks
- Web search + synthesis under 1,000 words
- Email drafts (non-client-facing)
- Structured data extraction
- Any task that doesn't need nuanced judgment

### Tier 3 — Quality (Sonnet) — USE SPARINGLY
**Model:** `claude-sonnet-4-6`

Use ONLY for:
- Final client-facing writing
- Complex multi-step reasoning
- Architecture decisions
- Anything explicitly requiring quality output
- Tasks where errors are costly

### Tier 4 — Never (Opus) — BLOCKED
**Model:** DO NOT USE unless William explicitly says "use Opus for this"

Opus costs 15× more than Haiku for marginal gains on most tasks.
It is NEVER appropriate for: heartbeats, routing, research, formatting, summarisation.

---

## Heartbeat Rule (Critical)
Heartbeat checks MUST use Haiku. Never Sonnet.
Add this to your heartbeat cron payload:
`"model": "claude-haiku-4-5-20251001"`

## Context Size Rule (Critical)
Keep SOUL.md under 300 lines.
Keep AGENTS.md under 150 lines.
Every extra line costs tokens on EVERY API call.
Trim mercilessly. The agent doesn't need your life story to do its job.

## Sub-Agent Rule
All sub-agents default to Haiku unless the task explicitly requires Sonnet-level quality.
Never spawn a Sonnet sub-agent for research, filtering, or formatting.
```

---

## Quick Audit — Run This Now

Check your current model configuration:

```bash
grep -r "model" ~/.openclaw/openclaw.json | head -20
```

If you see `claude-opus` or `claude-sonnet` in default positions, you're overspending.

---

## Expected Monthly Savings

| Usage Level | Before (all Sonnet) | After (routed) | Savings |
|-------------|---------------------|----------------|---------|
| Light (2hr/day) | $80–$120/mo | $15–$25/mo | ~80% |
| Medium (6hr/day) | $200–$400/mo | $40–$80/mo | ~80% |
| Heavy (always-on) | $400–$800/mo | $60–$120/mo | ~85% |

---

## The Three Cost Levers

1. **Model selection** — biggest lever. Haiku is 20× cheaper than Sonnet per token.
2. **Context size** — SOUL.md + AGENTS.md + full chat history rides on every call. Trim everything.
3. **Heartbeat frequency** — a heartbeat every 15 min × 24hr × 30 days = 2,880 API calls/month at idle.

---

## Troubleshooting

**"Haiku makes mistakes on complex tasks"** → That's correct. Only send complex tasks to Sonnet. Haiku is for triage, research, and formatting — not for final output.

**"My bill didn't drop"** → Check if heartbeats are using Sonnet. That's the most common culprit.

**"The agent ignores the routing rules"** → Your SOUL.md may be overriding AGENTS.md. Add an explicit rule to SOUL.md: "Always follow model routing rules in AGENTS.md. Never override model selection without explicit user instruction."
