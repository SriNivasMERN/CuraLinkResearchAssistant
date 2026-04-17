const cacheStore = new Map();
const pendingStore = new Map();

export function getCacheValue(key) {
  const entry = cacheStore.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return entry.value;
}

export function setCacheValue(key, value, ttlMs = 1000 * 60 * 5) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  return value;
}

export async function getOrSetCacheValue(key, loader, ttlMs = 1000 * 60 * 5) {
  const cachedValue = getCacheValue(key);

  if (cachedValue) {
    return cachedValue;
  }

  const pendingValue = pendingStore.get(key);

  if (pendingValue) {
    return pendingValue;
  }

  const loadPromise = Promise.resolve()
    .then(loader)
    .then((value) => {
      setCacheValue(key, value, ttlMs);
      pendingStore.delete(key);
      return value;
    })
    .catch((error) => {
      pendingStore.delete(key);
      throw error;
    });

  pendingStore.set(key, loadPromise);
  return loadPromise;
}
