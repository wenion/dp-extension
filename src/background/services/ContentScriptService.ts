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

  async ensureReady(tabId: number) {
    try {
      await this.contentScriptClient.send(tabId, {
        type: "PING",
      });
      return;
    } catch {
      console.log("No running content script")
    }

    const tab = await chrome.tabs.get(tabId);

    if (!tab.url || !this.canInject(tab.url)) {
        return;
    }

    await this.inject(tabId);
  }

  async inject (tabId: number) {
    return await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['content-script.js'],
    });
  }

  async mount(tabId: number) {
    await this.storage.setPageMounted(true);

    const initState =
      await this.storageService.getNormalizedAppState();

    await this.contentScriptClient.broadcast({
      type: "PAGE/SET_MOUNTED",
      payload: {
        ...initState,
        tabId: tabId,
      },
    });
  }

  async unmount() {
    this.storage.setPageMounted(false);

    await this.contentScriptClient.broadcast({
      type: "PAGE/SET_MOUNTED",
      payload: {
        mounted: false,
      },
    });
  }

  private canInject(url: string) {
    return !(
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("edge://") ||
      url.startsWith("about:") ||
      url.startsWith("devtools:")
    );
  }
}
