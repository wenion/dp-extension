import { useState, useRef, useEffect } from "react";
import type { ReactNode, MouseEvent } from "react";

type DraggableProps = {
  children: ReactNode;
};

export function Draggable({ children }: DraggableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const offset = useRef({ x: 0, y: 0 });
  const dimensions = useRef({ width: 0, height: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const isDraggedRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {

    if (e.button !== 0) return;

    isMouseDownRef.current = true;
    isDraggedRef.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };

    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      dimensions.current = {
        width: rect.width,
        height: rect.height,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isMouseDownRef.current) return;

      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);

      if (!isDraggedRef.current && (dx > 5 || dy > 5)) {
        isDraggedRef.current = true;
        setIsDragging(true);
      }

      if (isDraggedRef.current) {
        const rawX = e.clientX - offset.current.x;
        const rawY = e.clientY - offset.current.y;

        const maxX = window.innerWidth - dimensions.current.width;
        const maxY = window.innerHeight - dimensions.current.height;

        setPosition({
          x: Math.min(Math.max(0, rawX), maxX),
          y: Math.min(Math.max(0, rawY), maxY),
        });
      }
    };

    const handleMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleClickCapture = (e: MouseEvent) => {
    if (isDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();

      isDraggedRef.current = false;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`
        pointer-events-auto select-none touch-none
        ${isDragging ? "cursor-grabbing" : "cursor-grab"}
      `}
      style={
        position
          ? {
              position: "fixed",
              left: position.x,
              top: position.y,
            }
          : {
              position: "fixed",
              right: 24,
              bottom: 24,
            }
      }
      onMouseDown={handleMouseDown}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  );
}