import type { UserEvent } from "@/shared/types";

export function createNavigationTrace(): UserEvent {
 return {
    eventType: "navigate",
    timestamp: Date.now(),
  };
}

export function creatPageFocusTrace(): UserEvent {
 return {
    eventType: "focus",
    timestamp: Date.now(),
  };
}