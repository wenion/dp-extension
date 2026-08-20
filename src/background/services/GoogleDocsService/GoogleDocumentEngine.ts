import type { GoogleDocsMeta } from "@/shared/types";

import type { DocState } from "./types";


export class GoogleDocumentEngine {

  createInitialState(
    docId: string,
    content: string,
  ): DocState {
    return {
      preState: "",
      state:
        content.endsWith("\n")
          ? content.slice(0, -1)
          : content,
      letter: "",
      startPosition: 0,
      endPosition: 0,
      lastUpdated: Date.now(),
      requestId: 0,
      index: 0,
      acc: 0,
      type: "initial",
      docId,
    };
  }

  applyInsert(
    current: DocState,
    data: GoogleDocsMeta,
  ): DocState {

    const piece = data.content;
    if (piece?.startsWith("\n")) {
      const state =
        current.state.slice(0, data.startPosition! - 1) +
        (piece + "\n").slice(1) +
        current.state.slice(data.startPosition! - 1);
      const updated: DocState = {
        ...current,
        state: state,
        lastUpdated: data.timestamp + data.acc,
        requestId: data.requestId,
        index: data.index,
        acc: data.acc,
        letter: piece,
        startPosition: data.startPosition! - 1,
        endPosition: data.startPosition! - 1 + piece.length,
        type: "insert",
      };
      return updated;
    }
    else {
      const updated: DocState = {
        ...current,
        state: current.state.slice(0, data.startPosition! - 1) + piece + current.state.slice(data.startPosition! - 1),
        lastUpdated: data.timestamp + data.acc,
        requestId: data.requestId,
        index: data.index,
        acc: data.acc,
        letter: piece,
        startPosition: data.startPosition! - 1,
        endPosition: data.startPosition! - 1 + (piece ? piece.length : 0),
        type: "insert",
      };
      return updated;
    }
  }

  applyDelete(
    current: DocState,
    data: GoogleDocsMeta,
  ): DocState {
    const updated: DocState = {
      ...current,
      state: current.state.slice(0, data.startPosition! - 1) + current.state.slice(data.endPosition),
      lastUpdated: data.timestamp + data.acc,
      requestId: data.requestId,
      index: data.index,
      acc: data.acc,
      letter: current.state.slice(data.startPosition! - 1, data.endPosition),
      startPosition: data.startPosition! - 1,
      endPosition: data.endPosition,
      type: "delete",
    };
    return updated;
  }

  applySpellcheck(
    current: DocState,
    data: GoogleDocsMeta,
  ): DocState {

    const updated: DocState = {
      ...current,
      letter: current.state.slice(data.startPosition! - 1, data.endPosition),
      lastUpdated: data.timestamp + data.acc,
      requestId: data.requestId,
      index: data.index,
      acc: data.acc,
      startPosition: data.startPosition! - 1,
      endPosition: data.endPosition,
      type: "spellcheck",
    };
    return updated;
  }

  applyPreState(
    current: DocState,
    data: GoogleDocsMeta,
  ): DocState {

    const updated: DocState = {
      ...current,
      preState: data.content,
      lastUpdated: data.timestamp,
      type: "assistwriting",
    };
    return updated;
  }

  apply(
    current: DocState,
    meta: GoogleDocsMeta,
  ): DocState | undefined {

    if (meta.api === "assistwriting") {
      return this.applyPreState(
        current,
        meta,
      );
    }

    switch (meta.type) {

    case "insert":
      return this.applyInsert(
          current,
          meta,
      );

    case "delete":
      return this.applyDelete(
          current,
          meta,
      );

    case "spellcheck":
      return this.applySpellcheck(
          current,
          meta,
      );

    default:
      return undefined;
    }
  }
}
