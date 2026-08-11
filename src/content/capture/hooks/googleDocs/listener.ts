import type { GoogleDocsMeta } from "@/shared/types";

type DocElement = {
  ty: string; // "is" for insert, "ds" for delete, "mlti" for multi
  ibi?: number; // insert position for "is"
  s?: string; // inserted text for "is"
  si?: number; // start position for "ds"
  ei?: number; // end position for "ds"
  st?: string; // for "as" type, e.g., "ignore_spellcheck"
  mts?: Array<DocElement>; // array of operations for "mlti"
};

type XHRTraceMessage = {
  source: string;
  meta: {
    method: string;
    url: string;
  };
  body: Document | XMLHttpRequestBodyInit | null;
};

function parseSaveBundle(msg: any): GoogleDocsMeta[] {
  const traces: GoogleDocsMeta[] = [];

  const decoded = decodeURIComponent(msg.body);
  const params = new URLSearchParams(decoded);
  const bundlesRaw = params.get("bundles");

  if (!bundlesRaw) return traces;

  const bundles = JSON.parse(bundlesRaw);

  /**
   * buundles is an array of operations, each with a reqId and an array of commands
   * * reqId is the unique identifier of bundle
   * * index is the order of command in bundle
   * * acc is the accumulated character count of previous commands in the same bundle
   * one delete is counted as 1, one insert is counted as the length of inserted text
   * multi is counted as the sum of its sub commands
   * parseCommands return the sum of considerable events
   * some cases the commands have same timestamp, acc will be added to timestamp to ensure the order of events
  */
  const parseCommands = (command: DocElement, reqId: number, index: number, acc: number): number => {
    const type = command.ty;
    if (type === "is") {
      const ibi = command.ibi;
      const text = command.s;
      const data: GoogleDocsMeta = {
        api: "save",
        requestId: reqId,
        url: window.location.href,
        type: "insert",
        startPosition: ibi,
        timestamp: Date.now(),
        content: text,
        category: "is",
        index: index,
        acc: acc
      };
      traces.push(data);

      return text ? text.length : 0;
    }
    else if (type === "ds") {
      const si = command.si;
      const ei = command.ei;
      const data: GoogleDocsMeta = {
        api: "save",
        requestId: reqId,
        url: window.location.href,
        type: "delete",
        startPosition: si,
        endPosition: ei,
        timestamp: Date.now(),
        category: "ds",
        index: index,
        acc: acc
      }
      traces.push(data);

      return 1;
    }
    else if (type === "mlti") {
      const mts = command.mts;
      let multiAcc = acc;
      if (mts) {
        mts.forEach((item) => multiAcc += parseCommands(item, reqId, index, multiAcc));
      }
      return multiAcc;
    }
    else if (type === "as" && command.st === "ignore_spellcheck") {
      const si = command.si;
      const ei = command.ei;
      const data: GoogleDocsMeta = {
        api: "save",
        requestId: reqId,
        url: window.location.href,
        type: "spellcheck",
        startPosition: si,
        endPosition: ei,
        timestamp: Date.now(),
        category: "as",
        index: index,
        acc: acc
      }
      traces.push(data);

      return ei !== undefined && si !== undefined
        ? ei - si
        : 0;
    }
    return 0;
  }

  try{
    const commands = bundles[0].commands as Array<DocElement>;
    const reqId = bundles[0].reqId;

    let acc = 0;

    commands.forEach((command, index) => {
      acc += parseCommands(command, reqId, index, acc);
    });

  } catch(e) {
    console.log("bundles exception:", e);
  }

  return traces;
}

function parseAssistWriting(msg: any): GoogleDocsMeta | null {
  try {
    const body = JSON.parse(msg.body);
    const suggestionText = body[0][0];
    const docId = body[0][8];

    const data: GoogleDocsMeta = {
      api: "assistwriting",
      requestId: 0,
      url: window.location.href,
      type: "assistwriting",
      content: suggestionText,
      timestamp: Date.now(),
      index: 0,
      acc: 0,
    }
    return data;
  } catch (e) {
    console.log("assistwriting exception:", e);
    return null;
  }
}

export function createGoogleDocsMessageListener(
  emit: (trace: GoogleDocsMeta) => void,
) {
  return (event: MessageEvent<XHRTraceMessage>) => {

    if (event.source !== window) {
      return;
    }

    const msg = event.data;

    if (
      !msg ||
      msg.source !== "injected"
    ) {
      return;
    }

    const meta = msg.meta;

    if (meta.url.includes("/save")) {
      parseSaveBundle(msg).forEach(emit);
    }
    else if (
      meta.url.includes("/assistwriting")
    ) {
      const trace = parseAssistWriting(msg);

      if (trace) {
        emit(trace);
      }
    }
  };
}
