import { useState } from "react";

import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Plus } from "@gravity-ui/icons";
import { useHostPermissions } from "../context/useHostPermissions";


export function Allowlist() {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const {
    domains,
    request,
  } = useHostPermissions();

  const handleAdd = async () => {
    try {
      const granted = await request(value);

      if (!granted) {
        addToast({
          title: "Permission denied",
          color: "warning",
        });
        return;
      }

      setValue("");
      setAdding(false);
    } catch (e) {
      addToast({
        title: "Invalid domain",
        description: (e as Error).message,
        color: "danger",
      });
    }
  };

  return (
    <section className="text-default-500">
    <div className="my-2 flex items-center justify-between">
      <h1 className="text-lg uppercase">
        Standing allowlist · warm-starts new tabs
      </h1>
    </div>

    <div className="flex flex-wrap gap-2">
      {domains.map((domain) => (
        <Chip key={domain} radius="sm" variant="bordered">
          {domain}
        </Chip>
      ))}
      {adding ? (
        <Input
          autoFocus
          size="sm"
          placeholder="example.com"
          value={value}
          onValueChange={setValue}
          className="w-56"
          onBlur={() => {
            setAdding(false);
            setValue("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAdd();
            } else if (e.key === "Escape") {
              setAdding(false);
              setValue("");
            }
          }}
        />
      ) : (
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          onPress={() => setAdding(true)}
        >
          <Plus />
        </Button>
      )}
    </div>
  </section>
  );
}
