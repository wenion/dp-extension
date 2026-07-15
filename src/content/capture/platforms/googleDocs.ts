import {
  mountGoogleDocsEditor,
  mountGoogleDocsXHR,
} from "../hooks/googleDocs";

import { ListenerGroup } from "../listener/ListenerGroup";
import { sendUserTrace, sendGoogleDocsTrace } from "../sender";
import type { Dispose } from "../types";


const googleDocsConfig = {
  methods: ["POST"],
  url: ["/save", "/assistwriting"]
};

export const googleDocsPlatform = {
  mount(): Dispose {
    console.log("google mount")
    const group = new ListenerGroup();

    group.add(
      mountGoogleDocsEditor(sendUserTrace)
    );

    // common listeners
    group.add(
      mountGoogleDocsXHR(
        googleDocsConfig,
        sendGoogleDocsTrace
      )
    );

    return () => group.dispose();

  }
};