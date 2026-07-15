// background/message/router.ts

import { ContentScriptService } from "../services/ContentScriptService";

export function startStorageListener(
  content: ContentScriptService
) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;

    if (changes.profile) {
      console.log("local profile", changes.profile)
    }
    else if (changes.token) {
      console.log("local token", changes.token)
    }
    else if (changes.session) {
      console.log("local session", changes.session)
    }
    else if (changes.pageState) {
      console.log("local pageState", changes.pageState)
    }
    else if (changes.pageMounted) {
      console.log("local pageMounted", changes.pageMounted)
    }
  });
}