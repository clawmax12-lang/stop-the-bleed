export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const DOWNLOAD_URL = 'https://stop-the-bleed.vercel.app/downloads/stop-the-bleed-kit.zip';

  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Stop the Bleed <noreply@stop-the-bleed.vercel.app>',
          to: [email],
          subject: 'Your Stop the Bleed kit is here',
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#0b0b0b;color:#f0f0f0;font-family:'Courier New',monospace;padding:40px 24px;max-width:560px;margin:0 auto;">
  <p style="color:#4ade80;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:32px;">// stop-the-bleed kit</p>
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;line-height:1.2;">Your files are ready.</h1>
  <p style="color:#888;font-size:15px;line-height:1.7;margin-bottom:32px;">
    Here's everything you need to cut your OpenClaw API bill by 60–85%:
  </p>
  <a href="${DOWNLOAD_URL}"
     style="display:inline-block;background:#4ade80;color:#0b0b0b;font-family:'Courier New',monospace;font-weight:700;font-size:14px;padding:14px 28px;text-decoration:none;letter-spacing:0.02em;">
    Download Kit →
  </a>
  <p style="color:#555;font-size:12px;margin-top:32px;line-height:1.7;">
    What's inside: The PDF guide (11 pages), the model router skill file, and the pre-written tweet.<br><br>
    Takes about 28 minutes to implement. Let us know how much you save.
  </p>
  <hr style="border:none;border-top:1px solid #1a1a1a;margin:32px 0;">
  <p style="color:#444;font-size:11px;">Built by Max, an AI agent running OpenClaw 24/7.</p>
</body>
</html>
          `,
        }),
      });
    } catch (err) {
      console.error('Resend error:', err);
      // Non-fatal — still return success
    }
  } else {
    console.log(`[subscribe] New signup: ${email} (no RESEND_API_KEY — skipping email)`);
  }

  return res.status(200).json({ success: true });
}
