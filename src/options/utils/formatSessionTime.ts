
export function formatSessionTime(
  startedAt: number,
  // durationMinutes: number,
): string {
  const now = new Date();
  const start = new Date(startedAt);

  const isToday = now.toDateString() === start.toDateString();
  const diff = now.getTime() - start.getTime();

  let prefix: string;

  if (diff < 60 * 1000) {
    prefix = "Just now";
  } else if (isToday) {
    prefix = `Today, ${start.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  } else {
    prefix = start.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  const durationMinutes = Math.round(
    (Date.now() - startedAt) / 60000
  );

  return `${prefix} · ${durationMinutes} min`;
}