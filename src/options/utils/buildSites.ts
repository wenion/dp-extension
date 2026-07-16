type SiteInfo = {
  name: string;
  color: string;
};

const SITE_INFO: Record<string, SiteInfo> = {
  "chatgpt.com": {
    name: "ChatGPT",
    color: "green",
  },
  "docs.google.com": {
    name: "Google Docs",
    color: "blue",
  },
  "claude.ai": {
    name: "Claude",
    color: "orange",
  },
  "gemini.google.com": {
    name: "Gemini",
    color: "purple",
  },
  "overleaf.com": {
    name: "Overleaf",
    color: "green",
  },
};

export function buildSites(domains: readonly string[]) {
  return domains.map((domain) => {
    const site = SITE_INFO[domain];

    return {
      name: site?.name ?? domain,
      color: site?.color ?? "default",
    };
  });
}