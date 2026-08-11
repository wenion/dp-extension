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

export function createSessionStartTrace(): UserEvent {
 return {
    eventType: "session start",
    timestamp: Date.now(),
  };
}

export function createSessionEndTrace(): UserEvent {
 return {
    eventType: "session end",
    timestamp: Date.now(),
  };
}
