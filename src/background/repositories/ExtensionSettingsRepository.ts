const STORAGE_KEY = "mountEnabled";

export class ExtensionSettingsRepository {
  private mountEnabled = false;

  async initialize(): Promise<void> {
    const { mountEnabled } =
      await chrome.storage.local.get<{
        mountEnabled?: boolean;
      }>(STORAGE_KEY);

    this.mountEnabled = mountEnabled ?? false;
  }

  isMountEnabled(): boolean {
    return this.mountEnabled;
  }

  async setMountEnabled(
    enabled: boolean,
  ): Promise<void> {
    this.mountEnabled = enabled;

    await chrome.storage.local.set({
      [STORAGE_KEY]: enabled,
    });
  }
}
