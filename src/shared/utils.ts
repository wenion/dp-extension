export function extractGoogleDocsId(
  url: string,
): string | undefined {
  try {
    const { hostname, pathname } = new URL(url);

    if (hostname !== "docs.google.com") {
      return undefined;
    }

    const match =
      pathname.match(/^\/document\/d\/([^/]+)/);

    return match?.[1];
  } catch {
    return undefined;
  }
}