import { Button } from "@heroui/button";

import { env } from "@/config/env";

import { Logo } from "../../components/logo";

export function Header() {
  const homepage = new URL(env.apiUrl);

  const onHomeClick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (tab) {
        if (tab.url === homepage.href) {
          window.close();

          return;
        }
        chrome.tabs.create({ url: homepage.href });
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-black/5">
      <Button isIconOnly className="bg-transparent" onPress={onHomeClick}>
        <Logo size={36} />
      </Button>
      <p className="px-4 text-xs text-slate-600">
        Track, analyse, and understand your writing habits
      </p>
    </div>
  );
}
