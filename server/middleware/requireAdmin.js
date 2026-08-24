const jwt = require('jsonwebtoken');

const SESSION_COOKIE_NAME = 'adminSession';
const PENDING_COOKIE_NAME = 'adminPending';

function requireAdmin(req, res, next) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Admin login required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

// Password step of 2FA login has passed, but the security key step hasn't yet.
function requirePendingAdmin(req, res, next) {
  const token = req.cookies[PENDING_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Password verification required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.pendingAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.pendingAdmin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

module.exports = requireAdmin;
module.exports.requirePendingAdmin = requirePendingAdmin;
module.exports.SESSION_COOKIE_NAME = SESSION_COOKIE_NAME;
module.exports.PENDING_COOKIE_NAME = PENDING_COOKIE_NAME;
