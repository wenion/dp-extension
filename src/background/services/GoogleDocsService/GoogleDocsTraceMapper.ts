import type { UserEvent } from "@/shared/types";
import type { DocState, GoogleDocType } from "./types";


export function transferToUserEventTrace(eventType: string, data: DocState): UserEvent[] {
  const traces = [] as UserEvent[];

  if (!data.letter) return [];

  if (data.type === "insert") {
    for (let i = 0; i < data.letter.length; i++) {
      const key = data.letter[i] === "\n" ? "Enter" : data.letter[i] === " " ? "Space" : data.letter[i]; //"[Enter]"

      const trace : UserEvent = {
        eventType: eventType,
        elementType: data.type,
        textContent: data.preState,
        code: key,
        key: key,
        timestamp: data.lastUpdated + i,
        author: "human",
        startPosition: data.startPosition + i,
        endPosition: data.startPosition + i + 1,
        eventValue: data.letter[i],
        eventState: data.state.slice(0, data.startPosition + i) + data.letter[i] + data.state.slice(data.endPosition),
        // url: data.url,
        eventId: data.requestId + "_"+ data.index + "_" + (data.acc + i),
      }

      traces.push(trace);
    }
    return traces;
  }
  else if (data.type === "delete") {
    const key = data.letter === "\n" ? "Enter" : data.letter === " " ? "Space" : data.letter; //"[Enter]"
    const trace : UserEvent = {
      eventType: eventType,
      elementType: data.type,
      // source: "UserEvent",
      textContent: data.preState,
      code: key,
      key: key,
      timestamp: data.lastUpdated,
      author: "human",
      startPosition: data.startPosition,
      endPosition: data.endPosition,
      eventValue: data.letter,
      eventState: data.state,
      // url: data.url,
      eventId: data.requestId + "_"+ data.index + "_" + data.acc,
    }

    traces.push(trace);
    return traces;
  }
  else if (data.type === "spellcheck") {
    const key = data.letter === "\n" ? "Enter" : data.letter === " " ? "Space" : data.letter; //"[Enter]"
    const trace : UserEvent = {
      eventType: eventType,
      elementType: data.type,
      // source: "UserEvent",
      textContent: data.preState,
      code: key,
      key: key,
      timestamp: data.lastUpdated + data.letter.length,
      author: "human",
      startPosition: data.startPosition,
      endPosition: data.endPosition,
      eventValue: data.letter,
      eventState: data.state,
      // url: data.url,
      eventId: data.requestId + "_"+ data.index + "_" + data.acc,
    }

    traces.push(trace);
    return traces;
  }
  return traces;
}
