const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const requireAdmin = require('../middleware/requireAdmin');
const { getRegisteredCredential, writeCounter } = require('../utils/webauthnStore');

const router = express.Router();
const { SESSION_COOKIE_NAME, PENDING_COOKIE_NAME, requirePendingAdmin } = requireAdmin;
const COOKIE_MAX_AGE = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years
const PENDING_COOKIE_MAX_AGE = 5 * 60 * 1000; // 5 minutes to complete the security key step

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'Dinolibre Admin';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Single-admin site: one in-memory challenge at a time is enough, no need for a store.
let currentChallenge = null;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

function issueSession(res) {
  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);
  res.cookie(SESSION_COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
  });
}

router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    return res.status(401).json({ message: 'Incorrect password' });
  }

  const credential = getRegisteredCredential();
  if (!credential) {
    // No security key registered yet, password alone is enough (e.g. first-time bootstrap).
    issueSession(res);
    return res.json({ isAdmin: true, requiresSecurityKey: false });
  }

  const pendingToken = jwt.sign({ pendingAdmin: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
  res.cookie(PENDING_COOKIE_NAME, pendingToken, {
    maxAge: PENDING_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
  });
  res.json({ isAdmin: false, requiresSecurityKey: true });
});

router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.clearCookie(PENDING_COOKIE_NAME);
  res.json({ isAdmin: false });
});

router.get('/me', (req, res) => {
  const token = req.cookies[SESSION_COOKIE_NAME];
  const hasSecurityKey = Boolean(getRegisteredCredential());

  if (!token) {
    return res.json({ isAdmin: false, hasSecurityKey });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAdmin: Boolean(payload.isAdmin), hasSecurityKey });
  } catch (err) {
    res.json({ isAdmin: false, hasSecurityKey });
  }
});

// --- Security key registration (adds a new key, requires an existing full admin session) ---

router.post('/webauthn/register-options', requireAdmin, async (req, res) => {
  const existingCredential = getRegisteredCredential();

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: 'admin',
    attestationType: 'none',
    excludeCredentials: existingCredential
      ? [{ id: existingCredential.id, transports: existingCredential.transports }]
      : [],
    authenticatorSelection: {
      residentKey: 'discouraged',
      userVerification: 'preferred',
    },
  });

  currentChallenge = options.challenge;
  res.json(options);
});

router.post('/webauthn/register-verify', requireAdmin, async (req, res) => {
  if (!currentChallenge) {
    return res.status(400).json({ message: 'No registration in progress' });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ message: 'Could not verify security key' });
    }

    const { credential } = verification.registrationInfo;
    writeCounter(credential.counter);

    res.json({
      verified: true,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      transports: (req.body.response && req.body.response.transports) || [],
    });
  } catch (err) {
    console.error('WebAuthn registration verify failed:', err);
    res.status(400).json({ message: 'Could not verify security key' });
  } finally {
    currentChallenge = null;
  }
});

// --- Security key login (second factor, requires the pending cookie from /login) ---

router.post('/webauthn/login-options', requirePendingAdmin, async (req, res) => {
  const credential = getRegisteredCredential();
  if (!credential) {
    return res.status(400).json({ message: 'No security key registered' });
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'preferred',
    allowCredentials: [{ id: credential.id, transports: credential.transports }],
  });

  currentChallenge = options.challenge;
  res.json(options);
});

router.post('/webauthn/login-verify', requirePendingAdmin, async (req, res) => {
  const credential = getRegisteredCredential();
  if (!credential || !currentChallenge) {
    return res.status(400).json({ message: 'No security key login in progress' });
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(401).json({ message: 'Could not verify security key' });
    }

    writeCounter(verification.authenticationInfo.newCounter);
    res.clearCookie(PENDING_COOKIE_NAME);
    issueSession(res);
    res.json({ isAdmin: true });
  } catch (err) {
    console.error('WebAuthn login verify failed:', err);
    res.status(401).json({ message: 'Could not verify security key' });
  } finally {
    currentChallenge = null;
  }
});

module.exports = router;
