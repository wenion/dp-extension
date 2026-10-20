export const MESSAGE_SENDER = {
  CONTENT: "content",
  INJECTED: "injected",
} as const;

export const INTERCEPTOR_TYPE = {
  XHR: "xhr",
  FETCH: "fetch",
} as const;

export const INTERCEPTOR_COMMAND = {
  ENABLE: "enable",
  DISABLE: "disable",
} as const;

export type InterceptorConfig = {
  methods?: string[];
  urls?: string[];
};

export interface XHRTraceMessage {
  sender: typeof MESSAGE_SENDER.INJECTED;
  interceptor: typeof INTERCEPTOR_TYPE.XHR;
  meta: {
    method: string;
    url: string;
  };
  body?: Document | XMLHttpRequestBodyInit | null;
}
