import { chatgptPlatform } from "./platforms/chatgpt";
import { claudePlatform } from "./platforms/claude";
import { defaultPlatform } from "./platforms/default";
import { geminiPlatform } from "./platforms/gemini";
import { googleDocsPlatform } from "./platforms/googleDocs";
import { overleafPlatform } from "./platforms/overleaf";

import type { Dispose } from "./types";
import type { Overlay } from "../overlay/Overlay";


export interface Platform {
  mount(overlay?: Overlay): Dispose;
}

export const registry: Record<string, Platform> = {
  chatgpt: chatgptPlatform,
  gemini: geminiPlatform,
  claude: claudePlatform,
  overleaf: overleafPlatform,
  googleDocs: googleDocsPlatform,
  default: defaultPlatform,
};

export function initializeSite(
  platformName: string,
  overlay?: Overlay,
): Dispose {
  return (
    registry[platformName]
    ?? registry.default
  ).mount(overlay);
}