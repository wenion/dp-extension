export function getDocumentId(url: string): string | null {
  return url.match(/\/d\/([^/]+)/)?.[1] ?? null;
}
