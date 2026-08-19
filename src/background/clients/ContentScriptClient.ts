import type { BackgroundEvent } from "@/shared/message/backgroundEvents";
import type { TabsRepository } from "../repositories/TabsRepository";

/**
 * Sends messages to content scripts.
 *
 * Responsible for delivering messages to a specific tab
 * or broadcasting them to all registered content scripts.
 *
 * Does not manage content script lifecycle or tab state.
 */
export class ContentScriptClient {

  private readonly tabsRepository: TabsRepository;

  constructor(
    tabsRepository: TabsRepository,
  ) {
    this.tabsRepository = tabsRepository;
  }

  async send<T = void>(
    tabId: number,
    message: BackgroundEvent,
  ): Promise<T> {
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
   * Delivery failures are ignored so that an unavailable tab does
   * not prevent messages from reaching other tabs.
   */
  async broadcast(
    message: BackgroundEvent
  ): Promise<void> {
    const tabs =
      this.tabsRepository
        .getTabs();

    await Promise.allSettled(
      tabs.map(tab =>
        this.send(
          tab.tabId,
          message,
        ),
      ),
    );
  }
}
