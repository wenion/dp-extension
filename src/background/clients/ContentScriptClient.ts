import type { TabsRepository } from "../repositories/TabsRepository";

import type {
  BackgroundEvent,
  BackgroundMessageType,
  BackgroundResponse,
} from "@/shared/messaging/backgroundProtocol";


/**
 * Sends messages to content scripts.
 *
 */
export class ContentScriptClient {
  private readonly tabsRepository: TabsRepository;

  constructor(
    tabsRepository: TabsRepository,
  ) {
    this.tabsRepository = tabsRepository;
  }

  async send<
    T extends BackgroundMessageType,
  >(
    tabId: number,
    message: BackgroundEvent<T>,
  ): Promise<BackgroundResponse<T>> {
    return chrome.tabs.sendMessage(
      tabId,
      message,
    );
  }

  /**
   * Broadcasts a message to all registered tabs.
   *
   * Do not filter by `connected` state here. Some messages are used
   * to establish or restore the content-script connection itself,
   * so tabs marked as disconnected must still be reachable.
   *
   * Delivery failures do not interrupt delivery to other tabs.
   * Results are collected and returned to the caller for handling.
   */
  broadcast<
    T extends BackgroundMessageType,
  >(
    message: BackgroundEvent<T>,
  ): void {
    const tabs =
      this.tabsRepository.getTabs();

    for (const tab of tabs) {
      this.send(
        tab.tabId,
        message,
      ).catch(() => {
        tab.connected = false;
      });
    }
  }
}
