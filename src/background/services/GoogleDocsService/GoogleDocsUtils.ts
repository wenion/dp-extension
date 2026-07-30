export function getDocumentId(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);

    if (
      hostname !== "docs.google.com" ||
      !pathname.startsWith("/document/d/")
    ) {
      return null;
    }

    return pathname.split("/")[3] ?? null;
  } catch {
    return null;
  }
}
