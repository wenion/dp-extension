import { Chip } from "@heroui/chip";

import { useHostPermissions } from "../context/useHostPermissions";


export function Allowlist() {
  const {
    domains,
  } = useHostPermissions();

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
      </div>
  </section>
  );
}
