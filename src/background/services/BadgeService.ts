import {
  BadgeMetadata,
  BadgeState,
  getBadgeIcon,
} from "@/shared/icons";

import type {
  ActiveSession,
  TabState,
} from "@/shared/types";

export class BadgeService {

  async updateBadge(
    tabs: readonly TabState[],
    mounted?: boolean,
    activeSession?: ActiveSession,
  ): Promise<void> {
    if (mounted && activeSession) {
      const paused =
        activeSession.captureState === "paused";

      await Promise.allSettled(
        tabs.map(async tab => {
          if (tab.recordingScope === "excluded") {
            await this.setExcluded(tab.tabId);
            return;
          }

          if (tab.recordingScope === "not_in_scope") {
            await this.setOutOfScope(tab.tabId);
            return;
          }

          if (paused) {
            await this.setPaused(tab.tabId);
          }
          else {
            await this.setRecording(tab.tabId);
          }
        }),
      );

      return;
    }

    if (mounted) {
      await this.setReadyWithTabs(tabs);
      return;
    }

    await this.setDisabledWithTabs(tabs);
  }

  async setUnauthenticated(
  ): Promise<void> {
    await this.show(
      BadgeState.Unauthenticated,
    );
  }

  async setDisabled(): Promise<void> {
    await this.show(
      BadgeState.Disabled,
    );
  }

  async setReady(): Promise<void> {
    await this.show(BadgeState.Ready);
  }

  async setUnauthenticatedWithTabs(
    tabs: readonly TabState[],
  ): Promise<void> {
    return this.showWithTabs(
      BadgeState.Unauthenticated,
      tabs,
    );
  }

  private async setDisabledWithTabs(
    tabs: readonly TabState[],
  ): Promise<void> {
    return this.showWithTabs(
      BadgeState.Disabled,
      tabs,
    );
  }

  private async setReadyWithTabs(
    tabs: readonly TabState[],
  ): Promise<void> {
    return this.showWithTabs(
      BadgeState.Ready,
      tabs,
    );
  }

  private async showWithTabs(
    state: BadgeState,
    tabs: readonly TabState[],
  ): Promise<void> {
    await Promise.allSettled(
      tabs.map(tab =>
        this.show(state, tab.tabId),
      ),
    );

    await this.show(
      state,
    );
  }

  private async setRecording(
    tabId: number,
  ): Promise<void> {
    await this.show(BadgeState.Recording, tabId);
  }

  private async setPaused(
    tabId: number,
  ): Promise<void> {
    await this.show(BadgeState.Paused, tabId);
  }

  private async setExcluded(
    tabId: number,
  ): Promise<void> {
    await this.show(BadgeState.Excluded, tabId);
  }

  private async setOutOfScope(
    tabId: number,
  ): Promise<void> {
    await this.show(BadgeState.OutOfScope, tabId);
  }

  private async show(
    state: BadgeState,
    tabId?: number,
  ): Promise<void> {
    const metadata = BadgeMetadata[state];

    const tasks: Promise<unknown>[] = [
      chrome.action.setIcon({
        tabId,
        imageData: {
          16: getBadgeIcon(metadata.mode, metadata.badgeColor, 16),
          32: getBadgeIcon(metadata.mode, metadata.badgeColor, 32),
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
