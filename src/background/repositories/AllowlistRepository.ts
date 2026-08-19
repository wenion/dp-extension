const STORAGE_KEY = "allowlist";

export class AllowlistRepository {
  private origins = new Set<string>();

  async initialize(): Promise<void> {
    const { allowlist } =
      await chrome.storage.local.get<{
        allowlist?: string[];
      }>(STORAGE_KEY);

    this.origins = new Set(
      allowlist ?? [],
    );
  }

  getOrigins(): readonly string[] {
    return [...this.origins];
  }

  hasOrigin(
    origin: string,
  ): boolean {
    return this.origins.has(origin);
  }

  async addOrigin(
    origin: string,
  ): Promise<void> {
    if (this.origins.has(origin)) {
      return;
    }

    this.origins.add(origin);

    await this.persist();
  }

  async addOrigins(
    origins: readonly string[],
  ): Promise<void> {
    let changed = false;

    for (const origin of origins) {
      if (this.origins.has(origin)) {
        continue;
      }

      this.origins.add(origin);
      changed = true;
    }

    if (changed) {
      await this.persist();
    }
  }

  async removeOrigin(
    origin: string,
  ): Promise<boolean> {
    const removed =
      this.origins.delete(origin);

    if (removed) {
      await this.persist();
    }

    return removed;
  }

  async setOrigins(
    origins: readonly string[],
  ): Promise<void> {
    this.origins = new Set(origins);

    await this.persist();
  }

  async clear(): Promise<void> {
    this.origins.clear();

    await chrome.storage.local.remove(
      STORAGE_KEY,
    );
  }

  private async persist(): Promise<void> {
    await chrome.storage.local.set({
      [STORAGE_KEY]: [
        ...this.origins,
      ],
    });
  }
}
