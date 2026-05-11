import fs from 'fs/promises';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { addLicense, bindOrVerifyHwid, validateLicense } from './license-store.js';
import { verifyDownloadToken } from './download-token.js';
import { resolveDownloadUrlForValidatedUser } from './resolve-download.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: Missing STRIPE_SECRET_KEY in .env. Add your Stripe test secret key to .env and restart the server.');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 3000;

const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const publicSiteUrl = (process.env.PUBLIC_SITE_URL || allowedOrigin).replace(/\/$/, '');

app.use(cors({ origin: allowedOrigin }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;
    const reference = session.payment_intent;
    const order = session.id;
    const license = buildLicense();
    const amount = Number(session.amount_total) / 100;

    try {
      await addLicense({
        email,
        reference,
        order,
        license,
        amount,
        product: 'Whisper Premium Access',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error storing license', err);
    }

    try {
      await sendReceiptEmail({ email, reference, order, license, amount });
      console.log('[email] Receipt sent to', email);
    } catch (err) {
      console.error('[email] Receipt failed — license was still saved. Fix SMTP in .env:', err?.message || err);
    }
  }

  res.json({ received: true });
});

app.use(express.json());

app.post('/api/launcher-auth', async (req, res) => {
  try {
    const { email, license, hwid } = req.body || {};
    if (!email || !license) {
      return res.status(400).json({ ok: false, error: 'missing_credentials' });
    }
    const result = await bindOrVerifyHwid(email, license, hwid);
    if (!result.ok) {
      const code =
        result.error === 'invalid_license' ? 401 : result.error === 'hwid_mismatch' ? 403 : 400;
      return res.status(code).json({ ok: false, error: result.error });
    }
    res.json({ ok: true, activated: Boolean(result.activated) });
  } catch (error) {
    console.error('launcher-auth error', error);
    res.status(500).json({ ok: false, error: 'server_error' });
  }
});

function createTransport() {
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: String(process.env.EMAIL_PASS ?? '').replace(/\s+/g, ''),
    },
  });
}

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.RECEIPT_FROM);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendReceiptEmail({ email, reference, order, license, amount }) {
  if (!isEmailConfigured()) {
    throw new Error(
      'Email is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, RECEIPT_FROM (and RECEIPT_REPLY_TO) in .env — see .env.example.'
    );
  }
  const transporter = createTransport();
  const safe = {
    reference: escapeHtml(reference),
    order: escapeHtml(order),
    license: escapeHtml(license),
    amount: escapeHtml(amount),
    site: escapeHtml(publicSiteUrl),
    reply: escapeHtml(process.env.RECEIPT_REPLY_TO || process.env.EMAIL_USER || ''),
  };
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6;">
      <h2 style="color:#d42f2f;">Whisper Payment Receipt</h2>
      <p>Thank you for your payment. Below are the details of your transaction:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;font-weight:700;">Reference Number</td><td style="padding:8px;">${safe.reference}</td></tr>
        <tr><td style="padding:8px;font-weight:700;">Order Number</td><td style="padding:8px;">${safe.order}</td></tr>
        <tr><td style="padding:8px;font-weight:700;">Product Details</td><td style="padding:8px;">Whisper Premium Access</td></tr>
        <tr><td style="padding:8px;font-weight:700;">Total Amount</td><td style="padding:8px;">$${safe.amount}</td></tr>
        <tr><td style="padding:8px;font-weight:700;">Payment Status</td><td style="padding:8px;">COMPLETED</td></tr>
        <tr><td style="padding:8px;font-weight:700;">License</td><td style="padding:8px;">${safe.license}</td></tr>
      </table>
      <p><strong>Get your launcher:</strong> open <a href="${publicSiteUrl}">${safe.site}</a> and use <strong>Redeem license</strong> with this email and license key. The desktop app will ask for the same details on first run (optional save to <code>_license.dat</code> next to the program).</p>
      <p>If you have any questions, please contact us at <a href="mailto:${escapeHtml(process.env.RECEIPT_REPLY_TO || process.env.EMAIL_USER || '')}">${safe.reply}</a>.</p>
      <p>Thank you for choosing Whisper.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.RECEIPT_FROM,
    to: email,
    subject: '[Whisper] Your Product & Payment Receipt',
    html,
  });
}

function buildLicense() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segments = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  );
  return segments.join('-');
}

app.post('/purchase', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Whisper Premium Access',
              description: 'Secure Whisper launcher access purchase',
            },
            unit_amount: 199,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SUCCESS_URL || allowedOrigin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CANCEL_URL || allowedOrigin}/?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Purchase error', error);
    res.status(500).json({
      error: 'Unable to create purchase session.',
      details: error?.message || 'Unknown server error.',
    });
  }
});

app.post('/api/validate-license', async (req, res) => {
  try {
    const { email, license } = req.body;
    if (!email || !license) {
      return res.status(400).json({ error: 'Email and license are required.' });
    }

    const record = await validateLicense(email, license);
    if (!record) {
      return res.status(404).json({ valid: false, error: 'License not found or invalid.' });
    }

    const downloadUrl = await resolveDownloadUrlForValidatedUser({ email, license });
    res.json({ valid: true, downloadUrl });
  } catch (error) {
    console.error('License validation error', error);
    res.status(500).json({ error: 'Unable to validate license.' });
  }
});

app.get('/api/download-launcher', async (req, res) => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const secret = process.env.DOWNLOAD_TOKEN_SECRET;
    const launcherPath = process.env.LAUNCHER_PATH;

    if (!token || !secret || !launcherPath) {
      return res.status(404).send('Download is not available.');
    }

    const parsed = verifyDownloadToken(token, secret);
    if (!parsed) {
      return res.status(400).send('This download link is invalid or has expired. Redeem your license again.');
    }

    const record = await validateLicense(parsed.email, parsed.license);
    if (!record) {
      return res.status(403).send('This license is no longer valid.');
    }

    res.download(launcherPath, 'whisper.cc.exe', (err) => {
      if (err && !res.headersSent) {
        console.error('Download error', err);
        res.status(500).send('Could not send the file.');
      }
    });
  } catch (error) {
    console.error('Download launcher error', error);
    if (!res.headersSent) {
      res.status(500).send('Download failed.');
    }
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  if (!isEmailConfigured()) {
    console.warn('[email] Receipt emails disabled until EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and RECEIPT_FROM are set.');
  } else {
    try {
      const t = createTransport();
      await t.verify();
      console.log('[email] SMTP connection verified.');
    } catch (e) {
      console.warn('[email] SMTP verify failed — check host, port, and app password:', e?.message || e);
    }
  }
  if (process.env.LAUNCHER_PATH) {
    console.log(`Launcher file: ${process.env.LAUNCHER_PATH}`);
    try {
      await fs.access(process.env.LAUNCHER_PATH);
    } catch {
      console.warn('[download] LAUNCHER_PATH is set but the file is not readable at that path. Downloads will fail until it is fixed.');
    }
  }
});
