import { useEffect, useRef } from "react";

import { getActiveIcon } from "@/shared/icons";

export function Logo({ size }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;

    if (!canvas) return;

    const img = getActiveIcon(size);

    canvas.width = size ?? img.width;
    canvas.height = size ?? img.height;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.putImageData(img, 0, 0);
  }, [size]);

  return <canvas ref={ref} height={size} width={size} />;
}
