import type { GoogleDocsMeta } from "@/shared/types";

import type { DocState } from "./types";


export class GoogleDocumentEngine {

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
        preState: current.preState,
        state: state,
        lastUpdated: data.timestamp + data.acc,
        requestId: data.requestId,
        index: data.index,
        acc: data.acc,
        letter: piece,
        startPosition: data.startPosition! - 1,
        endPosition: data.startPosition! - 1 + piece.length,
        type: "insert",
        url: data.url,
        docId: current.docId,
      };
      // this.docs.set(tabId, updated);
      return updated;
    }
    else {
      const updated: DocState = {
        preState: current.preState,
        state: current.state.slice(0, data.startPosition! - 1) + piece + current.state.slice(data.startPosition! - 1),
        lastUpdated: data.timestamp + data.acc,
        requestId: data.requestId,
        index: data.index,
        acc: data.acc,
        letter: piece,
        startPosition: data.startPosition! - 1,
        endPosition: data.startPosition! - 1 + (piece ? piece.length : 0),
        type: "insert",
        url: data.url,
        docId: current.docId,
      };
      // this.docs.set(tabId, updated);
      return updated;
    }
  }

  // applyDelete(tabId: number, data: GoogleDocsMeta) {
  applyDelete(
    current: DocState,
    data: GoogleDocsMeta,
  ) {
    // const current = this.get(tabId);
    // if (!current) return;

    const updated: DocState = {
      preState: current.preState,
      state: current.state.slice(0, data.startPosition! - 1) + current.state.slice(data.endPosition),
      lastUpdated: data.timestamp + data.acc,
      requestId: data.requestId,
      index: data.index,
      acc: data.acc,
      letter: current.state.slice(data.startPosition! - 1, data.endPosition),
      startPosition: data.startPosition! - 1,
      endPosition: data.endPosition,
      type: "delete",
      url: data.url,
      docId: current.docId,
    };
    // this.docs.set(tabId, updated);
    return updated;
  }

  applySpellcheck(
    current: DocState,
    data: GoogleDocsMeta,
  ) {

    const updated: DocState = {
      preState: current.preState,
      state: current.state,
      letter: current.state.slice(data.startPosition! - 1, data.endPosition),
      lastUpdated: data.timestamp + data.acc,
      requestId: data.requestId,
      index: data.index,
      acc: data.acc,
      startPosition: data.startPosition! - 1,
      endPosition: data.endPosition,
      type: "spellcheck",
      url: data.url,
      docId: current.docId,
    };
    // this.docs.set(tabId, updated);
    return updated;
  }

  applyPreState(
    current: DocState,
    data: GoogleDocsMeta,
  ) {

    const updated: DocState = {
      ...current,
      preState: data.content,
      lastUpdated: data.timestamp,
      type: "assistwriting",
      url: data.url,
    };
    // this.docs.set(tabId, updated);
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
