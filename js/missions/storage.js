const STORAGE_KEY = 'linux-game-save';

export const storage = {
    save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save progress:', e);
        }
    },

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Failed to load progress:', e);
            return null;
        }
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    },
};
