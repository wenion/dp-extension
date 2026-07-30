import type { Notification } from "@/shared/types";

export class NotificationRepository {
  private currentId?: string;

  private notifications =
    new Map<string, Notification>();

  getAll(): readonly Notification[] {
    return [...this.notifications.values()]
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  get(
    id: string,
  ): Notification | undefined {
    return this.notifications.get(id);
  }

  getCurrent(): Notification | undefined {
    if (!this.currentId) {
      return;
    }
    return this.notifications.get(this.currentId);
  }

  set(
    notification: Notification,
  ): void {
    this.notifications.set(
      notification.id,
      notification,
    );

    this.currentId = notification.id;
  }

  setCurrent(
    id: string,
  ): boolean {
    if (!this.notifications.has(id)) {
      return false;
    }

    this.currentId = id;

    return true;
  }

  clearCurrent() {
    this.currentId = undefined;
  }

  remove(id: string): boolean {
    const removed = this.notifications.delete(id);

    if (this.currentId === id) {
      this.currentId = undefined;
    }

    return removed;
  }

  clear(): void {
    this.notifications.clear();
    this.currentId = undefined;
  }
}