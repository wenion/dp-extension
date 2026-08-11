export function getDocumentId(
  url: string
): string | undefined {
  try {
    const { hostname, pathname } = new URL(url);

    if (
      hostname !== "docs.google.com" ||
      !pathname.startsWith("/document/d/")
    ) {
      return undefined;
    }

    return pathname.split("/")[3] ?? null;
  } catch {
    return undefined;
  }
}
