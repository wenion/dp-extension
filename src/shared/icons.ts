export const BadgeState = {
  Unauthenticated: "unauthenticated",
  Ready: "ready",
  Recording: "recording",
  Paused: "paused",
  Excluded: "excluded",
  Error: "error",
} as const;

export type BadgeState =
  (typeof BadgeState)[keyof typeof BadgeState];

type BadgeMetadata = {
  title: string;
  badgeText: string;
  badgeColor?: string;
};

export const BadgeMetadata: Record<
  BadgeState,
  BadgeMetadata
> = {
  [BadgeState.Unauthenticated]: {
    title: "Sign in required",
    badgeText: "",
  },

  [BadgeState.Ready]: {
    title: "Ready",
    badgeText: "",
  },

  [BadgeState.Recording]: {
    title: "Recording",
    badgeText: "REC",
    badgeColor: "#d93025",
  },

  [BadgeState.Paused]: {
    title: "Recording paused",
    badgeText: "",
    badgeColor: "#fbbd04b6",
  },

  [BadgeState.Excluded]: {
    title: "This tab is excluded",
    badgeText: "",
    badgeColor: "#9CA3AF",
  },

  [BadgeState.Error]: {
    title: "Extension error",
    badgeText: "!",
    badgeColor: "#123008",
  },
};

export const getBadgeIcon = (
  state: BadgeState,
  size = 128,
) =>  {
  const VIEW = 24;
  const s = size / VIEW;

  const COLOR_SKY = "#0EA5E9";
  const COLOR_VIOLET = "#8B5CF6";
  const COLOR_AMBER = "#F59E0B";
  const COLOR_GREY = "#9CA3AF";
  const COLOR_RED = "#EF4444";
  const COLOR_YELLOW = "#EAB308";

  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  // gradient border
  if (state !== "unauthenticated") {
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, COLOR_SKY);  // sky-500
    grad.addColorStop(0.5, COLOR_VIOLET); // violet-500
    grad.addColorStop(1, COLOR_AMBER);  // amber-500
    ctx.strokeStyle = grad;
  }

  const strokeWidth = 1.5 * s;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const X = (x: number) => x * s;
  const Y = (y: number) => y * s;

  // draw circular border
  ctx.beginPath();
  ctx.arc(X(11), Y(11), 10 * s, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(X(22), Y(22));
  ctx.lineTo(X(18.5), Y(18.5));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(X(5), Y(6));
  ctx.lineTo(X(5), Y(14));

  ctx.arcTo(X(5), Y(16), X(7), Y(16), 2 * s);
  ctx.lineTo(X(17), Y(16));
  ctx.stroke();

  const dotR = Math.max(0.6 * s, 1); // ensure at least 1px-ish

  const dots: Array<[number, number]> = [
    [9, 7.5],
    [11.5, 10.5],
    [15.5, 6.5],
    [7.5, 11.5],
    [14.5, 12.5],
  ];

  for (const [cx, cy] of dots) {
    ctx.beginPath();
    ctx.arc(X(cx), Y(cy), dotR, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_VIOLET;
    ctx.fill();
  }

  switch (state) {
    case "unauthenticated":
      return ctx.getImageData(0, 0, size, size);
    case "ready":
      return ctx.getImageData(0, 0, size, size);
    case "recording":
      ctx.strokeStyle = COLOR_RED;
      break;
    case "paused":
      ctx.strokeStyle = COLOR_AMBER;
      break;
    case "excluded":
      ctx.strokeStyle = COLOR_GREY;
      break;
    case "error":
      ctx.strokeStyle = COLOR_YELLOW;
      break;
  }

  ctx.lineWidth = 10 * s;
  ctx.beginPath();
  ctx.arc(X(16), Y(16), 2 * s, 0, Math.PI * 2);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size); 
}
