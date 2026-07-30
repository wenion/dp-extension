import {
  BadgeMetadata,
  BadgeState,
  getBadgeIcon,
} from "@/shared/icons";

export class BadgeService {
  async resetAll(
    authenticated: boolean,
  ): Promise<void> {
    await this.show(
      authenticated
        ? BadgeState.Ready
        : BadgeState.Unauthenticated,
    );
  }

  async setRecording(
    tabIds: number[],
  ): Promise<void> {
    await Promise.all(
      tabIds.map(tabId =>
        this.show(BadgeState.Recording, tabId),
      ),
    );
  }

  async setPaused(
    tabIds: number[],
  ): Promise<void> {
    await Promise.all(
      tabIds.map(tabId =>
        this.show(BadgeState.Paused, tabId),
      ),
    );
  }

  async setExcluded(
    tabId: number,
  ): Promise<void> {
    await this.show(
      BadgeState.Excluded,
      tabId,
    );
  }

  async show(
    state: BadgeState,
    tabId?: number,
  ): Promise<void> {
    const metadata = BadgeMetadata[state];

    const tasks: Promise<unknown>[] = [
      chrome.action.setIcon({
        tabId,
        imageData: {
          16: getBadgeIcon(state, 16),
          32: getBadgeIcon(state, 32),
        },
      }),

      chrome.action.setBadgeText({
        tabId,
        text: metadata.badgeText,
      }),

      chrome.action.setTitle({
        tabId,
        title: metadata.title,
      }),
    ];

    if (metadata.badgeColor) {
      tasks.push(
        chrome.action.setBadgeBackgroundColor({
          tabId,
          color: metadata.badgeColor,
        }),
      );
    }

    await Promise.all(tasks);
  }
}
