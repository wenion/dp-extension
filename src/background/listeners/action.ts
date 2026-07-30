import { env } from "@/config/env";
import { InjectionResult } from "@/shared/content-script";

import type { NotificationController } from "../controllers/NotificationController";
import type { PopupController } from "../controllers/PopupController";
import type { TabController } from "../controllers/TabController";

export function startActionListener(
  notificationController: NotificationController,
  popupController: PopupController,
  tabController: TabController,
) {

  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {

      await chrome.storage.local.clear();
      chrome.tabs.create({ url: env.apiUrl });
    }
  });

  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) {
      return;
    }

    const result = await popupController.handleActionClick(tab.id);
    if (result !== InjectionResult.NoPermission) {
      return;
    }

    await notificationController.showHostPermissionRequired(tab.id);
    await chrome.runtime.openOptionsPage();
  });

  chrome.permissions.onAdded.addListener((permissions) => {
    if (permissions.origins) {
      tabController.updateRecordingScopeByOrigins(
        permissions.origins,
        "recording",
      );
    }
  });

  chrome.permissions.onRemoved.addListener((permissions) => {
    if (permissions.origins) {
      tabController.updateRecordingScopeByOrigins(
        permissions.origins,
        "not_in_scope",
      );
    }
  });  
}
