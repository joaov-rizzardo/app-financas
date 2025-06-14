export function calculatePercentageDiff(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}