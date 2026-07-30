import type { NotificationRepository } from "../repositories/NotificationRepository";
import type { ContentScriptClient } from "../clients/ContentScriptClient";

import {
  NotificationLevel,
  type Notification
} from "@/shared/types";

export class NotificationService {
  private readonly notificationRepository: NotificationRepository;
  private readonly contentScriptClient: ContentScriptClient;
  
  constructor(
    notificationRepository: NotificationRepository,
    contentScriptClient: ContentScriptClient,
  ) {
    this.notificationRepository = notificationRepository;
    this.contentScriptClient = contentScriptClient;
  }

  getNotifications(): readonly Notification[] {
    return this.notificationRepository.getAll();
  }

  getCurrentNotification(): Notification | undefined {
    return this.notificationRepository.getCurrent();
  }

  async info(
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      expiresAt?: number;
      tabId?: number;
      action?: Notification["action"];
    },
  ) {
    await this.present(
      NotificationLevel.Info,
      title,
      message,
      options,
    );
  }

  async success(
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      expiresAt?: number;
      tabId?: number;
      action?: Notification["action"];
    },
  ) {
    await this.present(
      NotificationLevel.Success,
      title,
      message,
      options,
    );
  }

  async warning(
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      expiresAt?: number;
      tabId?: number;
      action?: Notification["action"];
    },
  ) {
    await this.present(
      NotificationLevel.Warning,
      title,
      message,
      options,
    );
  }

  async error(
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      expiresAt?: number;
      tabId?: number;
      action?: Notification["action"];
    },
  ) {
    await this.present(
      NotificationLevel.Error,
      title,
      message,
      options,
    );
  }

  private async present(
    level: NotificationLevel,
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      expiresAt?: number;
      tabId?: number;
      action?: Notification["action"];
    },
  ) {
    const notification: Notification = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),

      level,
      title,
      message,

      dismissible: options?.dismissible ?? true,
      expiresAt: options?.expiresAt,

      tabId: options?.tabId,

      action: options?.action,
    };

    this.notificationRepository.set(notification);

    await this.notifyNotificationsUpdated();
  }

  async dismiss(id: string): Promise<void> {
    this.notificationRepository.remove(id);

    await this.notifyNotificationsUpdated();
  }

  async clear(): Promise<void> {
    this.notificationRepository.clear();

    await this.notifyNotificationsUpdated();
  }

  private async notifyNotificationsUpdated(): Promise<void> {
    await this.contentScriptClient.broadcast({
      type: "NOTIFICATIONS/UPDATED",
      payload: {
        notifications: this.getNotifications(),
        currentNotification: this.getCurrentNotification(),
      },
    });
  }

  private async notifyNotificationPresented() {
    // openOptionsPage()
  }
}
