import { render } from "@/content/overlay/render";

import "@/styles/globals.css";

render(
  document.getElementById("content-root")!,
  {
    tabs: [],
    tabId: 0,
  }
);