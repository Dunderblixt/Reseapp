const STORAGE_KEY = "nordtravel:explorer-query";

// Remembers the explorer query so it survives navigation to other pages.
export function saveExplorerQuery(query: string) {
  try {
    if (query) {
      window.sessionStorage.setItem(STORAGE_KEY, query);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures; the explorer still works without persistence.
  }
}

// Reads the last explorer query, or an empty string when there is none.
export function readExplorerQuery(): string {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}
