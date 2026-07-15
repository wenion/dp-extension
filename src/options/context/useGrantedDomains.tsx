import { useEffect, useState } from "react";


export function useGrantedDomains() {
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    chrome.permissions.getAll().then(({ origins }) => {
      if (!origins) return;
      setDomains(
        origins.map(origin => {
          try {
            return new URL(origin.replace("/*", "")).hostname;
          } catch {
            return origin;
          }
        })
      );
    });
  }, []);

  return domains;
}