import { connect } from "./message/BackgroundClient";
import { registerMessageListener } from "./message/listerner";

import { CaptureManager } from "./capture";

const capture = new CaptureManager();

registerMessageListener(capture);
connect();
