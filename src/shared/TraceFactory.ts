import type { UserEvent } from "@/shared/types";

export function createNavigationTrace(
  content?: string,
): UserEvent {
 return {
    eventType: "navigate",
    eventState: content,
    timestamp: Date.now(),
  };
}

export function createPageFocusTrace(): UserEvent {
 return {
    eventType: "focus",
    timestamp: Date.now(),
  };
}