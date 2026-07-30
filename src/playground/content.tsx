import { render } from "@/content/overlay/render";

import "@/styles/globals.css";

render(
  document.getElementById("content-root")!,
  {
    pageState: "collapsed",
    pageMounted: true,
    tabs: [],
    tabId: 0,
  }
);