import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import { Power } from "@gravity-ui/icons";

import { Allowlist } from "./pages/Allowlist";
import { Status } from "./pages/Status";
import { SessionCard } from "./pages/SessionCard";
import { NotificationBanner } from "./pages/NotificationBanner";

import { useAppContext } from "./context/context";
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

  const activateExtension = () => {
    mount();
  }

  return (
    <main className="min-h-screen flex flex-col space-y-8 p-8">
      <NotificationBanner />
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
                  onRename={async (newTitle) => {
                    const updated =
                      await renameSession(session.clientId, newTitle);
                    if (!updated) {
                      addToast({
                        title: "Rename failed",
                        description: "Unable to rename session.",
                        color: "danger",
                      });

                    } else {
                      addToast({
                        title: "Success",
                        description: "Session renamed.",
                        color: "success",
                      });
                    }
                  }}
                  onRetry={async() => {
                    const updated =
                      await retryUpload(session.clientId);
                    if (!updated) {
                       addToast({
                        title: "Re-upload failed",
                        description: "Unable to re-upload the session.",
                        color: "danger",
                      });
                    } else {
                       addToast({
                        title: "Re-upload complete",
                        description: "The session was uploaded successfully.",
                        color: "success",
                      });
                    }
                    }}
                  onSessionClick={() => openSession(session.clientId)}
                />
              ))}
            </div>
          </section>

          <Allowlist />
        </>
      )}
    </main>
  );
}
