export function findFirstDifference(
  a: string,
  b: string,
): number {
  const length = Math.min(
    a.length,
    b.length,
  );

  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) {
      return i;
    }
  }

  return a.length === b.length
    ? -1
    : length;
}

export function isSubsequence(
  source: string,
  target: string,
): boolean {
  let j = 0;

  for (let i = 0; i < source.length; i++) {
    if (source[i] === target[j]) {
      j++;
    }

    if (j === target.length) {
      return true;
    }
  }

  return j === target.length;
}