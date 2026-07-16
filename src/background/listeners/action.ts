import {
  getDefaultIcon,
  getCapturingIcon,
  getActiveIcon
} from "@/shared/icons";

import type { ActionService } from "../services/ActionService";
import type { AuthService } from "../services/AuthService";
import type { ContentScriptService } from "../services/ContentScriptService";
import type { PermissionService } from "../services/PermissionService";
import type { TabService } from "../services/TabService";


export function startActionListener(
  url: string,
  permissionService: PermissionService,
  actionService: ActionService,
  authService: AuthService,
  contentScriptService: ContentScriptService,
  tabService: TabService,
) {

  chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {

    if (details.reason === "install") {
      const img16  = getDefaultIcon(16);
      const img32  = getDefaultIcon(32);
      chrome.action.setIcon({ imageData: { 16: img16, 32: img32 } });
      // chrome.tabs.create({ url: "welcome.html" });
      // storageService.initialize();
    }
  });

  // chrome.runtime.onStartup.addListener(async () => {
  //   await tabService.removeTimeoutTabs();
  // });

  chrome.action.onClicked.addListener(async (tab) => {

    if (!authService.isAuthenticated()) {
      authService.openLogin(url);
      return;
    }

    if (!tab.url || !tab.id) {
      return;
    }

    const granted =
      await permissionService.hasScriptingPermission(tab.url);

    if (!granted) {
      await chrome.runtime.openOptionsPage();
      // No permission
      return;
    }

    await contentScriptService.ensureReady(tab.id);

    await tabService.cleanupClosedTabs();

    await actionService.toggle(tab.id);

  });

  chrome.permissions.onAdded.addListener((permissions) => {

    if (permissions.origins) {
      tabService.handlePermissionChange(permissions.origins, true);
    }

  });

  chrome.permissions.onRemoved.addListener((permissions) => {

    if (permissions.origins) {
      tabService.handlePermissionChange(permissions.origins, false);
    }

  });
  
}