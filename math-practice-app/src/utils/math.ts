/**
 * Returns a random integer between min and max, inclusive.
 */
export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new RangeError('min cannot be greater than max');
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
