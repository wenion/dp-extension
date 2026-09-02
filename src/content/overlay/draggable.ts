export function makeDraggable(
  element: HTMLElement,
): () => void {
  let isDragging = false;

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
  element.style.right = "24px";
  element.style.bottom = "24px";

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
      isDragging = true;

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

    const rawX =
      event.clientX -
      offset.x;

    const rawY =
      event.clientY -
      offset.y;

    const maxX =
      window.innerWidth -
      dimensions.width;

    const maxY =
      window.innerHeight -
      dimensions.height;

    position = {
      x: Math.min(
        Math.max(0, rawX),
        maxX,
      ),

      y: Math.min(
        Math.max(0, rawY),
        maxY,
      ),
    };

    element.style.left =
      `${position.x}px`;

    element.style.top =
      `${position.y}px`;

    element.style.right =
      "auto";

    element.style.bottom =
      "auto";
  };

  const handleMouseUp = () => {
    if (!isMouseDown) {
      return;
    }

    isMouseDown = false;
    isDragging = false;

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
  };
}