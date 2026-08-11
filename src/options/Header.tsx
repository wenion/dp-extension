import { Chip } from "@heroui/chip";
import { Rectangles4 } from '@gravity-ui/icons';

import { useAppContext } from "./context/context";
import type {
  PanelPage,
  Session,
} from "@/shared/types";

export function getHeaderStatus(
  mounted: boolean,
  page: PanelPage,
  session?: Session,
) {

  if (!mounted) return "inactive";

  if (page === "failed") return "uploadFailed";
  if (page === "uploaded") return "uploaded";
  if (page === "uploading") return "uploading";

  if (!session) return "ready";
  if (session.captureState === "paused") return "paused";

  return "recording";
}

export default function Header() {
  const {
    activeSession,
    mounted,
    page,
  } = useAppContext();

  const status = getHeaderStatus(mounted, page, activeSession);

  return (
    <header className="flex items-start justify-between px-8 pt-8">
      <div className="flex flex-col items-start gap-x-4 gap-y-2">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Rectangles4 width={26} height={26} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Trace Capture
          </h1>
        </div>
        <p className="text-default-500">
          Extension management page — this page is not recorded.
        </p>
      </div>

      <StatusChip status={status} />
    </header>
  );
}

function StatusChip({
  status,
}: {
  // status: "ready" | "recording" | "paused" | "uploading" | "uploaded";
  status: string;
}) {
  switch (status) {
    case "inactive":
      return (
        <Chip
          color="default"
          startContent={
            <div className="ml-2 h-2 w-2 rounded bg-current" />
          }
          variant="flat"
        >
          INACTIVE
        </Chip>
      );

    case "recording":
      return (
        <Chip
          color="danger"
          startContent={
            <div className="ml-2 h-2 w-2 rounded bg-current" />
          }
          variant="flat"
        >
          RECORDING
        </Chip>
      );

    case "paused":
      return (
        <Chip
          color="warning"
          radius="full"
          startContent={
            <div className="ml-2 h-2 w-2 rounded-full bg-current" />
          }
          variant="flat"
        >
          PAUSED
        </Chip>
      );

    case "uploaded":
      return (
        <Chip
          color="success"
          radius="full"
          startContent={
            <div className="ml-2 h-2 w-2 rounded-full bg-current" />
          }
          variant="flat"
        >
          UPLOADED
        </Chip>
      );

    case "uploadFailed":
      return (
        <Chip
          color="warning"
          radius="full"
          startContent={
            <div className="ml-2 h-2 w-2 rounded-full bg-current" />
          }
          variant="flat"
        >
          UPLOAD FAILED
        </Chip>
      );

    default:
      return (
        <Chip
          color="primary"
          radius="full"
          startContent={
            <div className="ml-2 h-2 w-2 rounded-full bg-current" />
          }
          variant="flat"
        >
          {status.toLocaleUpperCase()}
        </Chip>
      );
  }
}