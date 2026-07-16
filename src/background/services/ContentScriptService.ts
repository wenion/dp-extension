import { InjectionResult } from "@/shared/content-script";

import type { Storage } from "../storage/Storage";
import type { ContentScriptClient } from "../clients/ContentScriptClient";
import type { StorageService } from "../services/StorageService";


/**
 * Ensures a content script is available in a browser tab.
 *
 * The service is responsible only for the lifecycle of content scripts:
 * checking whether one is already running and injecting it if necessary.
 *
 * It does not manage recording state, tabs, or application data.
 */
export class ContentScriptService {

  private readonly storage: Storage;
  private readonly contentScriptClient: ContentScriptClient;

  private readonly storageService: StorageService;

  constructor(
    storage: Storage,
    contentScriptClient: ContentScriptClient,
    storageService: StorageService,
  ) {
    this.storage = storage;
    this.contentScriptClient = contentScriptClient;
    this.storageService = storageService;
  }

  /**
   * Ensures the content script is available in the specified tab.
   *
   * If the content script is already running, it is reused.
   * Otherwise, this method attempts to inject it and verifies that it
   * is responsive before returning.
   */
  async ensureInjected(tabId: number): Promise<InjectionResult> {
    const tab = await chrome.tabs.get(tabId);

    if (!tab.url) {
      return InjectionResult.UnsupportedUrl;
    }

    const url = new URL(tab.url);

    if (!this.canInject(url)) {
      return InjectionResult.UnsupportedUrl;
    }

    if (!(await this.hasHostPermission(url))) {
      return InjectionResult.NoPermission;
    }

    if (await this.ping(tabId)) {
      return InjectionResult.Success;
    }

    try {
      await chrome.scripting.executeScript({
        target: {
          tabId,
          allFrames: true,
        },
        files: ["content-script.js"],
      });
    } catch (error) {
      console.error(
        "Failed to inject content script.",
        error,
      );
      return InjectionResult.InjectionFailed;
    }

    return (await this.ping(tabId))
      ? InjectionResult.Success
      : InjectionResult.ContentUnavailable;
  }

  /**
   * Returns whether the content script is responsive.
   */
  private async ping(
    tabId: number,
  ): Promise<boolean> {
    try {
      await this.contentScriptClient.send(tabId, {
        type: "PING",
      });

      return true;
    } catch {
      return false;
    }
  }

  private canInject(url: URL): boolean {
    // Only allow HTTP(S) pages.
    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return false;
    }

    // Chrome Web Store cannot be scripted.
    if (
      url.hostname === "chrome.google.com" ||
      url.hostname === "chromewebstore.google.com"
    ) {
      return false;
    }

    return true;
  }

  private hasHostPermission(url: URL): Promise<boolean> {
    return chrome.permissions.contains({
      // permissions: ["scripting"],
      origins: [`${url.origin}/*`]
    });
  }
}
