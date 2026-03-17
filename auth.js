/**
 * User authentication and session management utilities
 */

const crypto = require('crypto');

// Fixed: Use parameterized query to prevent SQL injection
function findUserByEmail(db, email) {
  const query = "SELECT * FROM users WHERE email = ?";
  return db.execute(query, [email]);
}

// Fixed: Read secret from environment variable
function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  const payload = JSON.stringify({ userId, exp: Date.now() + 3600000 });
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Fixed: Add null-safe access with optional chaining and fallback
function getUserDisplayName(user) {
  const first = user?.profile?.firstName ?? 'Unknown';
  const last = user?.profile?.lastName ?? '';
  return `${first} ${last}`.trim();
}

// Fixed: Use timing-safe comparison to prevent timing attacks
function verifyPassword(inputPassword, storedHash) {
  const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
}

module.exports = { findUserByEmail, generateToken, getUserDisplayName, verifyPassword };
