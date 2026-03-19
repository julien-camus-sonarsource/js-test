/**
 * HTTP client with retry logic, circuit breaker, and token refresh.
 *
 * States: Idle → Authenticating (token refresh) → Ready → [Request in-flight]
 *         → Retrying (backoff) → Failed [circuit open] → Idle (after cooldown)
 */

const MAX_RETRIES = 3;
const CIRCUIT_OPEN_DURATION_MS = 30_000;
const BACKOFF_BASE_MS = 200;

class CircuitBreaker {
  #state = 'closed'; // closed | open | half-open
  #failureCount = 0;
  #openedAt = null;
  #threshold;

  constructor(threshold = 5) {
    this.#threshold = threshold;
  }

  get state() { return this.#state; }

  recordSuccess() {
    this.#failureCount = 0;
    this.#state = 'closed';
  }

  recordFailure() {
    this.#failureCount++;
    if (this.#failureCount >= this.#threshold) {
      this.#state = 'open';
      this.#openedAt = Date.now();
    }
  }

  isAllowed() {
    if (this.#state === 'closed') return true;
    if (this.#state === 'open') {
      if (Date.now() - this.#openedAt > CIRCUIT_OPEN_DURATION_MS) {
        this.#state = 'half-open';
        return true;
      }
      return false;
    }
    return true; // half-open: allow one probe
  }
}

class TokenStore {
  #token = null;
  #expiresAt = 0;

  set(token, ttlSeconds) {
    this.#token = token;
    this.#expiresAt = Date.now() + ttlSeconds * 1000;
  }

  get() {
    if (!this.#token || Date.now() >= this.#expiresAt) return null;
    return this.#token;
  }

  clear() { this.#token = null; }
}

class RetryableHttpClient {
  #breaker = new CircuitBreaker();
  #tokens = new TokenStore();
  #refreshToken;

  constructor(refreshToken) {
    this.#refreshToken = refreshToken;
  }

  async #authenticate() {
    const { token, ttl } = await this.#refreshToken();
    this.#tokens.set(token, ttl);
    return token;
  }

  async #getToken() {
    return this.#tokens.get() ?? await this.#authenticate();
  }

  async request(url, options = {}) {
    if (!this.#breaker.isAllowed()) {
      throw new Error(`Circuit open — service unavailable (retry after ${CIRCUIT_OPEN_DURATION_MS / 1000}s)`);
    }

    const token = await this.#getToken();
    let lastError;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const backoff = BACKOFF_BASE_MS * 2 ** (attempt - 1) + Math.random() * 100;
        await new Promise(r => setTimeout(r, backoff));
      }

      try {
        const res = await fetch(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          // Token expired mid-flight — refresh and retry once
          this.#tokens.clear();
          const fresh = await this.#authenticate();
          const retry = await fetch(url, {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${fresh}` },
          });
          if (!retry.ok) throw new Error(`HTTP ${retry.status}`);
          this.#breaker.recordSuccess();
          return retry;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.#breaker.recordSuccess();
        return res;
      } catch (err) {
        lastError = err;
        this.#breaker.recordFailure();
      }
    }

    throw new Error(`Request failed after ${MAX_RETRIES} retries: ${lastError.message}`);
  }
}

module.exports = { RetryableHttpClient, CircuitBreaker, TokenStore };
