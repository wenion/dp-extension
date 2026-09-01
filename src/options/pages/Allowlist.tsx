import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { TrashBin } from "@gravity-ui/icons";

import { useAppContext } from "../context/context";
import {
  removeFromAllowlist,
  setOptionsPage,
} from "../message/backgroundClient";

export function Allowlist() {
  const {
    allowlist,
  } = useAppContext();

  const goBack = async () => {
    await setOptionsPage();
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          className="mb-6"
          variant="light"
          onPress={goBack}
        >
          ← Back
        </Button>

        <h1 className="text-2xl font-semibold">
          Allowlist
        </h1>

        <p className="mt-2 text-default-500">
          The extension can capture activity on the websites
          listed below. Remove a website to prevent it from
          being included in future recording sessions.
        </p>
      </div>

      <Divider />

      {/* List */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Allowed websites
          </h2>

          <span className="text-sm text-default-400">
            {allowlist.length}{" "}
            {allowlist.length === 1 ? "site" : "sites"}
          </span>
        </div>

        {allowlist.length === 0 ? (
          <div className="rounded-lg border border-default-200 p-8 text-center">
            <p className="text-default-500">
              No websites have been added to the allowlist.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-default-200 rounded-lg border border-default-200">
            {allowlist.map(origin => (
              <div
                key={origin}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {formatOrigin(origin)}
                  </p>

                  <p className="truncate text-sm text-default-400">
                    {origin}
                  </p>
                </div>

                <Button
                  isIconOnly
                  aria-label={`Remove ${origin}`}
                  color="danger"
                  variant="light"
                  onPress={() =>
                    removeFromAllowlist(origin)
                  }
                >
                  <TrashBin width={18} height={18} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatOrigin(origin: string): string {
  try {
    return new URL(origin).hostname;
  }
  catch {
    return origin;
  }
}