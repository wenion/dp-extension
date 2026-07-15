import { chatgptPlatform } from "./platforms/chatgpt";
import { claudePlatform } from "./platforms/claude";
import { defaultPlatform } from "./platforms/default";
import { geminiPlatform } from "./platforms/gemini";
import { googleDocsPlatform } from "./platforms/googleDocs";
import { overleafPlatform } from "./platforms/overleaf";

import type { Dispose } from "./types";


export interface Platform {
  mount(): Dispose;
}

export const registry: Record<string, Platform> = {
  chatgpt: chatgptPlatform,
  gemini: geminiPlatform,
  claude: claudePlatform,
  overleaf: overleafPlatform,
  googleDocs: googleDocsPlatform,
  default: defaultPlatform,
};

export function initializeSite(origin: string) {
  return (
    registry[origin as keyof typeof registry]
    ?? registry.default
  ).mount();
}