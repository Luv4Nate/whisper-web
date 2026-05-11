import { issueDownloadToken } from './download-token.js';

/**
 * After license validation, returns a URL the customer can use to fetch the launcher.
 * Uses signed URL + LAUNCHER_PATH when configured; otherwise DOWNLOAD_LINK (or origin fallback).
 * File existence is checked on GET /api/download-launcher (so the Discord bot can run without a local copy of the exe).
 */
export async function resolveDownloadUrlForValidatedUser({ email, license, env = process.env }) {
  const allowedOrigin = env.FRONTEND_ORIGIN || 'http://localhost:3000';
  const publicSiteUrl = (env.PUBLIC_SITE_URL || allowedOrigin).replace(/\/$/, '');
  const fallback = env.DOWNLOAD_LINK || `${publicSiteUrl}/download`;
  const launcherPath = env.LAUNCHER_PATH;
  const secret = env.DOWNLOAD_TOKEN_SECRET;

  if (!launcherPath || !secret) {
    return fallback;
  }

  const token = issueDownloadToken(email, license, secret);
  if (!token) {
    return fallback;
  }

  return `${publicSiteUrl}/api/download-launcher?token=${encodeURIComponent(token)}`;
}
