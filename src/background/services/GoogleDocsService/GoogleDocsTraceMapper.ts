import type { DocState } from "./types";

import type { UserEvent } from "@/shared/types";

export function transferToUserEvent(
  eventType: string,
  data: DocState
): UserEvent | undefined {
  if (!data.letter) {
    return undefined;
  }

  if (
    data.type !== "insert" &&
    data.type !== "delete" &&
    data.type !== "spellcheck"
  ) {
    return undefined;
  }

  return {
    eventType,
    elementType: data.type,
    textContent: data.preState,

    timestamp:
      data.type === "spellcheck"
        ? data.lastUpdated + data.letter.length
        : data.lastUpdated,

    author: "human",

    startPosition: data.startPosition,
    endPosition: data.endPosition,

    eventValue: data.letter,
    eventState: data.state,

    eventId:
      data.requestId +
      "_" +
      data.index +
      "_" +
      data.acc,
  };
}
