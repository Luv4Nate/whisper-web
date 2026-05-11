# Railway Deployment Guide for Whisper

## Prerequisites

Before you deploy, you need:
- [ ] GitHub account with your code pushed
- [ ] Brevo API key
- [ ] Discord bot token + IDs
- [ ] Stripe secret key + webhook secret
- [ ] All values ready in `.env` file

## Step 1: Sign Up to Railway

1. Go to **https://railway.app**
2. Click **Sign Up**
3. Select **Continue with GitHub**
4. Authorize Railway to access your GitHub account
5. You're in the Railway dashboard

## Step 2: Create a New Project

1. Click **New Project**
2. Click **Deploy from GitHub repo**
3. Select your **Whisper.cc Web** repository
4. Click **Deploy**

Railway will:
- Detect it's a Node.js project
- Run `npm install`
- Run `npm start`
- Deploy to a URL like: `https://whisper-production-1234.up.railway.app`

**Wait 2-3 minutes for deployment to complete.**

## Step 3: Get Your Railway URL

1. After deployment finishes, click on the **web** service
2. Click on **Settings** tab
3. Scroll down to **Domains**
4. You'll see your auto-generated domain
5. **Copy it** (this is your `RAILWAY_URL`)

Example: `whisper-production-1234.up.railway.app`

## Step 4: Add Environment Variables

1. In Railway dashboard, click on the **web** service
2. Click on **Variables** tab (top navigation)
3. Click **+ New Variable**

For each line in your `.env` file:

**Example: Adding PORT**
- Key: `PORT`
- Value: `3000`
- Click checkmark ✓

**Repeat for all 19 variables:**
```
PORT=3000
FRONTEND_ORIGIN=https://YOUR_RAILWAY_URL
PUBLIC_SITE_URL=https://YOUR_RAILWAY_URL
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUCCESS_URL=https://YOUR_RAILWAY_URL/?payment=success
CANCEL_URL=https://YOUR_RAILWAY_URL/?payment=cancel
DOWNLOAD_TOKEN_SECRET=...
LAUNCHER_PATH=./release/whisper.cc.exe
DISABLE_HWID_LOCK=false
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=...
RECEIPT_FROM=...
RECEIPT_REPLY_TO=...
DISCORD_BOT_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...
```

**After you add each variable, Railway will:**
- Show a ✓ confirmation
- Auto-redeploy your app
- Wait 30 seconds between each

Once all 19 are added, your site is live at `https://YOUR_RAILWAY_URL`.

## Step 5: Update Stripe Webhook

Now that you have your Railway URL:

1. Go to **https://stripe.com**
2. Go to **Webhooks** (in left sidebar)
3. Click on the webhook you created earlier
4. Click **Update details**
5. Change URL from `https://example.com/webhook` to:
   ```
   https://YOUR_RAILWAY_URL/webhook
   ```
6. Click **Update endpoint**

**Now Stripe will send payment confirmations to your live server.**

## Step 6: Deploy the Discord Bot (Optional but Recommended)

You have two options:

### Option A: Single Service (Simpler)
Bot runs inside the web service.

Modify `package.json`:
```json
"start": "npm run bot & node server.js"
```

Then redeploy. Railway will start both.

### Option B: Separate Bot Service (Better)
1. In Railway dashboard, go to your project
2. Click **+ New Service**
3. Select **GitHub** repo again
4. Click to connect the same **Whisper.cc Web** repo
5. Railway creates a new service in your project
6. Click on the new service
7. Go to **Deploy** tab
8. Set **Start Command** to: `npm run bot`
9. Go to **Variables** tab
10. Add the same Discord env vars:
    ```
    DISCORD_BOT_TOKEN=...
    DISCORD_CLIENT_ID=...
    DISCORD_GUILD_ID=...
    ```
    
    And these:
    ```
    EMAIL_HOST=smtp.sendgrid.net
    EMAIL_PORT=587
    EMAIL_SECURE=false
    EMAIL_USER=apikey
    EMAIL_PASS=... (same as web service)
    ```

11. Railway deploys the bot service
12. Bot is now always running separate from the web server

## Step 7: Test Your Deployment

### Test 1: Website loads
1. Open `https://YOUR_RAILWAY_URL` in your browser
2. You should see the Whisper landing page
3. Button says **"Get Launcher"**

### Test 2: Purchase flow
1. Click **"Get Launcher"**
2. Enter your email
3. Click through to Stripe
4. Use test card: `4242 4242 4242 4242`
5. Expiry: `12/25`
6. CVC: `123`
7. Name: any name
8. Click **Pay**

### Test 3: Email received
1. Check the email you used
2. You should have a receipt with:
   - License key (5 segments like `ABCD-1234-EFGH...`)
   - Refere order number
   - Product details

### Test 4: Bot verification
1. Go to your Discord server
2. Type: `/verify`
3. Enter email from Step 2
4. Enter license key from Step 3
5. Bot should respond with download link

### Test 5: Download and run launcher
1. Click the download link from the bot
2. Run `whisper.cc.exe`
3. When asked for API host, enter: `YOUR_RAILWAY_URL` (no https://)
4. Enter email + license key
5. If valid, it opens the menu ✓

**If all 5 tests pass, you're live!**

## Step 8: Monitor Your Deployment

### Check Logs
1. Click on **web** service
2. Go to **Logs** tab
3. See real-time server output
4. Any errors show here in red

### Check Bot Logs
1. If you deployed bot separately, click on **bot** service
2. Go to **Logs** tab
3. See bot output

### Redeploy After Changes
1. Push code to GitHub
2. Railway auto-detects changes
3. Auto-redeploys within 1-2 minutes
4. No manual action needed

### View Deployment History
1. Click service
2. Go to **Deployments** tab
3. See past deployments + rollback if needed

## Step 9: Go Live with Real Money (Later)

When ready to accept real payments:

1. Go to **Stripe Dashboard**
2. Switch from **Test Mode** to **Live Mode**
3. Get your **live secret key** (starts with `sk_live_`)
4. In Railway Variables, update:
   - `STRIPE_SECRET_KEY=sk_live_...`
5. Railway redeploys automatically
6. **Your site is now accepting real payments**

## Step 10: Use a Custom Domain (Optional)

Right now your URL is `https://whisper-production-1234.up.railway.app`

To use `https://whisper.cc`:

1. Buy a domain from any registrar (GoDaddy, Namecheap, etc.)
2. In Railway dashboard, click **web** service
3. Go to **Settings** tab
4. Under **Domains**, click **+ Add Domain**
5. Enter `whisper.cc`
6. Follow instructions to update your DNS records at your registrar
7. Railway handles the SSL certificate (free)
8. After 15 minutes, `https://whisper.cc` works

Then update your env variables:
```
FRONTEND_ORIGIN=https://whisper.cc
PUBLIC_SITE_URL=https://whisper.cc
SUCCESS_URL=https://whisper.cc/?payment=success
CANCEL_URL=https://whisper.cc/?payment=cancel
```

## Troubleshooting

### Website shows error page
- Click **web** service → **Logs**
- Look for red error messages
- Most common: missing env variable

### Stripe webhook not firing
- Go to Stripe Dashboard → **Webhooks**
- Click webhook → **Events**
- Red X = failed, Green checkmark = success
- Click event to see error details

### Discord bot not online
- Click **bot** service → **Logs**
- Look for login errors
- Verify `DISCORD_BOT_TOKEN` is correct

### Launcher can't connect
- Make sure `license_api.txt` has correct domain
- Domain should have no `https://` prefix
- Example: `whisper-1234.up.railway.app` ✓
- Wrong: `https://whisper-1234.up.railway.app` ✗

### Emails not sending
- Check **SendGrid dashboard** → check bounce/delivery rates
- Verify sender email is verified in SendGrid
- Check Railway logs for SendGrid errors
- Verify `EMAIL_PASS` is correct API key

## Railway Pricing

- **First $5/month:** FREE
- **Additional usage:** $0.50/GB RAM-hour
- **Example:** Small app (512MB RAM) = ~$5/month

Most likely your first 3-6 months are free, then around $5-10/month.

## Final Checklist

- [ ] GitHub repo pushed
- [ ] Railway project created
- [ ] Web service deployed
- [ ] All 19 env variables added
- [ ] Stripe webhook updated to Railway URL
- [ ] Bot service deployed (optional)
- [ ] Website loads at Railway URL
- [ ] Test purchase flow works
- [ ] Email receipt arrives
- [ ] Discord bot responds to `/verify`
- [ ] Launcher downloads and runs
- [ ] Full flow tested end-to-end
- [ ] Documentation saved for team

**You're done! Your Whisper bot is live on Railway.** 🚀
