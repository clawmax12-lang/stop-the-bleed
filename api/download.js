// Serves the kit zip after verifying a valid Stripe session ID
// Also handles the free calculator lead magnet (type=calculator)
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  const { session, type } = req.query;

  // Free lead magnet calculator
  if (type === 'calculator') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(calculatorHTML());
  }

  // Paid kit — verify Stripe session
  if (!session) {
    return res.status(400).send('Missing session ID');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).send('Not configured');
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
    const stripeSession = await stripe.checkout.sessions.retrieve(session);

    if (stripeSession.payment_status !== 'paid') {
      return res.status(403).send('Payment not completed');
    }

    // Serve the zip
    const zipPath = join(process.cwd(), 'public', 'stop-the-bleed-kit.zip');
    let zipBuffer;
    try {
      zipBuffer = readFileSync(zipPath);
    } catch {
      return res.status(404).send('File not found — email max@openclaw.ai for your download');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="stop-the-bleed-kit.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    return res.status(200).send(zipBuffer);

  } catch (err) {
    console.error('Download error:', err);
    return res.status(500).send('Error verifying purchase — email max@openclaw.ai');
  }
}

function calculatorHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>OpenClaw Savings Calculator — Stop the Bleed</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,600&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --accent: #d4461b; --ink: #0d0d0d; --mid: #4a4a4a; --border: #e5e5e2; --bg: #fafaf8; }
  body { background: #fff; color: var(--ink); font-family: 'DM Sans', sans-serif; padding: 48px 24px; max-width: 560px; margin: 0 auto; }
  h1 { font-family: 'Instrument Serif', serif; font-size: 36px; font-weight: 400; letter-spacing: -0.02em; margin-bottom: 10px; }
  p.sub { font-size: 16px; color: var(--mid); margin-bottom: 40px; font-weight: 300; line-height: 1.6; }
  label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
  input[type=number] { width: 100%; padding: 14px 16px; border: 1.5px solid var(--border); border-radius: 6px; font-size: 20px; font-family: inherit; margin-bottom: 28px; outline: none; transition: border-color 0.15s; }
  input[type=number]:focus { border-color: var(--accent); }
  .result { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 28px; display: none; margin-bottom: 32px; }
  .result.show { display: block; }
  .saving { font-family: 'Instrument Serif', serif; font-size: 52px; color: var(--accent); line-height: 1; letter-spacing: -0.03em; margin: 8px 0; }
  .result-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a8a8a; }
  .result-note { font-size: 14px; color: var(--mid); margin-top: 16px; line-height: 1.6; }
  .btn { display: block; width: 100%; padding: 16px; background: var(--accent); color: #fff; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; text-align: center; text-decoration: none; letter-spacing: -0.01em; margin-top: 8px; transition: background 0.15s; }
  .btn:hover { background: #b83a16; }
  .back { font-size: 13px; color: #8a8a8a; margin-top: 32px; text-align: center; }
  .back a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
  <p style="font-size:12px;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:24px;">Stop the Bleed</p>
  <h1>How much will<br/>you save?</h1>
  <p class="sub">Enter your last Anthropic bill. We'll show you what it looks like after the fix.</p>
  <label for="bill">Your current monthly bill ($)</label>
  <input type="number" id="bill" placeholder="e.g. 427" min="0" step="1" oninput="calc()" />
  <div class="result" id="result">
    <div class="result-label">You'd save approximately</div>
    <div class="saving" id="saving">$0</div>
    <div class="result-label" style="margin-top:16px">per month — new bill around</div>
    <div style="font-size:28px;font-weight:600;margin:6px 0;" id="newbill">$0</div>
    <div class="result-note" id="note"></div>
  </div>
  <a href="https://stop-the-bleed.vercel.app" class="btn">Get the fix for $9 →</a>
  <div class="back"><a href="https://stop-the-bleed.vercel.app">← Back to Stop the Bleed</a></div>
<script>
function calc() {
  const bill = parseFloat(document.getElementById('bill').value) || 0;
  const result = document.getElementById('result');
  if (bill < 20) { result.classList.remove('show'); return; }
  const reduction = Math.min(0.85, Math.max(0.60, 0.82 - (bill > 500 ? 0.05 : 0)));
  const saved = Math.round(bill * reduction);
  const newBill = bill - saved;
  document.getElementById('saving').textContent = '$' + saved;
  document.getElementById('newbill').textContent = '$' + newBill + '/mo';
  document.getElementById('note').textContent =
    'Based on typical results from fixing default model routing, heartbeat frequency, and context window reuse. Most users see 60–85% reduction.';
  result.classList.add('show');
}
</script>
</body>
</html>`;
}
