export type CaretInfo = {
  absolutePosition: number;
  line: number;     // 0-based
  column: number;   // 0-based
};

export function getCaretInfo(
  target: HTMLElement,
  key?: string,
): CaretInfo | null {

  // ============================
  // 1 TEXTAREA / INPUT
  // ============================
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    const start =
      target.selectionStart ?? 0;

    const end =
      target.selectionEnd ?? start;

    const beforeStart =
      target.value.slice(0, start);

    const beforeEnd =
      target.value.slice(0, end);

    const startLines =
      beforeStart.split("\n");

    const endLines =
      beforeEnd.split("\n");

    return {
      absolutePosition: start,
      line: startLines.length - 1,
      column:
        startLines[startLines.length - 1].length,
    };
  }

  const selection = window.getSelection();
  if (
    !selection ||
    selection.rangeCount === 0
  ) {
    return null;
  }

  // get the first range
  const range = selection.getRangeAt(0);

  // ============================
  // 2 CodeMirror (Overleaf)
  // ============================
  if (target.classList.contains("cm-content")) {
    const container = range.startContainer;
    const lineEl =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest(".cm-line")
        : (container as HTMLElement).closest(".cm-line");

    if (!lineEl) {
      return null;
    }

    const lines = Array.from(
      target.querySelectorAll(".cm-line"),
    );
    const lineIndex = lines.indexOf(lineEl);

    let absolutePosition = 0;
    for (let i = 0; i < lineIndex; i++) {
      absolutePosition += (lines[i].textContent ?? "").length + 1;
    }

    const preRange = range.cloneRange();
    preRange.selectNodeContents(lineEl);
    preRange.setEnd(range.startContainer, range.startOffset);

    const column = preRange.toString().length;

    return {
      absolutePosition: absolutePosition + column,
      line: lineIndex,
      column,
    };
  }

  // ============================
  // 3 ProseMirror (ChatGPT / Notion)
  // ============================
  if (target.querySelector("p")) {

    const container = range.startContainer;

    const paragraphs = Array.from(target.querySelectorAll("p"));

    const currentParagraph =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest("p")
        : (container as HTMLElement).closest("p");

    if (!currentParagraph) return null;

    let paragraphIndex = paragraphs.indexOf(currentParagraph); // paragraphIndex is 0-based index

    let absolutePosition = 0;

    if (key === "Enter") {
      // current keydown is Enter
      paragraphIndex -= 1;

      if (paragraphIndex < 0) {
        return null;
      }

      for (let i = 0; i < paragraphIndex; i++) {
        absolutePosition +=
          (paragraphs[i].textContent ?? "").length + 1;
      }

      const currentLine =
        paragraphs[paragraphIndex].textContent;

      absolutePosition += currentLine.length;

      const line = paragraphIndex;
      const column = currentLine.length;

      return {
        absolutePosition,
        line,
        column,
      };
    }

    for (let i = 0; i < paragraphIndex; i++) {
      absolutePosition += (paragraphs[i].textContent ?? "").length;

      absolutePosition += 1;
    }

    const preRange = range.cloneRange();
    preRange.selectNodeContents(currentParagraph);
    preRange.setEnd(range.startContainer, range.startOffset);

    absolutePosition += preRange.toString().length;

    // 3 Convert to line + column
    const line = paragraphIndex;
    const column = preRange.toString().length;

    return {
      absolutePosition,
      line,
      column,
    };
  }

  // ============================
  // 4 Google Docs
  // ============================
  if (target.querySelector(".kix-lineview")) {

    const container = range.startContainer;

    const lines = Array.from(document.querySelectorAll(".kix-lineview"));

    const currentLine =
      container.nodeType === Node.TEXT_NODE
        ? container.parentElement?.closest(".kix-lineview")
        : (container as HTMLElement).closest(".kix-lineview");

    if (!currentLine) return null;

    const lineIndex = lines.indexOf(currentLine);

    let absolutePosition = 0;

    for (let i = 0; i < lineIndex; i++) {
      absolutePosition += (lines[i].textContent ?? "").length + 1;
    }

    const preRange = range.cloneRange();
    preRange.selectNodeContents(currentLine);
    preRange.setEnd(range.startContainer, range.startOffset);

    const column = preRange.toString().length;

    return {
      absolutePosition: absolutePosition + column,
      line: lineIndex,
      column
    };
  }

  // ============================
  // 5 Generic contenteditable fallback
  // ============================

  const preRange = range.cloneRange();
  preRange.selectNodeContents(target);
  preRange.setEnd(range.startContainer, range.startOffset);

  const text = preRange.toString();
  const lines = text.split("\n");

  return {
    absolutePosition: text.length,
    line: lines.length - 1,
    column: lines[lines.length - 1].length
  };
}
