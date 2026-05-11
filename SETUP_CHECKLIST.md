# Whisper Setup Checklist

Follow this step-by-step. Copy the values into your `.env` file as you go.

---

## PHASE 1: Get API Keys (manual - takes 15 minutes)

### Brevo (Free Email Service)

**Steps:**
1. Go to https://brevo.com and click **Sign Up**
2. Complete the form (free tier = 300 emails/day)
3. Verify your email address (they'll send a link)
4. Log in to Brevo dashboard
5. Click **SMTP & API** (left sidebar)
6. Click **Generate a new SMTP key**
   - Name: `Whisper Production`
   - Click **Generate**
7. Copy the SMTP password that appears (save it securely)

**Copy this value:**
```
EMAIL_PASS=your-brevo-smtp-password-here
```

**Now verify a sender email:**
1. Go to **Senders & IPs** (left sidebar)
2. Click **Add a sender**
3. Enter your email: `noreply@whisper.cc` (or any email you own)
4. Click **Add sender**
5. Check that email for a verification link and click it
6. Come back to Brevo and confirm it shows verified

**Copy these values:**
```
RECEIPT_FROM=Whisper <noreply@whisper.cc>
RECEIPT_REPLY_TO=support@youremail.com
```

**⚠️ IMPORTANT:** If you don't own `whisper.cc` domain, use your own email instead!

**Note:** Brevo uses different SMTP settings than SendGrid. We'll update the config in the next step.

---

### Discord Bot (Free)

**Steps:**
1. Go to https://discord.com/developers/applications
2. Click **New Application**
   - Name: `Whisper Bot`
   - Click **Create**
3. Go to the **Bot** tab
4. Click **Add Bot**
5. Under **TOKEN**, click **Copy**

**Copy this value:**
```
DISCORD_BOT_TOKEN=YOUR_TOKEN_HERE
```

**Now get permissions:**
1. In Developer Portal, go to **OAuth2** → **URL Generator**
2. Check these scopes:
   - `bot`
   - `applications.commands`
3. Check these permissions:
   - `Send Messages`
   - `Embed Links`
4. Copy the generated URL at the bottom
5. Open that URL in your browser to **add the bot to your Discord server**

**Now get IDs:**
1. In Discord, go to **User Settings** → **Advanced** → toggle **Developer Mode** ON
2. Right-click your server name → **Copy Server ID**

**Copy this value:**
```
DISCORD_GUILD_ID=YOUR_GUILD_ID
```

3. Right-click the bot in your member list → **Copy User ID**

**Copy this value:**
```
DISCORD_CLIENT_ID=YOUR_CLIENT_ID
```

---

### Stripe (Free to Start)

**Steps:**
1. Go to https://stripe.com and click **Sign Up**
2. Complete the form
3. Verify your email
4. Go to **Products** in the dashboard
5. Click **Add product**
   - Name: `Whisper Premium Access`
   - Price: `1.99`
   - Currency: `USD`
   - Click **Save**
6. Go to your account settings and find **API Keys**
7. Look for **Secret Key** (starts with `sk_test_` or `sk_live_`)

**Copy this value:**
```
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
```

8. Go to **Webhooks** (in left sidebar)
9. Click **Add endpoint**
   - URL: `https://example.com/webhook` (temporary, we'll update this)
   - Events: Click **checkout.session.completed**
   - Click **Add events**
   - Click **Add endpoint**
10. Click on the webhook you just created
11. Scroll down and find **Signing secret**
12. Click **Reveal** and copy it

**Copy this value:**
```
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
```

---

### Railway (Deployment Platform - Free)

**Steps:**
1. Go to https://railway.app
2. Click **Sign Up** → choose **GitHub**
3. Authorize with GitHub
4. Click **New Project**
5. Click **Deploy from GitHub repo**
6. Select your `Whisper.cc Web` repo
7. Click **Deploy**
8. Wait 2-3 minutes for deployment to finish
9. Click on the **web** service
10. Go to the **Settings** tab
11. Look for **Domains**
12. Copy your domain (looks like `whisper-production-1234.up.railway.app`)

**Copy this value:**
```
RAILWAY_URL=whisper-production-1234.up.railway.app
```

---

## PHASE 2: Fill in your `.env` file (automated)

Once you have all the values above, open `.env` in this folder and paste this:

```
PORT=3000
FRONTEND_ORIGIN=https://RAILWAY_URL
PUBLIC_SITE_URL=https://RAILWAY_URL
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
SUCCESS_URL=https://RAILWAY_URL/?payment=success
CANCEL_URL=https://RAILWAY_URL/?payment=cancel
DOWNLOAD_TOKEN_SECRET=generate-a-random-32-char-string-here
LAUNCHER_PATH=./release/whisper.cc.exe
DISABLE_HWID_LOCK=false
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=YOUR_SENDGRID_API_KEY_HERE
RECEIPT_FROM=Whisper <noreply@whisper.cc>
RECEIPT_REPLY_TO=support@youremail.com
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID_HERE
DISCORD_GUILD_ID=YOUR_DISCORD_GUILD_ID_HERE
```

**Replace:**
- `RAILWAY_URL` with your actual Railway domain (from Step 11 above)
- `sk_test_...` with your Stripe secret key
- `whsec_...` with your Stripe webhook secret
- `generate-a-random...` with a random 32-character string (use an online generator)
- `YOUR_SENDGRID_API_KEY_HERE` with your SendGrid API key
- `noreply@whisper.cc` with your verified SendGrid sender email
- `support@youremail.com` with your email
- All the Discord and Stripe values

---

## PHASE 3: Update Stripe Webhook URL

Now that you have your Railway domain:

1. Go back to https://stripe.com
2. Go to **Webhooks**
3. Click on the webhook you created
4. Click **Update details**
5. Change URL from `https://example.com/webhook` to:
   ```
   https://RAILWAY_URL/webhook
   ```
6. Click **Update endpoint**

---

## PHASE 4: Update Launcher Config

On your local machine:

1. Open `c:\Users\nate\Desktop\whisper\release\license_api.txt`
2. Replace the content with:
   ```
   RAILWAY_URL
   ```
   
   For example:
   ```
   whisper-production-1234.up.railway.app
   ```

---

## PHASE 5: Add Environment Variables to Railway

1. Go to https://railway.app
2. Go to your project
3. Click the **web** service
4. Click **Variables** (top right)
5. Click **+ New Variable**
6. Paste each line from your `.env` file:
   - For each line like `KEY=VALUE`:
   - Type `KEY` in the left box
   - Type `VALUE` in the right box
   - Click the checkmark
   - Repeat for all 19 variables

7. After all variables are added, Railway auto-deploys

---

## PHASE 6: Test Everything

### Test the website
1. Open your Railway URL in a browser
2. Click **Get Launcher**
3. Enter a test email
4. You should see a Stripe checkout page

### Test payment
1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: `12/25`
3. CVC: `123`
4. Click **Pay**
5. Check the email you used - you should get a receipt with a license key

### Test the bot
1. Go to your Discord server
2. Type `/verify`
3. Enter the test email and license key
4. The bot should respond with a download link

### Test the launcher
1. Download the launcher using the link
2. Run it on your local machine
3. When it asks for the API host, use: `RAILWAY_URL` (from before)
4. Enter the test email and license key
5. It should verify and let you in

---

## If Something Goes Wrong

**Email not arriving:**
- Wait 5 minutes (SendGrid can be slow)
- Check spam folder
- Verify sender email is verified in SendGrid
- Check Railway logs: go to service → Logs

**Bot not responding:**
- Make sure bot is online in Discord (should have a green dot)
- Check Railway logs for errors
- Verify all Discord IDs are correct

**Stripe webhook failing:**
- Go to https://stripe.com → Webhooks
- Click on your webhook
- Scroll down to **Events** section
- You should see recent events
- Red X = failed, Green checkmark = success
- Click event to see error details

**Launcher won't connect:**
- Check `license_api.txt` has your Railway domain (no `https://`)
- Run launcher and check console for error messages
- Make sure website is running on Railway

---

## Next Steps (When Everything Works)

1. Set `STRIPE_SECRET_KEY` to `sk_live_...` (live key) for real payments
2. Update all `https://` URLs to use your real domain (not Railway subdomain)
3. Build a polished landing page with marketing copy
4. Test with real purchases
5. Monitor logs for errors

---

You got this! Any questions, ask for help on specific steps.
