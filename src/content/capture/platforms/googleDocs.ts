import {
  sendGoogleDocsTrace,
  sendUserTrace,
} from "../../message/backgroundClient";
import {
  mountGoogleDocsEditor,
  mountGoogleDocsXHR,
} from "../hooks/googleDocs";
import { ListenerGroup } from "../listener/ListenerGroup";

import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

import type { Overlay } from "../../overlay/Overlay";
import type { Dispose } from "../types";


const googleDocsConfig = {
  methods: ["POST"],
  url: ["/save", "/assistwriting"],
};

export const googleDocsPlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    group.add(
      mountGoogleDocsEditor(
        async (trace: UserEvent) => {
          try {
            await sendUserTrace(trace);
          } catch (error) {
            if (!(error instanceof Error)) {
              throw error;
            }

            overlay?.show({
              notice: `${error.message} Please reload the page.`,
            });
          }
        },
      ),
    );

    // common listeners
    group.add(
      mountGoogleDocsXHR(
        googleDocsConfig,
        async (trace: GoogleDocsMeta) => {
          try {
            await sendGoogleDocsTrace(trace);
          } catch (error) {
            if (!(error instanceof Error)) {
              throw error;
            }

            overlay?.show({
              notice: `${error.message} Please reload the page.`,
            });
          }
        },
      ),
    );

    return () => group.dispose();
  },
};
