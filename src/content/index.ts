import { connect } from "./message/backgroundClient";
import { startBackgroundListener } from "./message/backgroundListener";

import { ContentController } from "./ContentController";
import { ContentStore } from "./ContentState";
import { Overlay } from "./overlay/Overlay";
import { SiteCapture } from "./capture/SiteCapture";

import "@/styles/content.css";

const store = new ContentStore();
const overlay = new Overlay();
const capture = new SiteCapture();

const controller = new ContentController(
  store,
  overlay,
  capture,
);

startBackgroundListener(controller);


async function initialize() {
  try {
    const state = await connect();

    await controller.initializeStore(state);
  } catch (error) {
    console.error(
      "Failed to initialize content script:",
      error,
    );
  }
}

initialize();
