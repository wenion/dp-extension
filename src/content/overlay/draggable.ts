const EDGE_MARGIN = 12;

export function makeDraggable(
  element: HTMLElement,
): () => void {
  let position:
    | { x: number; y: number }
    | null = null;

  let offset = {
    x: 0,
    y: 0,
  };

  let dimensions = {
    width: 0,
    height: 0,
  };

  let startPos = {
    x: 0,
    y: 0,
  };

  let isDragged = false;
  let isMouseDown = false;

  element.classList.add(
    "pointer-events-auto",
    "select-none",
    "touch-none",
    "cursor-grab",
  );

  element.style.position = "fixed";
  element.style.right = `${EDGE_MARGIN}px`;
  element.style.bottom = `${EDGE_MARGIN}px`;

  const clampPosition = (
    currentPosition: {
      x: number;
      y: number;
    },
    width: number,
    height: number,
  ) => {
    const minX = EDGE_MARGIN;
    const minY = EDGE_MARGIN;

    const maxX = Math.max(
      EDGE_MARGIN,
      window.innerWidth -
        width -
        EDGE_MARGIN,
    );

    const maxY = Math.max(
      EDGE_MARGIN,
      window.innerHeight -
        height -
        EDGE_MARGIN,
    );

    return {
      x: Math.min(
        Math.max(
          minX,
          currentPosition.x,
        ),
        maxX,
      ),

      y: Math.min(
        Math.max(
          minY,
          currentPosition.y,
        ),
        maxY,
      ),
    };
  };

  const applyPosition = (
    nextPosition: {
      x: number;
      y: number;
    },
  ) => {
    position = nextPosition;

    element.style.left =
      `${position.x}px`;

    element.style.top =
      `${position.y}px`;

    element.style.right = "auto";
    element.style.bottom = "auto";
  };

  const clampCurrentPosition = () => {
    if (!position) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    const nextPosition =
      clampPosition(
        position,
        rect.width,
        rect.height,
      );

    if (
      nextPosition.x === position.x &&
      nextPosition.y === position.y
    ) {
      return;
    }

    applyPosition(nextPosition);
  };

  const handleMouseDown = (
    event: MouseEvent,
  ) => {
    if (event.button !== 0) {
      return;
    }

    isMouseDown = true;
    isDragged = false;

    startPos = {
      x: event.clientX,
      y: event.clientY,
    };

    const rect =
      element.getBoundingClientRect();

    offset = {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };

    dimensions = {
      width: rect.width,
      height: rect.height,
    };
  };

  const handleMouseMove = (
    event: MouseEvent,
  ) => {
    if (!isMouseDown) {
      return;
    }

    const dx = Math.abs(
      event.clientX -
        startPos.x,
    );

    const dy = Math.abs(
      event.clientY -
        startPos.y,
    );

    if (
      !isDragged &&
      (dx > 5 || dy > 5)
    ) {
      isDragged = true;

      element.classList.remove(
        "cursor-grab",
      );

      element.classList.add(
        "cursor-grabbing",
      );
    }

    if (!isDragged) {
      return;
    }

    const rawPosition = {
      x:
        event.clientX -
        offset.x,

      y:
        event.clientY -
        offset.y,
    };

    const nextPosition =
      clampPosition(
        rawPosition,
        dimensions.width,
        dimensions.height,
      );

    applyPosition(nextPosition);
  };

  const handleMouseUp = () => {
    if (!isMouseDown) {
      return;
    }

    isMouseDown = false;

    element.classList.remove(
      "cursor-grabbing",
    );

    element.classList.add(
      "cursor-grab",
    );
  };

  const handleClickCapture = (
    event: MouseEvent,
  ) => {
    if (!isDragged) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    isDragged = false;
  };

  const handleResize = () => {
    clampCurrentPosition();
  };

  const resizeObserver =
    new ResizeObserver(() => {
      clampCurrentPosition();
    });

  resizeObserver.observe(element);

  element.addEventListener(
    "mousedown",
    handleMouseDown,
  );

  element.addEventListener(
    "click",
    handleClickCapture,
    true,
  );

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
    element.removeEventListener(
      "mousedown",
      handleMouseDown,
    );

    element.removeEventListener(
      "click",
      handleClickCapture,
      true,
    );

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

    resizeObserver.disconnect();
  };
}