const DIALOG_SELECTOR = '[data-trace-dialog="dp-colam"]';

export function showDialog(
  message: string = "",
) {
  document.querySelector(DIALOG_SELECTOR)?.remove();

  const container = document.createElement("div");
  container.dataset.traceDialog = "dp-colam";

  Object.assign(container.style, {
    position: "fixed",
    left: "24px",
    bottom: "24px",
    width: "320px",
    padding: "16px",
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,.15)",
    fontFamily: "system-ui, sans-serif",
    fontSize: "20px",
    color: "#111827",
    zIndex: "2147483647",
  });

  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.style.marginBottom = "16px";
  messageElement.style.lineHeight = "1.5";

  const button = document.createElement("button");
  button.textContent = "OK";

  Object.assign(button.style, {
    padding: "6px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    float: "right",
  });

  const cleanup = () => {
    button.removeEventListener("click", cleanup);
    container.remove();
  };

  button.addEventListener("click", cleanup);

  container.appendChild(messageElement);
  container.appendChild(button);

  document.body.appendChild(container);
}
