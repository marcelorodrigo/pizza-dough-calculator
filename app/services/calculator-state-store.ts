export interface CalculatorStateStore {
  load(key: string): unknown | null
  save(key: string, value: unknown): void
}

interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export const STATE_VERSION = 1
export const STATE_STORAGE_PREFIX = 'dough-calculator:'

/** Creates a versioned state store backed by the supplied storage implementation. */
export function createCalculatorStateStore(storage: StorageLike): CalculatorStateStore {
  return {
    /** Loads and validates a versioned value, returning null when unavailable. */
    load(key) {
      try {
        const storedValue = storage.getItem(`${STATE_STORAGE_PREFIX}${key}`)
        if (!storedValue) return null
        const parsed: unknown = JSON.parse(storedValue)
        if (
          typeof parsed !== 'object'
          || parsed === null
          || !('version' in parsed)
          || parsed.version !== STATE_VERSION
          || !('data' in parsed)
        ) {
          return null
        }
        return parsed.data
      } catch {
        return null
      }
    },
    /** Persists a value with the current state version, ignoring storage failures. */
    save(key, value) {
      try {
        storage.setItem(
          `${STATE_STORAGE_PREFIX}${key}`,
          JSON.stringify({ version: STATE_VERSION, data: value })
        )
      } catch {
        // Persistence is optional; calculations remain available in memory.
      }
    }
  }
}
