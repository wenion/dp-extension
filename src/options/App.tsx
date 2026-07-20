import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";

import { Power } from "@gravity-ui/icons";

import { Status } from "./pages/Status";
import { SessionCard } from "./pages/SessionCard";

import { useAppContext } from "./context/context";
import { useGrantedDomains } from "./context/useGrantedDomains";
import {
  mount,
  openSession,
  renameSession,
  retryUpload,
} from "./message/BackgroundClient";
import { buildSites } from "./utils/buildSites";
import { formatSessionTime } from "./utils/formatSessionTime";


export default function App() {
  const { mounted, sessions } = useAppContext();

  const domains = useGrantedDomains();

  const activateExtension = () => {
    mount();
  }

  return (
    <main className="min-h-screen flex flex-col space-y-8 p-8">
      {!mounted? (
        <>
          <div className="flex min-h-screen p-6">
            <div className="w-1/3 p-6">
              <p className="mb-5 text-xl text-default-500">
                The extension is turned off. Activate it to show the capture
                puck on your tabs and enable recording.
              </p>

              <Button
                className="text-xl"
                color="primary"
                size="lg"
                startContent={<Power width={16} height={16}/>}
                onPress={activateExtension}
              >
                Activate extension
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
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
                  sites={buildSites(session.urls ?? [])}
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
                  onSessionClick={() => openSession(session.clientId)}
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
        </>
      )}
    </main>
  );
}
