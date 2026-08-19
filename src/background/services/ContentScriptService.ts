import {
  InjectionPermission,
  InjectionResult,
} from "@/shared/content-script";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

/**
 * Ensures a content script is available in a browser tab.
 *
 * The service is responsible only for the lifecycle of content scripts:
 * checking whether one is already running and injecting it if necessary.
 *
 * It does not manage recording state, tabs, or application data.
 */
export class ContentScriptService {

  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    contentScriptClient: ContentScriptClient,
  ) {
    this.contentScriptClient = contentScriptClient;
  }

  /**
   * Attempts to inject the content script into the given tab.
   *
   * If the content script is already injected, this method returns
   * {@link InjectionResult.Success} without injecting again.
   *
   * Before injecting, this method verifies that:
   * - the tab has a valid URL;
   * - the URL is supported;
   * - the extension has host permission.
   *
   * If injection cannot be completed, a detailed
   * {@link InjectionResult} is returned describing the reason.
   */
  async inject(
    tabId: number
  ): Promise<InjectionResult> {
    const permission =
      await this.checkTabInjectionPermission(tabId);

    switch (permission) {
      case InjectionPermission.UnsupportedUrl:
        return InjectionResult.UnsupportedUrl;

      case InjectionPermission.NoPermission:
        return InjectionResult.NoPermission;

      case InjectionPermission.Allowed:
        break;
    }

    if (await this.isInjected(tabId)) {
      return InjectionResult.Success;
    }

    return this.executeInjection(tabId);
  }

  private async checkTabInjectionPermission(
    tabId: number
  ): Promise<InjectionPermission> {
     const tab = await chrome.tabs.get(tabId);

    if (!tab.url) {
      return InjectionPermission.UnsupportedUrl;
    }

    const url = new URL(tab.url);

    return this.checkInjectionPermission(url);
  }

  private async checkInjectionPermission(
    url: URL,
  ): Promise<InjectionPermission> {
    if (!this.isSupportedProtocol(url)) {
      return InjectionPermission.UnsupportedUrl;
    }

    return InjectionPermission.Allowed;
  }

  async executeInjection(
    tabId: number,
  ): Promise<InjectionResult> {
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

    return (await this.isInjected(tabId))
      ? InjectionResult.Success
      : InjectionResult.ContentUnavailable;
  }

  /**
   * Returns whether the content script is responsive.
   */
  async isInjected(
    tabId: number,
  ): Promise<boolean> {
    try {
      const response =
        await this.contentScriptClient.send<{
          injected: boolean;
        }>(
          tabId,
          {
            type: "PING",
          },
        );

      return response?.injected === true;
    } catch {
      return false;
    }
  }

  private isSupportedProtocol(url: URL): boolean {
    return ["http:", "https:"].includes(url.protocol);
  }
}
