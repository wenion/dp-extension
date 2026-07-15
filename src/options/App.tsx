import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

import { Status } from "./pages/Status";
import { SessionCard } from "./pages/SessionCard";

import { useAppContext } from "./context/context";
import { useGrantedDomains } from "./context/useGrantedDomains";
import { renameSession, retryUpload } from "./message/BackgroundClient";


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

export default function App() {
  const { sessions } = useAppContext();

  const domains = useGrantedDomains();

  return (
    <main className="min-h-screen flex flex-col space-y-8 p-8">
      <section className="text-default-500">
        <Status/>
      </section>

      <section className="text-default-500">
        <h1 className="my-2 text-lg uppercase">
          SESSIONS
        </h1>
        <div className="space-y-4">
          {sessions.map((session) => (
            <SessionCard
              key={session.clientId}
              title={session.name}
              time={formatSessionTime(session.startedAt, )}
              sites={[{name:"overleaf.com", color: "green"}]}
              status={session.uploadStatus}
              onRename={(newTitle) => {
                renameSession(session.clientId, newTitle);
                // TODO
                addToast({
                  title: "Success",
                  description: "Session renamed.",
                  color: "success",
                });
              }}
              onRetry={() => retryUpload(session.clientId)}
            />
          ))}
        </div>
      </section>

      <section className="text-default-500">
        <h1 className="my-2 text-lg uppercase">
          Standing allowlist · warm-starts new tabs
        </h1>
        <div className="flex flex-wrap gap-2">
          {domains.map(domain => (
            <Chip key={domain} radius="sm" variant="bordered">{domain}</Chip>
          ))}
        </div>
      </section>
    </main>
  );
}
