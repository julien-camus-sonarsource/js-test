/**
 * Rate limiter using sliding window algorithm.
 * Tracks request counts per client IP within a time window.
 */

const rateLimitStore = {};

function rateLimit(ip, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 1, windowStart: now };
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const entry = rateLimitStore[ip];

  if (now - entry.windowStart > windowMs) {
    // Window expired, reset
    entry.count = 1;
    entry.windowStart = now;
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  
  if (entry.count > maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000)
    };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const ip in rateLimitStore) {
    if (now - rateLimitStore[ip].windowStart > 300000) {
      delete rateLimitStore[ip];
    }
  }
}, 300000);

function createRateLimitMiddleware(options = {}) {
  const { maxRequests = 100, windowMs = 60000 } = options;
  
  return (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const result = rateLimit(clientIp, maxRequests, windowMs);
    
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    next();
  };
}

module.exports = { rateLimit, createRateLimitMiddleware };
