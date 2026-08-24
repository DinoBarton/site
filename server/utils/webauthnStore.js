const fs = require('fs');
const path = require('path');

const COUNTER_FILE = path.join(__dirname, '..', 'data', 'webauthn-counter.json');

function readCounter() {
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf8');
    return JSON.parse(raw).counter || 0;
  } catch (err) {
    return 0;
  }
}

function writeCounter(counter) {
  fs.mkdirSync(path.dirname(COUNTER_FILE), { recursive: true });
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ counter }));
}

// Registered credential lives in env (static); only the replay counter changes at runtime.
function getRegisteredCredential() {
  const {
    ADMIN_WEBAUTHN_CREDENTIAL_ID,
    ADMIN_WEBAUTHN_PUBLIC_KEY,
    ADMIN_WEBAUTHN_TRANSPORTS,
  } = process.env;

  if (!ADMIN_WEBAUTHN_CREDENTIAL_ID || !ADMIN_WEBAUTHN_PUBLIC_KEY) {
    return null;
  }

  return {
    id: ADMIN_WEBAUTHN_CREDENTIAL_ID,
    publicKey: Buffer.from(ADMIN_WEBAUTHN_PUBLIC_KEY, 'base64url'),
    counter: readCounter(),
    transports: ADMIN_WEBAUTHN_TRANSPORTS
      ? ADMIN_WEBAUTHN_TRANSPORTS.split(',')
      : undefined,
  };
}

module.exports = { readCounter, writeCounter, getRegisteredCredential };
