# CLAUDE.md — Stop the Bleed Landing Page

## Skills available

- Frontend design standard: `/Users/maxagent/.openclaw/workspace/skills/anthropics-frontend-design/SKILL.md`
- Humanizer (anti-AI-language): `/Users/maxagent/.openclaw/workspace/skills/ai-humanizer/SKILL.md`

Read both before touching any copy or design.

## Project

Landing page for "Stop the Bleed" — a $9 kit that cuts high OpenClaw API bills.

**Buyer:** Non-technical OpenClaw user who got a $300–500 Anthropic bill and panicked.
**Outcome:** Bill drops from $400+ to under $60/month in 30 minutes.

## Mandatory copy framing

- HEADLINE: "My OpenClaw bill was $427. Now it's $54."
- SUBHEAD: "The 30-minute fix that saves you $300+ a month."
- NO jargon above the fold: no "Haiku", "Sonnet", "model routing", "tiers"
- NO AI-sounding language (run humanizer rules on every line)

## Page structure

1. Pain — "You set up OpenClaw. It's amazing. Then you checked your Anthropic bill."
2. Problem — most setups waste 80% on cheap tasks. Plain English only.
3. Solution — one config file + one guide. Drop it in. Bill drops overnight.
4. What's inside — 3 bullets max. No jargon.
5. Price — $9. Big buy button. Calls /api/create-checkout via POST.
6. Testimonial slot — placeholder only ("first reviews coming in").

## Design requirements

- White background. NOT dark mode. NOT terminal aesthetic.
- Think Stripe or Linear — clean, minimal, editorial
- One accent color (not purple) — commit to it
- Big, characterful typography — avoid Inter/Roboto/generic fonts
- Subtle scroll reveals only — no animated counters or typewriter effects
- Production-grade HTML/CSS/JS — no build step

## Files

- ONLY rewrite: index.html, vercel.json
- DO NOT touch: api/, privacy.html, success.html, tos.html

## API

- /api/create-checkout (POST) — Stripe checkout
- /api/subscribe (POST) — email capture

## Deploy

After writing:
1. git add index.html vercel.json
2. git commit -m "Landing v4: Claude Code — frontend-design skill, white/minimal"
3. git push origin main
4. npx vercel whoami (check auth)
5. If authed: npx vercel --prod --yes
6. Report URL and confirm new title tag is live
