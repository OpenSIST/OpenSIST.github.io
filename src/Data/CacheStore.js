import localforage from "localforage";

export const CACHE_EXPIRATION = 60 * 60 * 1000;
export const FOREGROUND_PRIORITY = "auto";
export const BACKGROUND_PRIORITY = "low";
export const CACHE_CLEARED_EVENT = "opensist-cache-cleared";

const CACHE_SCHEMA_VERSION = 1;
const memoryCache = new Map();
const latestRequestVersions = new Map();
const foregroundRequests = new Map();
const foregroundLoads = new Map();
const backgroundLoads = new Map();
const writeQueues = new Map();
let cacheEpoch = 0;

function nextRequestVersion(key) {
    const version = (latestRequestVersions.get(key) ?? 0) + 1;
    latestRequestVersions.set(key, version);
    return version;
}

function normalizeCacheEntry(entry, legacyFields = []) {
    if (!entry) {
        return null;
    }
    if (entry.schemaVersion === CACHE_SCHEMA_VERSION && Object.hasOwn(entry, "value")) {
        return entry;
    }
    const updatedAt = entry.updatedAt ?? entry.Date;
    if (!updatedAt) {
        return null;
    }
    const legacyField = legacyFields.find((field) => Object.hasOwn(entry, field));
    if (!legacyField) {
        return null;
    }
    return {
        value: entry[legacyField],
        updatedAt,
        schemaVersion: CACHE_SCHEMA_VERSION,
    };
}

function enqueueCacheWrite(key, write) {
    const previousWrite = writeQueues.get(key) ?? Promise.resolve();
    const pendingWrite = previousWrite.catch(() => {
    }).then(write);
    writeQueues.set(key, pendingWrite);
    return pendingWrite.finally(() => {
        if (writeQueues.get(key) === pendingWrite) {
            writeQueues.delete(key);
        }
    });
}

export function isCacheEntryExpired(entry, forceRefresh = false) {
    return forceRefresh || !entry || (Date.now() - entry.updatedAt) > CACHE_EXPIRATION;
}

export async function readCacheEntry(key, {legacyFields = [], requestEpoch = cacheEpoch} = {}) {
    if (requestEpoch === cacheEpoch && memoryCache.has(key)) {
        return memoryCache.get(key);
    }
    const entry = normalizeCacheEntry(await localforage.getItem(key), legacyFields);
    if (requestEpoch !== cacheEpoch) {
        return null;
    }
    if (entry) {
        memoryCache.set(key, entry);
    }
    return entry;
}

export async function writeCacheValue(key, value, {requestEpoch = cacheEpoch, requestVersion} = {}) {
    if (requestEpoch !== cacheEpoch) {
        return false;
    }
    const version = requestVersion ?? nextRequestVersion(key);
    if (version < (latestRequestVersions.get(key) ?? 0)) {
        return false;
    }
    const entry = {
        value,
        updatedAt: Date.now(),
        schemaVersion: CACHE_SCHEMA_VERSION,
    };
    memoryCache.set(key, entry);
    return enqueueCacheWrite(key, async () => {
        if (requestEpoch !== cacheEpoch || version < (latestRequestVersions.get(key) ?? 0)) {
            return false;
        }
        await localforage.setItem(key, entry);
        return true;
    });
}

export async function removeCacheValue(key, {requestEpoch = cacheEpoch, requestVersion} = {}) {
    if (requestEpoch !== cacheEpoch) {
        return false;
    }
    const version = requestVersion ?? nextRequestVersion(key);
    if (version < (latestRequestVersions.get(key) ?? 0)) {
        return false;
    }
    memoryCache.delete(key);
    return enqueueCacheWrite(key, async () => {
        if (requestEpoch !== cacheEpoch || version < (latestRequestVersions.get(key) ?? 0)) {
            return false;
        }
        await localforage.removeItem(key);
        return true;
    });
}

export async function clearDataCache() {
    const theme = await localforage.getItem("theme");
    cacheEpoch += 1;
    await Promise.allSettled([...writeQueues.values()]);
    memoryCache.clear();
    latestRequestVersions.clear();
    foregroundRequests.clear();
    foregroundLoads.clear();
    backgroundLoads.clear();
    await localforage.clear();
    if (theme) {
        await localforage.setItem("theme", theme);
    }
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CACHE_CLEARED_EVENT));
    }
}

export function getCacheEpoch() {
    return cacheEpoch;
}

export function beginCacheRequests(keys, priority = FOREGROUND_PRIORITY, requestEpoch = cacheEpoch) {
    if (requestEpoch !== cacheEpoch) {
        return {
            keys: [],
            epoch: requestEpoch,
            versionFor: () => undefined,
            release() {
            },
        };
    }
    const isBackground = priority === BACKGROUND_PRIORITY;
    const requestKeys = isBackground
        ? keys.filter((key) => !foregroundRequests.has(key))
        : keys;
    const versions = new Map(requestKeys.map((key) => [key, nextRequestVersion(key)]));
    if (!isBackground) {
        requestKeys.forEach((key) => foregroundRequests.set(key, (foregroundRequests.get(key) ?? 0) + 1));
    }

    return {
        keys: requestKeys,
        epoch: requestEpoch,
        versionFor: (key) => versions.get(key),
        release() {
            if (isBackground) {
                return;
            }
            requestKeys.forEach((key) => {
                const remaining = (foregroundRequests.get(key) ?? 1) - 1;
                if (remaining > 0) {
                    foregroundRequests.set(key, remaining);
                } else {
                    foregroundRequests.delete(key);
                }
            });
        },
    };
}

export async function loadCachedValue({
                                          forceRefresh = false,
                                          key,
                                          legacyFields = [],
                                          load,
                                          priority = FOREGROUND_PRIORITY,
                                      }) {
    const isBackground = priority === BACKGROUND_PRIORITY;
    const requestEpoch = cacheEpoch;
    const entry = await readCacheEntry(key, {legacyFields, requestEpoch});
    if (requestEpoch !== cacheEpoch) {
        return entry?.value;
    }
    if (!isCacheEntryExpired(entry, forceRefresh)) {
        return entry.value;
    }
    if (isBackground && foregroundRequests.has(key)) {
        return entry?.value;
    }
    const loadMap = isBackground ? backgroundLoads : foregroundLoads;
    if (loadMap.has(key)) {
        return loadMap.get(key);
    }

    const request = beginCacheRequests([key], priority, requestEpoch);
    if (request.keys.length === 0) {
        return entry?.value;
    }
    const pendingLoad = (async () => {
        try {
            const value = await load();
            const cacheWrite = writeCacheValue(key, value, {
                requestEpoch: request.epoch,
                requestVersion: request.versionFor(key),
            });
            if (isBackground) {
                await cacheWrite;
            } else {
                void cacheWrite.catch(() => {
                });
            }
            return value;
        } finally {
            request.release();
        }
    })();
    loadMap.set(key, pendingLoad);
    return pendingLoad.finally(() => {
        if (loadMap.get(key) === pendingLoad) {
            loadMap.delete(key);
        }
    });
}
