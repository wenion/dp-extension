export type Platform =
  | "chatgpt"
  | "googleDocs"
  | "gemini"
  | "claude"
  | "overleaf"
  | "default";

export function getPlatform(url: string): Platform {
  const u = new URL(url);

  if (u.host === "chatgpt.com") {
    return "chatgpt";
  }

  if (
    u.host === "docs.google.com" &&
    u.pathname.includes("/document/")
  ) {
    return "googleDocs";
  }

  if (u.host === "gemini.google.com") {
    return "gemini";
  }

  if (u.host === "claude.ai") {
    return "claude";
  }

  if (u.host === "www.overleaf.com") {
    return "overleaf";
  }

  return "default";
}
