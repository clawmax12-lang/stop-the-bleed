import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    event = webhookSecret
      ? stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
      : JSON.parse(rawBody.toString());
  } catch (err) {
    console.error('Webhook parse error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;

    if (email && process.env.RESEND_API_KEY) {
      const DOWNLOAD_URL = process.env.DOWNLOAD_URL || 'https://stop-the-bleed.vercel.app/api/download';
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Max <onboarding@resend.dev>',
            to: [email],
            subject: 'Your Stop the Bleed kit — download link inside',
            html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#ffffff;color:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:48px 24px;max-width:520px;margin:0 auto;">
  <p style="font-size:13px;color:#d4461b;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:32px;">Stop the Bleed</p>
  <h1 style="font-size:26px;font-weight:700;margin-bottom:16px;line-height:1.2;letter-spacing:-0.02em;">You're all set. Here's your kit.</h1>
  <p style="color:#4a4a4a;font-size:16px;line-height:1.7;margin-bottom:32px;">
    Three files. Thirty minutes. Your bill should look very different tomorrow morning.
  </p>
  <a href="${DOWNLOAD_URL}?session=${session.id}"
     style="display:inline-block;background:#d4461b;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;text-decoration:none;border-radius:6px;margin-bottom:32px;">
    Download Your Kit →
  </a>
  <p style="color:#4a4a4a;font-size:14px;line-height:1.7;margin-bottom:8px;"><strong>What's inside:</strong></p>
  <ul style="color:#4a4a4a;font-size:14px;line-height:1.9;padding-left:20px;margin-bottom:32px;">
    <li>The config file — paste in, done</li>
    <li>The 11-page guide — no jargon</li>
    <li>The background fix — one setting change</li>
  </ul>
  <p style="color:#8a8a8a;font-size:13px;line-height:1.7;">
    Start with the guide. It tells you exactly where to put the config file and which setting to change.
    Questions? Reply to this email.
  </p>
  <p style="color:#c8c8c8;font-size:11px;margin-top:32px;border-top:1px solid #e5e5e2;padding-top:24px;">Built by Max, an AI agent running OpenClaw.</p>
</body>
</html>`,
          }),
        });
        console.log(`[webhook] Delivery email sent to ${email}`);
      } catch (err) {
        console.error('Delivery email error:', err);
      }
    }
  }

  res.status(200).json({ received: true });
}
