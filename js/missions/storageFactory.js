function isLegacyPayload(data) {
    return !!data
        && typeof data === 'object'
        && ('completed' in data || 'score' in data || 'filesystem' in data);
}

export function createScopedStorage(storageKey, version = 1) {
    return {
        save(data) {
            try {
                const payload = {
                    version,
                    savedAt: Date.now(),
                    data,
                };
                localStorage.setItem(storageKey, JSON.stringify(payload));
            } catch (error) {
                console.warn(`Failed to save progress (${storageKey}):`, error);
            }
        },

        load() {
            try {
                const raw = localStorage.getItem(storageKey);
                if (!raw) return null;

                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    if (parsed.version === version && parsed.data && typeof parsed.data === 'object') {
                        return parsed.data;
                    }
                    if (isLegacyPayload(parsed)) {
                        return parsed;
                    }
                }

                return null;
            } catch (error) {
                console.warn(`Failed to load progress (${storageKey}):`, error);
                try {
                    localStorage.removeItem(storageKey);
                } catch (cleanupError) {
                    // Ignore cleanup errors.
                }
                return null;
            }
        },

        clear() {
            localStorage.removeItem(storageKey);
        },
    };
}
