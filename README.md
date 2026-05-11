# Whisper Landing Page

A polished red-themed landing page with smooth animations, demo purchase flow, and a backend payment/email system.

## What is included

- `public/index.html` — responsive hero page with red gradients, animated sections, and purchase flow.
- `public/styles.css` — polished styling, animated backgrounds, hover states, and smooth scrolling.
- `public/script.js` — frontend interactions for Get Launcher and Purchase flow.
- `server.js` — backend server to create Stripe checkout sessions and send email receipts using secure environment variables.

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with these values:

```dotenv
PORT=3000
FRONTEND_ORIGIN=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
SUCCESS_URL=http://localhost:3000/?payment=success
CANCEL_URL=http://localhost:3000/?payment=cancel
DOWNLOAD_LINK=https://yourdomain.com/whisper-launcher
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_username
EMAIL_PASS=your_ethereal_password
RECEIPT_FROM=Whisper <service@whisper.example>
RECEIPT_REPLY_TO=support@whisper.example
DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=YOUR_DISCORD_CLIENT_ID
DISCORD_GUILD_ID=YOUR_DISCORD_GUILD_ID
```

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Stripe webhook setup

The receipt email and license generation happen when Stripe confirms a successful payment via webhook. To test locally:

1. Install the Stripe CLI: `npm install -g stripe` or use the installer from `https://stripe.com/docs/stripe-cli`.
2. Log in: `stripe login`.
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/webhook
   ```
4. Copy the webhook secret from the CLI and add it to `.env` as `STRIPE_WEBHOOK_SECRET`.
5. In Stripe Dashboard, subscribe to the `checkout.session.completed` event.

## Discord bot setup

You can run a bot that validates purchased licenses and sends a download link directly in Discord.

1. Create a Discord application and bot in the Discord Developer Portal.
2. Add the bot to your server with the correct OAuth permissions.
3. Add the bot env values to `.env`:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_GUILD_ID`
4. Make sure the server is configured with `LAUNCHER_PATH` and `DOWNLOAD_TOKEN_SECRET` so the bot can send secure launcher download links.
5. Start the bot with:
   ```bash
   npm run bot
   ```

### Launcher setup
- Build the native launcher into `release\whisper.cc.exe`.
- Create `release/license_api.txt` next to the executable with your API hostname, for example `localhost:3000` or `whisper.cc`.
- The launcher will keep the console open until the license is verified and will not proceed until a valid key is entered.

## Test payments without paying

- Use Stripe **Test mode** with the test secret key.
- Use the card number `4242 4242 4242 4242`.
- Any future expiration date and any CVC/email are valid.

This lets you fully test the purchase flow without real charges.

## Free deployment options

### Option 1: GitHub + Vercel

1. Create a GitHub repository.
2. Push the project.
3. Connect the repo to Vercel.
4. Add environment variables in Vercel settings.

### Option 2: GitHub + Render

1. Create a GitHub repository.
2. Add a Web Service in Render.
3. Set `Start Command` to `npm start`.
4. Add the same environment variables.

### Option 3: GitHub Pages + free server backend

- Use GitHub Pages for the static frontend.
- Host `server.js` on Render or Railway free.
- Point the frontend `fetch()` to the backend URL.

## Security best practices

- Keep keys in `.env` only; never commit them.
- Use HTTPS for deployed sites.
- Restrict CORS to your frontend origin.
- Validate Stripe webhook signatures server-side.
- Send receipts from the backend, not from client-side code.

## What to customize

- Replace product text "Whisper" and price with your final details.
- Replace email templates in `server.js` with your brand voice.
- Set your own `SUCCESS_URL` and `CANCEL_URL`.
