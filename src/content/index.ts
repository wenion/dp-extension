import { connect } from "./message/BackgroundClient";
import { registerMessageListener } from "./message/listerner";

import { registerContentEffects } from "./effects/registerContentEffects";

import { ContentController } from "./ContentController";
import { ContentStore } from "./ContentState";

import { SiteCapture } from "./capture";

const store = new ContentStore();
const controller = new ContentController(store);
registerMessageListener(controller);

const capture = new SiteCapture();
const disposeEffects =
  registerContentEffects(
    store,
    capture,
  );

connect();
