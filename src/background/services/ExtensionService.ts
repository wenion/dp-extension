import type { ExtensionSettingsRepository } from "../repositories/ExtensionSettingsRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import type { ContentState, OptionsState } from "@/shared/types";

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
}