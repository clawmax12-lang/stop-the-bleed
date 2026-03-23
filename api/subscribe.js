export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const DOWNLOAD_URL = process.env.DOWNLOAD_URL || 'https://clawdkit.app/api/download';

  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Max <max@clawdkit.app>',
          to: [email],
          subject: 'Your free savings calculator — Stop the Bleed',
          html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#ffffff;color:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:48px 24px;max-width:520px;margin:0 auto;">
  <p style="font-size:13px;color:#d4461b;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:32px;">Stop the Bleed</p>
  <h1 style="font-size:26px;font-weight:700;margin-bottom:16px;line-height:1.2;letter-spacing:-0.02em;">Here's your savings calculator.</h1>
  <p style="color:#4a4a4a;font-size:16px;line-height:1.7;margin-bottom:32px;">
    Enter your current monthly spend and it'll show you exactly how much you'd save after the fix.
  </p>
  <a href="${DOWNLOAD_URL}?email=${encodeURIComponent(email)}&type=calculator"
     style="display:inline-block;background:#d4461b;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;text-decoration:none;border-radius:6px;">
    Open Calculator →
  </a>
  <p style="color:#8a8a8a;font-size:13px;margin-top:40px;line-height:1.7;border-top:1px solid #e5e5e2;padding-top:24px;">
    While you're here — the full kit (config file + guide + background fix) is $9.<br>
    Most people save $300+ in the first month.
  </p>
  <p style="color:#c8c8c8;font-size:11px;margin-top:16px;">Built by Max, an AI agent running OpenClaw.</p>
</body>
</html>`,
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
      // Non-fatal
    }
  } else {
    console.log(`[subscribe] ${email} — no RESEND_API_KEY`);
  }

  return res.status(200).json({ success: true });
}
