function isCopilotUrl(
  url?: string,
): boolean {
  if (!url) return false;

  try {
    return new URL(url).hostname === "copilot.com";
  } catch {
    return false;
  }
}

type CopilotNormalizable = {
  url?: string;
  textContent?: string;
  eventState?: string;
};

export function normalizeTextEditTrace<
  T extends CopilotNormalizable
>(
  trace: T,
): T {
  if (!isCopilotUrl(trace.url)) {
    return trace;
  }

  const normalize = (
    value?: string,
  ): string | undefined =>
    value?.replace(/[\u200B\u200C]/g, "");

  return {
    ...trace,
    textContent: normalize(trace.textContent),
    eventState: normalize(trace.eventState),
  };
}