import { useState, useRef, useEffect } from "react";
import type { ReactNode, MouseEvent } from "react";

type DraggableProps = {
  children: ReactNode;
};

const EDGE_MARGIN = 24;

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

  const clampPosition = (
    position: { x: number; y: number },
    width: number,
    height: number,
  ) => {
    const minX = EDGE_MARGIN;
    const minY = EDGE_MARGIN;

    const maxX = Math.max(
      EDGE_MARGIN,
      window.innerWidth - width - EDGE_MARGIN,
    );

    const maxY = Math.max(
      EDGE_MARGIN,
      window.innerHeight - height - EDGE_MARGIN,
    );

    return {
      x: Math.min(
        Math.max(minX, position.x),
        maxX,
      ),
      y: Math.min(
        Math.max(minY, position.y),
        maxY,
      ),
    };
  };

  useEffect(() => {
    const handleMouseMove = (
      e: globalThis.MouseEvent
    ) => {
      if (!isMouseDownRef.current) return;

       const dx = Math.abs(
        e.clientX - startPos.current.x,
      );
      const dy = Math.abs(
        e.clientY - startPos.current.y,
      );

      if (
        !isDraggedRef.current &&
        (dx > 5 || dy > 5)
      ) {
        isDraggedRef.current = true;
        setIsDragging(true);
      }

      if (isDraggedRef.current) {
        const rawX =
          e.clientX - offset.current.x;
        const rawY =
          e.clientY - offset.current.y;

        setPosition(
          clampPosition(
            {
              x: rawX,
              y: rawY,
            },
            dimensions.current.width,
            dimensions.current.height,
          ),
        );
      }
    };

    const handleMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        setIsDragging(false);
      }
    };

    const handleResize = () => {
      setPosition(currentPosition => {
        // Component has never been dragged.
        if (!currentPosition) {
          return null;
        }

        const rect =
          elementRef.current?.getBoundingClientRect();

        if (!rect) {
          return currentPosition;
        }

        return clampPosition(
          currentPosition,
          rect.width,
          rect.height,
        );
      });
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
    );

    window.addEventListener(
      "mouseup",
      handleMouseUp,
    );

    window.addEventListener(
      "resize",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove,
      );

      window.removeEventListener(
        "mouseup",
        handleMouseUp,
      );

      window.removeEventListener(
        "resize",
        handleResize,
      );
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new ResizeObserver(() => {
      const rect =
        element.getBoundingClientRect();

      setPosition(currentPosition => {
        if (!currentPosition) {
          return null;
        }

        return clampPosition(
          currentPosition,
          rect.width,
          rect.height,
        );
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
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
              right: EDGE_MARGIN,
              bottom: EDGE_MARGIN,
            }
      }
      onMouseDown={handleMouseDown}
      onClickCapture={handleClickCapture}
    >
      {children}
    </div>
  );
}