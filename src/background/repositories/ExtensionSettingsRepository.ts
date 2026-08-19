import type { OptionsPage } from "@/shared/types";

const MOUNT_ENABLED_KEY = "mountEnabled";
const OPTIONS_PAGE_KEY = "optionsPage";

export class ExtensionSettingsRepository {
  private mountEnabled = false;
  private optionsPage?: OptionsPage;

  async initialize(): Promise<void> {
    const {
      mountEnabled,
      optionsPage,
    } = await chrome.storage.local.get<{
      mountEnabled?: boolean;
      optionsPage?: OptionsPage;
    }>([
      MOUNT_ENABLED_KEY,
      OPTIONS_PAGE_KEY,
    ]);

    this.mountEnabled =
      mountEnabled ?? false;

    this.optionsPage =
      optionsPage;
  }

  isMountEnabled(): boolean {
    return this.mountEnabled;
  }

  async setMountEnabled(
    enabled: boolean,
  ): Promise<void> {
    this.mountEnabled = enabled;

    await chrome.storage.local.set({
      [MOUNT_ENABLED_KEY]: enabled,
    });
  }

  getOptionsPage(): OptionsPage | undefined {
    return this.optionsPage;
  }

  async setOptionsPage(
    page?: OptionsPage,
  ): Promise<void> {
    this.optionsPage = page;

    if (page === undefined) {
      await chrome.storage.local.remove(
        OPTIONS_PAGE_KEY,
      );

      return;
    }

    await chrome.storage.local.set({
      [OPTIONS_PAGE_KEY]: page,
    });
  }
}
