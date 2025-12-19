const DEFAULT_TTL_MS = 60 * 1000; // 1 minute

// Simple in-memory cache with TTL
// NOTE: This is per-server-instance. For multiple servers, use Redis or similar.
const store = new Map();

function buildKey(parts) {
  return parts.join(':');
}

function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

// Delete a specific key
function del(key) {
  store.delete(key);
}

// Delete keys that start with a prefix (e.g. all "movies:" keys)
function delByPrefix(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

// Clear entire cache
function clear() {
  store.clear();
}

module.exports = {
  buildKey,
  set,
  get,
  del,
  delByPrefix,
  clear,
  DEFAULT_TTL_MS
};


