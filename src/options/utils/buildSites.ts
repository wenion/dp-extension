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

const COLORS = [
  "red",
  "green",
  "blue",
  "orange",
  "purple",
  "cyan",
  "pink",
  "yellow",
] as const;


function randomColor(domain: string): string {
  let hash = 0;

  for (const ch of domain) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }

  return COLORS[hash % COLORS.length];
}

export function buildSites(domains: readonly string[]) {
  return domains.map((domain) => {
    const site = SITE_INFO[domain];

    return {
      name: site?.name ?? domain,
      color: site?.color ?? randomColor(domain),
    };
  });
}