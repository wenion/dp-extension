import type { Trace } from "@/shared/types";


export const wheelHandler = (
  event: WheelEvent,
): Trace => {
  const data = {} as Trace;
  data.eventType = event.type;
  
  data.clientX = window.scrollX;
  data.clientY = window.scrollY;
  data.width = window.innerWidth;
  data.height = window.innerHeight;

  data.timestamp = Date.now();
  return data;
};

export const scrollHandler = (
  event: Event,
) : Trace => {
  const trace = {} as Trace;

  trace.eventType = event.type;
  
  trace.clientX = window.scrollX;
  trace.clientY = window.scrollY;
  trace.width = window.innerWidth;
  trace.height = window.innerHeight;

  trace.timestamp = Date.now();

  return trace;
};
