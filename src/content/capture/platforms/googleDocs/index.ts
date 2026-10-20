import {
  sendGoogleDocsTrace,
  sendUserTrace,
} from "../../../message/backgroundClient";

import { mountGoogleDocsClipboardListeners } from "./clipboard";
import { mountGoogleDocsXHR } from "./xhr";

import { ListenerGroup } from "../../listener/ListenerGroup";

import type {
  GoogleDocsMeta,
  UserEvent,
} from "@/shared/types";

import type { Overlay } from "../../../overlay/Overlay";
import type { Dispose } from "../../types";

export const googleDocsPlatform = {
  mount(
    overlay?: Overlay,
  ): Dispose {
    const group = new ListenerGroup();

    group.add(
      mountGoogleDocsClipboardListeners(
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

    group.add(
      mountGoogleDocsXHR(
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
