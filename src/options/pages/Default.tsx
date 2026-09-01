import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { addToast } from "@heroui/toast";
import {
  Minus,
  Power,
} from "@gravity-ui/icons";

import { Status } from "./Status";
import { SessionCard } from "./SessionCard";
import { NotificationBanner } from "./NotificationBanner";

import { useAppContext } from "../context/context";
import {
  openSession,
  removeFromAllowlist,
  renameSession,
  retryUpload,
  toggleMount,
} from "../message/backgroundClient";
import { buildSites } from "../utils/buildSites";
import { formatSessionTime } from "../utils/formatSessionTime";

export function Default() {
  const {
    mounted,
    sessions,
    allowlist,
  } = useAppContext();

  return (
    <>
      <NotificationBanner />

      {!mounted ? (
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
              startContent={
                <Power width={16} height={16} />
              }
              onPress={toggleMount}
            >
              Activate extension
            </Button>
          </div>
        </div>
      ) : (
        <>
          <section className="text-default-500">
            <Status />
          </section>

          <section className="text-default-500">
            <h1 className="my-2 text-lg uppercase">
              SESSIONS
            </h1>

            <div className="space-y-4">
              {sessions.map(session => (
                <SessionCard
                  key={session.clientId}
                  title={session.name}
                  time={formatSessionTime(session.startedAt)}
                  sites={buildSites(session.urls ?? [])}
                  status={session.uploadStatus}
                  onRename={async newTitle => {
                    const success =
                      await renameSession(
                        session.clientId,
                        newTitle,
                      );

                    if (success) {
                      addToast({
                        title: "Success",
                        description: "Session renamed.",
                        color: "success",
                      });
                    }
                    else {
                      addToast({
                        title: "Rename failed",
                        description: "Unable to rename session.",
                        color: "danger",
                      });
                    }
                  }}
                  onRetry={async () => {
                    const success =
                      await retryUpload(
                        session.clientId,
                      );

                    if (!success) {
                      addToast({
                        title: "Re-upload failed",
                        description: `Unable to re-upload the session ${session.name} [${session.clientId}].`,
                        color: "danger",
                      });
                    }
                    else {
                      addToast({
                        title: "Re-upload complete",
                        description:
                          `The session ${session.name} [${session.clientId}] was uploaded successfully.`,
                        color: "success",
                      });
                    }
                  }}
                  onSessionClick={() =>
                    openSession(session.clientId)
                  }
                />
              ))}
            </div>
          </section>

          <section className="text-default-500">
            <div className="my-2 flex items-center justify-between">
              <h1 className="text-lg uppercase">
                Standing allowlist · warm-starts new tabs
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {allowlist.map(origin => (
                <div
                  key={origin}
                  className="group relative cursor-pointer"
                >
                  <Chip
                    radius="sm"
                    variant="bordered"
                  >
                    {origin}
                  </Chip>

                  <button
                    type="button"
                    className="
                      absolute -right-1.5 -top-1.5
                      hidden
                      h-4 w-4
                      cursor-pointer
                      items-center justify-center
                      rounded-full
                      bg-danger text-white
                      group-hover:flex
                    "
                    onClick={() =>
                      removeFromAllowlist(origin)
                    }
                  >
                    <Minus width={12} height={12} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
