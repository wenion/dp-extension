import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@heroui/button";

import { useAppContext } from "../components/context";

export default function SiteAccessPrompt() {
  const navigate = useNavigate();
  const { setPermissionGranted } = useAppContext();

  const handleGrantClick = useCallback(async () => {
    setPermissionGranted(true);
    navigate("/");
  }, [setPermissionGranted, navigate]);

  const handleExitClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <main className="w-80 bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col items-center justify-between p-4 border-b border-black/5">
        <h2 className="text-xl font-semibold text-slate-900">
          Site access required
        </h2>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 px-8 py-4">
        <p className="flex text-xs text-slate-600 text-center">
          To capture traces, the extension needs permission for the current
          site.
        </p>
        <div className="flex flex-col gap-2 px-12">
          <Button color="danger" size="sm" onPress={handleGrantClick}>
            Grant access
          </Button>

          <Button color="default" size="sm" onPress={handleExitClick}>
            Not now
          </Button>
        </div>
        <div className="text-xs leading-snug text-slate-500 px-8 text-center">
          You can revoke site access anytime in Chrome Extension settings.
        </div>
      </div>
    </main>
  );
}
