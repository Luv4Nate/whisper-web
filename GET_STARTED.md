# Whisper Complete Setup Guide

**Read this first.** It explains everything you need to do.

---

## What is Whisper?

A complete bot + launcher system with:
- 🛒 Stripe payments ($1.99 purchases)
- 📧 Automatic license key emails (Brevo)
- 🤖 Discord bot (`/verify` command)
- 🎮 Native launcher that verifies licenses
- 🔐 HWID machine binding (prevent license resale)
- ☁️ Hosted on Railway (free tier included)

---

## The Complete Flow (What Your Customers See)

1. **Customer visits your website**
   - Clicks "Purchase"
   - Enters email
   - Pays $1.99 with Stripe

2. **Stripe processes payment**
   - Confirms it to your server
   - Server generates random license key

3. **Customer gets email**
   - Receipt with license key
   - (Brevo sends this automatically)

4. **Customer goes to Discord**
   - Types `/verify email license`
   - Bot responds with launcher download link
   - (Optional - they could also use website redeem button)

5. **Customer downloads launcher**
   - Gets `whisper.cc.exe`
   - Runs it on their PC

6. **Launcher verifies license**
   - Console stays open until they enter correct key
   - Their machine HWID gets bound to license
   - Once verified, menu shows and they can use it

---

## Setup Instructions

There are **3 guide files.** Read them in order:

### 1. **QUICK_REFERENCE.md** (5 minutes)
   - Overview of what you need
   - Quick table of API keys to get
   - Perfect for printing and keeping by your desk

### 2. **SETUP_CHECKLIST.md** (30 minutes - most detailed)
   - Step-by-step for every service
   - Exactly where to click in each website
   - Copy/paste values as you go
   - **Start here if you're lost**

### 3. **RAILWAY_DEPLOYMENT.md** (20 minutes)
   - After checklist, use this to deploy
   - Railway-specific setup
   - Testing after deployment

---

## The Process in 3 Phases

### PHASE 1: Get API Keys (30 minutes)
You'll create free accounts and copy values:

- **Brevo** → email API key
- **Discord** → bot token + IDs
- **Stripe** → payment secret + webhook secret
- **Railway** → hosting (auto-generated)
- **GitHub** → version control

Follow: **SETUP_CHECKLIST.md**

### PHASE 2: Fill in .env File (5 minutes)
Copy the template and fill in your values:

```bash
cp .env.template .env
# Edit .env with your values
npm run validate
```

If `npm run validate` shows all ✓, you're ready.

### PHASE 3: Deploy to Railway (10 minutes)
Push to GitHub, Railway auto-deploys, add env vars, test.

Follow: **RAILWAY_DEPLOYMENT.md**

---

## Files in This Directory

### Setup Files
- **SETUP_CHECKLIST.md** ← Start here (most detailed step-by-step)
- **QUICK_REFERENCE.md** ← Print this, keep by your desk
- **RAILWAY_DEPLOYMENT.md** ← After you have API keys
- **.env.template** ← Reference for what values to add
- **validate-env.js** ← Script to check your .env file

### Code Files (Already set up for you)
- **server.js** ← Main backend (Stripe, email, license validation)
- **discord-bot.js** ← Discord bot (`/verify` command)
- **license-store.js** ← License database (JSON file)
- **download-token.js** ← Secure download URLs
- **resolve-download.js** ← Maps license to launcher download

### External Launcher (Separate folder)
- **c:\Users\nate\Desktop\whisper\amber\entry.cpp** ← Console stays open until valid license
- **c:\Users\nate\Desktop\whisper\release\license_api.txt** ← Points to your server (update after deployment)

---

## Quick Start (TL;DR)

1. Open **SETUP_CHECKLIST.md**
2. Follow steps to get API keys from 5 services
3. Fill in `.env` file with your keys
4. Run `npm run validate`
5. Push to GitHub
6. Follow **RAILWAY_DEPLOYMENT.md** to deploy on Railway
7. Test the full flow
8. Go live

**Total time: ~1 hour first time**

---

## The 5 Services (Why You Need Each)

| Service | Purpose | Cost | Alternative |
|---------|---------|------|-------------|
| **SendGrid** | Send license key emails | Free (100/day) | Gmail (complex), AWS SES |
| **Discord** | Bot for `/verify` command | Free | Slack, custom website |
| **Stripe** | Accept credit card payments | Pay-per-transaction | PayPal, Square |
| **Railway** | Host website 24/7 | Free $5/mo | Render, Heroku, Vercel |
| **GitHub** | Code version control | Free | GitLab, Gitea |

**You don't need to use all of these.** Discord bot is optional, but highly recommended.

---

## Before You Start

### Have Ready
- [ ] Email address for SendGrid
- [ ] Discord server to add bot to
- [ ] GitHub account
- [ ] A domain name (optional, but nice)

### Create These Accounts (Free)
- [ ] SendGrid - https://sendgrid.com
- [ ] Discord Dev Portal - https://discord.com/developers/applications
- [ ] Stripe - https://stripe.com
- [ ] Railway - https://railway.app
- [ ] GitHub - https://github.com (if needed)

### Time Required
- **First time:** ~1 hour (getting API keys + deployment)
- **After that:** 5 minutes (push code → auto-deploys)

---

## Common Questions

**Q: Is this free?**
A: First month is free (Railway free tier + free API quotas). After that: ~$5-15/month depending on traffic.

**Q: Can I accept international payments?**
A: Yes, Stripe supports 130+ countries automatically.

**Q: Can customers buy multiple licenses?**
A: Yes, each purchase generates a new key. They can verify multiple licenses per machine.

**Q: What if I want to change the price?**
A: Change it in Stripe → Products (instant). Code doesn't change.

**Q: Can I remove the Discord bot?**
A: Yes, delete `discord-bot.js` and remove from `package.json` scripts. Customers can still use website redeem button.

**Q: How do I handle refunds?**
A: Go to Stripe Dashboard → Payment → Refund. Automatically deactivates their license in your system.

**Q: Can I host my own launcher file?**
A: Yes. Instead of `LAUNCHER_PATH=./release/whisper.cc.exe`, set `DOWNLOAD_LINK=https://yourhost.com/launcher.exe`

---

## Deployment Options

### Option 1: Railway (Recommended)
- Easiest for beginners
- Auto-deploys from GitHub
- Free $5 credit/month
- Good for 1000s of users

### Option 2: Render
- Similar to Railway
- Free tier available
- Slightly slower cold starts

### Option 3: Heroku
- Easier than building yourself
- Paid tier ($7/month minimum)
- Less free tier than Railway

### Option 4: Self-host
- Full control
- More technical setup
- Need to manage server yourself

**I recommend Railway for you.** Follow RAILWAY_DEPLOYMENT.md.

---

## After Going Live

### Day 1
- Test a real purchase
- Confirm email arrives
- Test bot response
- Verify launcher works

### Week 1
- Monitor Stripe dashboard for issues
- Check Railway logs for errors
- Verify customer feedback in Discord

### Month 1
- Review Stripe revenue
- Check bounce rates in SendGrid
- Plan improvements

### Ongoing
- Keep Railway env vars updated
- Monitor server logs
- Handle customer support
- Add new features as needed

---

## Next Steps

**Don't overthink this. Follow this order:**

1. **Right now:** Read QUICK_REFERENCE.md (5 min)
2. **Next:** Open SETUP_CHECKLIST.md (30 min)
3. **Then:** Create accounts + copy API keys
4. **Fill in:** .env file
5. **Run:** `npm run validate`
6. **Deploy:** Follow RAILWAY_DEPLOYMENT.md
7. **Test:** Full purchase flow
8. **Launch:** Tell customers about it

---

## Need Help?

1. **Something broke?**
   - Check Railway logs (web service → Logs)
   - Run `npm run validate`
   - Check Stripe dashboard for webhook failures

2. **Don't understand a step?**
   - Re-read the relevant guide section
   - Use QUICK_REFERENCE.md as a checklist

3. **API key is wrong?**
   - Delete the value in Railway Variables
   - Go back to that service's dashboard
   - Copy the value again
   - Paste it in Railway
   - Railway auto-redeploys (1-2 min)

4. **Bot not working?**
   - Make sure bot is in your Discord server
   - Check bot has permissions (Send Messages)
   - Verify DISCORD_BOT_TOKEN is in Railway Variables

---

## You've Got This 🚀

This system is used by thousands of indie developers. You have:
- ✅ Professional payment processing
- ✅ Automatic email receipts
- ✅ Discord integration
- ✅ HWID machine binding
- ✅ Free hosting tier

Take it one step at a time. Start with QUICK_REFERENCE.md.

**Questions? Read SETUP_CHECKLIST.md - it has all the details.**

Good luck! 💪
