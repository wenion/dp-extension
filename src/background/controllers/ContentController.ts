import type { PageService } from "../services/PageService";
import type { TabService } from "../services/TabService";

import type { ContentState } from "@/shared/types";


export class ContentController {

  private pageService: PageService;
  private tabService: TabService;

  constructor(
    pageService: PageService,
    tabService: TabService,
  ) {
    this.pageService = pageService;
    this.tabService = tabService;
  }

  async onContentConnected(tabId: number) {

    const state: ContentState = {
      ...this.pageService.getState(),
      tabs: this.tabService.getTabs(),
      tabId: tabId,
    }

    await this.pageService.onContentConnected(state);
  }

  async expand() {
    await this.pageService.onExpanded();
  }

  async collapse() {
    await this.pageService.onCollapsed();
  }

  async includeTab(tabId: number) {
    await this.tabService.setRecording(tabId);
  }

  async excludeTab(tabId: number) {
    await this.tabService.setExcluded(tabId);
  }

  capture() {}

}
