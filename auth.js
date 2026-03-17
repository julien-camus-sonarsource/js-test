/**
 * User authentication and session management utilities
 */

const crypto = require('crypto');

// Bug 1: SQL injection vulnerability - concatenating user input directly
function findUserByEmail(db, email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return db.execute(query);
}

// Bug 2: Hardcoded secret / credential leak
const JWT_SECRET = "super_secret_key_12345";

function generateToken(userId) {
  const payload = JSON.stringify({ userId, exp: Date.now() + 3600000 });
  return crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
}

// Bug 3: Missing null check leading to potential crash
function getUserDisplayName(user) {
  return user.profile.firstName + ' ' + user.profile.lastName;
}

// Bug 4: Insecure password comparison (timing attack vulnerable)
function verifyPassword(inputPassword, storedHash) {
  const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  return inputHash === storedHash;
}

module.exports = { findUserByEmail, generateToken, getUserDisplayName, verifyPassword };
