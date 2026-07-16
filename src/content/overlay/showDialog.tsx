export function showDialog() {
  const container = document.createElement("div");

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
    fontSize: "14px",
    color: "#111827",
    zIndex: "2147483647",
  });

  const message = document.createElement("div");
  message.textContent =
    "Session stopped & uploaded. Extension turned off.";
  message.style.marginBottom = "16px";
  message.style.lineHeight = "1.5";

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

  container.appendChild(message);
  container.appendChild(button);

  document.body.appendChild(container);
}