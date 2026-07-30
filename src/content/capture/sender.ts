import type { UserEvent, GoogleDocsMeta } from "@/shared/types";

export const sendUserTrace = (
  trace: UserEvent
) => {
  chrome.runtime.sendMessage({
    type: "TRACE/USER",
    source: "CONTENT",
    payload: { trace }
  })
}

export const sendGoogleDocsTrace = (
  trace: GoogleDocsMeta
) => {
  chrome.runtime.sendMessage({
    type: "TRACE/GOOGLE",
    source: "CONTENT",
    payload: { trace }
  })
}