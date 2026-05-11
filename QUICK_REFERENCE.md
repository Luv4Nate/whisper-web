# Whisper Setup - Quick Reference

## In 10 minutes: What you need to do

### 1. Get these 5 accounts (free)
- [ ] SendGrid (email) - https://sendgrid.com
- [ ] Discord Developer Portal - https://discord.com/developers/applications
- [ ] Stripe (payments) - https://stripe.com
- [ ] Railway (hosting) - https://railway.app
- [ ] GitHub (if you don't have one) - https://github.com

### 2. Generate 4 API Keys
From each service, copy these exact values:

| Service | Value to Copy | Where to Find |
|---------|---------------|---------------|
| Brevo | `EMAIL_PASS` | SMTP & API → Generate SMTP key |
| Brevo | `RECEIPT_FROM` | Senders & IPs → Add sender |
| Discord | `DISCORD_BOT_TOKEN` | Applications → Bot → Copy Token |
| Discord | `DISCORD_GUILD_ID` | Server (right-click) → Copy Server ID |
| Discord | `DISCORD_CLIENT_ID` | Bot (right-click) → Copy User ID |
| Stripe | `STRIPE_SECRET_KEY` | Settings → API Keys → Secret Key |
| Stripe | `STRIPE_WEBHOOK_SECRET` | Webhooks → (click webhook) → Signing secret |

### 3. Fill in .env file
```bash
cd c:\Users\nate\Desktop\Whisper.cc Web
copy .env.template .env
# Edit .env and paste your values
```

### 4. Validate your .env
```bash
npm run validate
```

If it shows ✓ for everything, you're ready.

### 5. Deploy to Railway
1. Push code to GitHub
2. Railway auto-deploys
3. Get your URL: `https://whisper-XXXX.up.railway.app`

### 6. Add env vars to Railway
In Railway dashboard → web service → Variables:
- Paste all 19 variables from your `.env`

### 7. Update Stripe webhook
Go to Stripe → Webhooks:
- Change URL to: `https://YOUR_RAILWAY_URL/webhook`

### 8. Update launcher config
Edit: `c:\Users\nate\Desktop\whisper\release\license_api.txt`
- Add: `YOUR_RAILWAY_URL` (no https://)

### 9. Test it
- Visit your Railway URL
- Click "Get Launcher"
- Use Stripe test card: `4242 4242 4242 4242`
- Check email for receipt license key
- In Discord: `/verify email license`
- Download launcher and run with test credentials

---

## The 5 Services Explained

### SendGrid (Email)
**Why:** Send license keys to customers after they purchase
**Free:** 100 emails/day
**Cost when scaling:** $29.95/month for 40k emails
**Alternative:** None that's free and good (Gmail auth is complex)

### Discord Bot
**Why:** Let customers verify their license in Discord
**Free:** Yes, forever
**Alternative:** Could remove, but customers love this
**Note:** Optional - but included in your code

### Stripe
**Why:** Accept credit card payments
**Free:** For testing, pay only on real transactions (2.9% + $0.30)
**Alternative:** PayPal, Square (more complex integrations)
**Note:** Use test keys first, live keys after testing

### Railway
**Why:** Host your website and bot 24/7
**Free:** $5 free credits/month, then $5/month
**Alternative:** Render, Heroku, Vercel (all similar pricing)
**Note:** Railway is easiest for Node.js + file handling

### GitHub
**Why:** Version control and Railway integration
**Free:** Yes, forever
**Alternative:** GitLab, Gitea (but Railway integrates with GitHub)
**Note:** Railway auto-deploys when you push to GitHub

---

## Common Issues & Fixes

### Email not sending
- Check SendGrid sender is verified
- Check RECEIPT_FROM matches verified sender
- Wait 30 seconds for SendGrid to send

### Discord bot not responding
- Make sure bot is in your server (use OAuth URL)
- Make sure bot has Send Messages permission
- Check DISCORD_GUILD_ID and DISCORD_CLIENT_ID are correct

### Stripe webhook failing
- Go to Stripe dashboard → Webhooks
- Click event → see error details
- Most common: wrong URL (should end with `/webhook`)

### Launcher won't verify
- Check `license_api.txt` has your Railway URL (no https://)
- Check website is live on Railway
- Check launcher can reach `/api/launcher-auth`

---

## After Deployment: Next Steps

1. **Test with real money**
   - Change STRIPE_SECRET_KEY to `sk_live_...`
   - Use real credit card
   - Confirm email works

2. **Monitor**
   - Check Railway logs daily
   - Check Stripe for failed payments
   - Check Discord bot console for errors

3. **Scale**
   - If traffic grows, Railway auto-scales
   - If emails exceed 100/day, upgrade SendGrid
   - If payments fail, check Stripe account limits

4. **Improve**
   - Add custom domain (not railway subdomain)
   - Add SSL certificate (Railway does this free)
   - Add password reset / license recovery
   - Add refund handling

---

## Testing Checklist

- [ ] SendGrid test: sent yourself an email ✓
- [ ] Discord bot: `/verify` command works ✓
- [ ] Stripe test: used `4242...` card ✓
- [ ] Railway: website loads at your URL ✓
- [ ] Launcher: connects to API host ✓
- [ ] Full flow: purchase → email → bot → launcher ✓

---

## Files You Modified

- `.env` ← your secrets go here
- `.env.template` ← reference copy
- `SETUP_CHECKLIST.md` ← detailed steps
- `validate-env.js` ← checks your .env
- `discord-bot.js` ← Discord integration
- `package.json` ← added bot & validate commands
- `entry.cpp` (external) ← keeps console open until valid license
- `license_api.txt` (external) ← tells launcher where to call

---

## Need Help?

1. Run `npm run validate` to check .env
2. Check Railway logs for server errors
3. Go to SETUP_CHECKLIST.md for detailed steps
4. Ask in Discord / GitHub discussions

Good luck! 🚀
