import type {
  ContentState,
  Session,
  TabState,
} from "@/shared/types";

type Selector<T> = (store: ContentStore) => T;

type Listener<T> = (
  value: T,
  previousValue: T | undefined,
) => void;

interface Subscription<T> {
  selector: Selector<T>;
  listener: Listener<T>;
  value: T | undefined;
  initialized: boolean;
}

export class ContentStore {
  private mount?: boolean;
  private activeSession?: Session;
  private tabs: readonly TabState[] = [];
  private tabId?: number;

  private subscriptions = new Set<Subscription<any>>();

  initialize(state: ContentState) {
    this.mount = state.mount;
    this.activeSession = state.activeSession;
    this.tabs = state.tabs;
    this.tabId = state.tabId;

    this.notify();
  }

  getAll() {
    return {
      mount: this.mount,
      activeSession: this.activeSession,
      tabs: this.tabs,
      tabId: this.tabId,
    }
  }

  isMounted(): boolean {
    return this.mount ?? false;
  }

  getTab(): TabState | undefined {
    return this.tabs?.find(
      tab => tab.tabId === this.tabId,
    );
  }

  getActiveSession(): Session | undefined {
    return this.activeSession;
  }

  setMount(mount: boolean) {
    this.mount = mount;
    this.notify();
  }

  setActiveSession(activeSession?: Session) {
    this.activeSession = activeSession;
    this.notify();
  }

  setTabs(tabs: readonly TabState[]) {
    this.tabs = tabs;
    this.notify();
  }

  subscribe<T>(
    selector: Selector<T>,
    listener: Listener<T>,
  ): () => void {
    const subscription: Subscription<T> = {
      selector,
      listener,
      value: undefined,
      initialized: false,
    };

    this.subscriptions.add(subscription);

    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  private notify() {
    for (const subscription of this.subscriptions) {
      const value =
        subscription.selector(this);

      if (
        subscription.initialized &&
        Object.is(subscription.value, value)
      ) {
        continue;
      }

      const previousValue =
        subscription.value;

      subscription.value = value;
      subscription.initialized = true;

      subscription.listener(
        value,
        previousValue,
      );
    }
  }
}
