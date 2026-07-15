import type { Storage } from "../storage/Storage";


export class ContentScriptClient {

  private storage: Storage;

  constructor(
    storage: Storage,
  ) {
    this.storage = storage;
  }

  async send<T>(tabId: number, message: any): Promise<T> {
    return chrome.tabs.sendMessage(tabId, message);
  }

  async broadcast(message: any): Promise<void> {
    const tabs = this.storage.getTabs();
    await Promise.allSettled(
      tabs.map(tab =>
        this.send(tab.tabId, message),
      ),
    );
  }

}
