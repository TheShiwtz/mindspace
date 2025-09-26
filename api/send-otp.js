// api/send-otp.js  (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ ok: false, error: 'Missing email or code' });
    }

    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // ustawisz w Vercel → Env Vars
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          email: process.env.FROM_EMAIL,               // np. mindspaceactive@gmail.com
          name : process.env.FROM_NAME || 'MindSpace'  // np. MindSpace
        },
        to: [{ email }],
        subject: 'Your verification code',
        htmlContent: `<p>Your MindSpace verification code is: <b>${code}</b></p>
                      <p>This code expires in 10 minutes.</p>`
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ ok: false, error: data });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Send failed' });
  }
}
