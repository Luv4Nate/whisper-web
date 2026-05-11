#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const requiredVars = [
  'PORT',
  'FRONTEND_ORIGIN',
  'PUBLIC_SITE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'DOWNLOAD_TOKEN_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'RECEIPT_FROM',
  'RECEIPT_REPLY_TO',
  'DISCORD_BOT_TOKEN',
  'DISCORD_CLIENT_ID',
  'DISCORD_GUILD_ID',
];

async function validateEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const content = await fs.readFile(envPath, 'utf-8');
    const lines = content.split('\n');

    const envVars = {};
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    });

    console.log('\n✓ Checking .env file...\n');

    let hasErrors = false;

    for (const varName of requiredVars) {
      const value = envVars[varName];
      if (!value) {
        console.log(`✗ MISSING: ${varName}`);
        hasErrors = true;
      } else if (value.includes('YOUR_') || value.includes('HERE') || value === 'false' || value === 'true') {
        console.log(`⚠ PLACEHOLDER: ${varName}=${value}`);
        hasErrors = true;
      } else {
        console.log(`✓ OK: ${varName} is set`);
      }
    }

    if (hasErrors) {
      console.log('\n❌ Your .env file has missing or placeholder values.');
      console.log('Follow the steps in SETUP_CHECKLIST.md to fill them in.\n');
      process.exit(1);
    } else {
      console.log('\n✅ Your .env file looks complete! You can now deploy to Railway.\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message);
    console.log('Make sure .env exists in the current directory.\n');
    process.exit(1);
  }
}

validateEnv();
