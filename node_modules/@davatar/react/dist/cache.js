"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedUrl = exports.storeCachedURI = void 0;
// 24 hour TTL
const DEFAULT_CACHE_TTL = 60 * 60 * 24 * 1000;
const getCache = () => {
    const cache = window.localStorage.getItem('davatar/cache');
    if (!cache) {
        window.localStorage.setItem('davatar/cache', '{}');
        return {};
    }
    return JSON.parse(cache);
};
const saveCache = (cache) => window.localStorage.setItem('davatar/cache', JSON.stringify(cache));
const storeCachedURI = (address, resolvedUrl, ttl) => {
    const cache = getCache();
    const normalizedAddress = address.toLowerCase();
    const item = cache[normalizedAddress];
    if (!item || new Date(item.expiresAt) > new Date()) {
        const expireDate = new Date(new Date().getTime() + (ttl || DEFAULT_CACHE_TTL));
        cache[normalizedAddress] = { url: resolvedUrl, expiresAt: expireDate.toString() };
        saveCache(cache);
    }
};
exports.storeCachedURI = storeCachedURI;
/**
 * Get cached resolved url from local storage
 *
 * @param key - an ethereum address or an avatar URI
 */
const getCachedUrl = (key) => {
    const cache = getCache();
    const normalizedKey = key.toLowerCase();
    const item = cache[normalizedKey];
    if (item) {
        if (new Date(item.expiresAt) > new Date()) {
            return item.url;
        }
    }
    return null;
};
exports.getCachedUrl = getCachedUrl;
//# sourceMappingURL=cache.js.map