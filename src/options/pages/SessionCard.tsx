import { useEffect, useState } from "react";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";

import { Check, TriangleExclamationFill } from "@gravity-ui/icons";

import type { UploadStatus } from "@/shared/types";


type SessionCardProps = {
  title?: string;
  time: string;
  sites: {
    name: string;
    color: string;
  }[];
  status?: UploadStatus;
  onRename?: (title: string) => void;
  onRetry?: () => void;
};

export function SessionCard({
  title = "Untitled session",
  time,
  sites,
  status,
  onRename,
  onRetry,
}: SessionCardProps) {
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const commitRename = () => {
    if (value !== title) {
      onRename?.(value);
    }
  };

  return (
    <Card shadow="sm" className="border border-default-200">
      <CardBody className="flex flex-row items-center gap-4 p-4 justify-between">
        {/* Session Info */}
        <div className="flex flex-col flex-grow">
          <Input
            variant="flat"
            placeholder="Untitled session"
            classNames={{
              input: "font-medium",
            }}
            value={value}
            onValueChange={setValue}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />

          <p className="p-2 text-xs text-default-500">
            {time}
          </p>
        </div>

        {/* Websites */}
        <div className="flex items-center justify-end gap-3 w-56 shrink-0">
          <div className="flex items-center gap-2">
            {/* {sites.map((site) => (
              <div
                key={site.name}
                title={site.name}
                className="flex h-8 w-8 items-center justify-center rounded text-sm font-semibold text-white"
                style={{
                  backgroundColor: site.color,
                }}
              >
                {site.name.charAt(0).toUpperCase()}
              </div>
            ))} */}
          </div>

          {status === "uploaded" ? (
            <Chip
              className="uppercase font-bold text-green-700"
              variant="light"
              startContent={<Check className="text-green-700"/>}
            >
              Uploaded
            </Chip>
          ) : (
            <>
              <Chip
                color="warning"
                className="uppercase font-bold"
                variant="flat"
                startContent={<TriangleExclamationFill />}
              >
                Upload failed
              </Chip>
              <Button
                color="secondary"
                variant="bordered"
                onPress={onRetry}
              >
                Retry now
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}