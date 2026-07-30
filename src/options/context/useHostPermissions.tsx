import { useCallback, useEffect, useState } from "react";

export function useHostPermissions() {
  const [domains, setDomains] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const { origins } = await chrome.permissions.getAll();

    setDomains(
      (origins ?? []).map(origin => {
        try {
          return new URL(origin.replace("/*", "")).hostname;
        } catch {
          return origin;
        }
      }),
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const request = useCallback(async (input: string) => {
    let value = input.trim();

    if (!value) {
      throw new Error("Please enter a domain.");
    }

    if (!/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }

    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Only HTTP and HTTPS are supported.");
    }

    if (url.pathname !== "/" || url.search || url.hash) {
      throw new Error("Please enter a domain only.");
    }

    const granted = await chrome.permissions.request({
      permissions: ["scripting"],
      origins: [`${url.origin}/*`],
    });

    if (granted) {
      await refresh();
    }

    return granted;
  }, [refresh]);

  return {
    domains,
    refresh,
    request,
  };
}
