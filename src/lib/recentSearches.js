// Client-side recent-search history (no backend needed).
const KEY = "recentSearches";
const MAX = 8;

export const getRecentSearches = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = (term) => {
  const t = String(term || "").trim();
  if (!t) return getRecentSearches();
  try {
    const existing = getRecentSearches().filter((x) => x.toLowerCase() !== t.toLowerCase());
    const next = [t, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentSearches();
  }
};

export const removeRecentSearch = (term) => {
  try {
    const next = getRecentSearches().filter((x) => x.toLowerCase() !== String(term).toLowerCase());
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentSearches();
  }
};

export const clearRecentSearches = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return [];
};
