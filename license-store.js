import fs from 'fs/promises';
import path from 'path';

const licenseFile = path.join(process.cwd(), 'licenses.json');

async function readLicenses() {
  try {
    const content = await fs.readFile(licenseFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(licenseFile, '[]', 'utf8');
      return [];
    }
    throw error;
  }
}

async function writeLicenses(licenses) {
  await fs.writeFile(licenseFile, JSON.stringify(licenses, null, 2), 'utf8');
}

export async function addLicense(entry) {
  const licenses = await readLicenses();
  licenses.push(entry);
  await writeLicenses(licenses);
  return entry;
}

function normalizeEmail(value) {
  return value?.trim().toLowerCase() || '';
}

function normalizeLicense(value) {
  return value?.trim().toLowerCase() || '';
}

export async function validateLicense(email, license) {
  const licenses = await readLicenses();
  const wantEmail = normalizeEmail(email);
  const wantKey = normalizeLicense(license);
  return licenses.find(
    (item) => normalizeEmail(item.email) === wantEmail && normalizeLicense(item.license) === wantKey
  );
}

/**
 * Validates email+license for the native launcher. Optionally binds Windows MachineGuid
 * on first successful check (one machine per license). Set DISABLE_HWID_LOCK=true to skip binding.
 */
export async function bindOrVerifyHwid(email, license, hwid) {
  const record = await validateLicense(email, license);
  if (!record) {
    return { ok: false, error: 'invalid_license' };
  }

  if (process.env.DISABLE_HWID_LOCK === 'true') {
    return { ok: true, activated: false };
  }

  const h = String(hwid ?? '').trim();
  if (h.length < 8) {
    return { ok: false, error: 'invalid_hwid' };
  }

  const licenses = await readLicenses();
  const wantEmail = normalizeEmail(email);
  const wantKey = normalizeLicense(license);
  const idx = licenses.findIndex(
    (item) => normalizeEmail(item.email) === wantEmail && normalizeLicense(item.license) === wantKey
  );
  if (idx === -1) {
    return { ok: false, error: 'invalid_license' };
  }

  const rec = licenses[idx];
  const bound = rec.hwid != null ? String(rec.hwid).trim() : '';

  if (!bound) {
    licenses[idx] = { ...rec, hwid: h, hwidActivatedAt: new Date().toISOString() };
    await writeLicenses(licenses);
    return { ok: true, activated: true };
  }
  if (bound === h) {
    return { ok: true, activated: false };
  }
  return { ok: false, error: 'hwid_mismatch' };
}
