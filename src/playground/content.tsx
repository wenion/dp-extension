import { render } from "@/content/overlay/render";

import "@/styles/content.css";

render(
  document.getElementById("content-root")!,
  {
    tabs: [],
    tabId: 0,
  }
);