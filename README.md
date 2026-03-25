# Stop the Bleed — clawdkit.app

**$9 one-time** — Cut your OpenClaw bill to under $60/month. One config file, 30 minutes.

## Stack
- Plain HTML/CSS landing page
- Vercel Serverless Functions (Node.js)
- Stripe Checkout
- Resend (email delivery + kit zip)

## Structure
```
index.html          ← Landing page
success.html        ← Post-purchase confirmation
api/
  create-checkout.js ← Stripe checkout session
  webhook.js         ← Stripe webhook → sends kit via Resend
private/
  stop-the-bleed-kit/ ← The actual product files delivered on purchase
vercel.json         ← Vercel config
```

## Deploy
Push to `main` → auto-deploys to clawdkit.app via Vercel.

## Env vars (set in Vercel dashboard)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
