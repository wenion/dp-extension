import type { DocState } from "./types";


export class GoogleDocumentStore {
  private docs = new Map<number, DocState>();

  get(tabId: number): DocState | undefined {
    return this.docs.get(tabId);
  }

  set(tabId: number, state: DocState): void {
    this.docs.set(tabId, state);
  }

  has(tabId: number): boolean {
    return this.docs.has(tabId);
  }

  remove(tabId: number): void {
    this.docs.delete(tabId);
  }

  clear(): void {
    this.docs.clear();
  }

  initialize(
    tabId: number,
    url: string,
    documentId: string,
    content: string,
  ): DocState {
    const state: DocState = {
      preState: "",
      state: content.endsWith("\n") ? content.slice(0, -1) : content,
      letter: "",
      startPosition: 0,
      endPosition: 0,
      lastUpdated: Date.now(),
      requestId: 0,
      index: 0,
      acc: 0,
      type: "initial",
      url: url,
      docId: documentId,
    };
    this.docs.set(tabId, state);

    return state;
  }

  // async initialize(tabId: number, url: string, documentId: string, content: string) {
  //   const updated: DocState = {
  //     preState: "",
  //     state: content.endsWith("\n") ? content.slice(0, -1) : content,
  //     letter: "",
  //     startPosition: 0,
  //     endPosition: 0,
  //     lastUpdated: Date.now(),
  //     requestId: 0,
  //     index: 0,
  //     acc: 0,
  //     type: "initial",
  //     url: url,
  //     docId: documentId,
  //   };
  //   this.docs.set(tabId, updated);
  // }

  // applyInsert(tabId: number, data: GoogleDocsMeta) {
  //   const current = this.get(tabId);
  //   if (!current) return;

  //   const piece = data.content;
  //   if (piece?.startsWith("\n")) {
  //     const state =
  //       current.state.slice(0, data.startPosition! - 1) +
  //       (piece + "\n").slice(1) +
  //       current.state.slice(data.startPosition! - 1);
  //     const updated: DocState = {
  //       preState: current.preState,
  //       state: state,
  //       lastUpdated: data.timestamp + data.acc,
  //       requestId: data.requestId,
  //       index: data.index,
  //       acc: data.acc,
  //       letter: piece,
  //       startPosition: data.startPosition! - 1,
  //       endPosition: data.startPosition! - 1 + piece.length,
  //       type: "insert",
  //       url: data.url,
  //       docId: current.docId,
  //     };
  //     this.docs.set(tabId, updated);
  //   }
  //   else {
  //     const updated: DocState = {
  //       preState: current.preState,
  //       state: current.state.slice(0, data.startPosition! - 1) + piece + current.state.slice(data.startPosition! - 1),
  //       lastUpdated: data.timestamp + data.acc,
  //       requestId: data.requestId,
  //       index: data.index,
  //       acc: data.acc,
  //       letter: piece,
  //       startPosition: data.startPosition! - 1,
  //       endPosition: data.startPosition! - 1 + (piece ? piece.length : 0),
  //       type: "insert",
  //       url: data.url,
  //       docId: current.docId,
  //     };
  //     this.docs.set(tabId, updated);
  //   }
  // }

  // applyDelete(tabId: number, data: GoogleDocsMeta) {
  //   const current = this.get(tabId);
  //   if (!current) return;

  //   const updated: DocState = {
  //     preState: current.preState,
  //     state: current.state.slice(0, data.startPosition! - 1) + current.state.slice(data.endPosition),
  //     lastUpdated: data.timestamp + data.acc,
  //     requestId: data.requestId,
  //     index: data.index,
  //     acc: data.acc,
  //     letter: current.state.slice(data.startPosition! - 1, data.endPosition),
  //     startPosition: data.startPosition! - 1,
  //     endPosition: data.endPosition,
  //     type: "delete",
  //     url: data.url,
  //     docId: current.docId,
  //   };
  //   this.docs.set(tabId, updated);
  // }

  // applySpellcheck(tabId: number, data: GoogleDocsMeta) {
  //   const current = this.get(tabId);
  //   if (!current) return;

  //   const updated: DocState = {
  //     preState: current.preState,
  //     state: current.state,
  //     letter: current.state.slice(data.startPosition! - 1, data.endPosition),
  //     lastUpdated: data.timestamp + data.acc,
  //     requestId: data.requestId,
  //     index: data.index,
  //     acc: data.acc,
  //     startPosition: data.startPosition! - 1,
  //     endPosition: data.endPosition,
  //     type: "spellcheck",
  //     url: data.url,
  //     docId: current.docId,
  //   };
  //   this.docs.set(tabId, updated);
  // }

  // applyPreState(tabId: number, data: GoogleDocsMeta) {
  //   const current = this.get(tabId);
  //   if (!current) return;

  //   const updated: DocState = {
  //     ...current,
  //     preState: data.content,
  //     lastUpdated: data.timestamp,
  //     type: "assistwriting",
  //     url: data.url,
  //   };
  //   this.docs.set(tabId, updated);
  // }
}
