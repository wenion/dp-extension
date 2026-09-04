import type { TabsRepository } from "../repositories/TabsRepository";

import type {
  BackgroundEvent,
  BackgroundMessageType,
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
  ): Promise<void> {
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
  async broadcast<
    T extends BackgroundMessageType,
  >(
    message: BackgroundEvent<T>,
  ): Promise<void> {
    const tabs =
      this.tabsRepository.getTabs();

    await Promise.all(
      tabs.map(async tab => {
        try {
          await this.send(
            tab.tabId,
            message,
          );
        } catch {
          tab.connected = false;
        }
      }),
    );
  }
}
