let idCounter = 0;

/**
 * Creates a unique identifier for questions, attempts, and sessions.
 */
export function createId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

/** Resets the counter — for tests only. */
export function resetIdCounter(): void {
  idCounter = 0;
}
