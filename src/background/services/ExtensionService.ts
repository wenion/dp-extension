import type { ExtensionSettingsRepository } from "../repositories/ExtensionSettingsRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type {
  ContentState,
  OptionsPage,
  OptionsState,
} from "@/shared/types";

export class ExtensionService {
  private readonly extensionRepository: ExtensionSettingsRepository;
  private readonly contentScriptClient: ContentScriptClient;

  constructor(
    extensionRepository: ExtensionSettingsRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.extensionRepository = extensionRepository;
    this.contentScriptClient = contentScriptClient;
  }

  isMountEnabled(): boolean {
    return this.extensionRepository.isMountEnabled();
  }

  getOptionsPage(): OptionsPage | undefined {
    return this.extensionRepository.getOptionsPage();
  }

  async mount(): Promise<void> {
    if (this.isMountEnabled()) {
      return;
    }
  
    await this.extensionRepository.setMountEnabled(true);

    await this.notifyMountUpdated();
  }

  async unmount(): Promise<void> {
    if (!this.isMountEnabled()) {
      return;
    }

    await this.extensionRepository.setMountEnabled(false);

    await this.notifyMountUpdated();
  }

  async setOptionsPage(
    page?: OptionsPage,
  ): Promise<void> {
    await this.extensionRepository.setOptionsPage(page);

    await this.notifyOptionsPageUpdated();
  }

  async notifyContent(
    contentState: ContentState,
  ) {
    await this.contentScriptClient.broadcast({
      type: "CONTENT/INITIALIZED",
      payload: contentState,
    });
  }

  async notifyOptions(
    optionsState: OptionsState,
  ) {
    await this.contentScriptClient.broadcast({
      type: "OPTIONS/INITIALIZED",
      payload: optionsState,
    });
  }

  private async notifyMountUpdated() {
    await this.contentScriptClient.broadcast({
      type: "MOUNT/UPDATED",
      payload: {
        mounted: this.isMountEnabled(),
      },
    });
  }

  private async notifyOptionsPageUpdated(): Promise<void> {
    await this.contentScriptClient.broadcast({
      type: "OPTIONS_PAGE/UPDATED",
      payload: {
        page: this.getOptionsPage(),
      },
    });
  }
}
