import { HttpClient } from "./network/HttpClient";
import { AuthenticatedClient } from "./network/AuthenticatedClient";

import { OAuthApi } from "./api/OAuthApi";
import { ProfileApi } from "./api/ProfileApi";
import { SessionApi } from "./api/SessionApi";
import { TraceApi } from "./api/TraceApi";

import { ActiveSessionRepository } from "./repositories/ActiveSessionRepository";
import { AuthRepository } from "./repositories/AuthRepository";
import { AllowlistRepository } from "./repositories/AllowlistRepository";
import { ExtensionSettingsRepository } from "./repositories/ExtensionSettingsRepository";
import { NotificationRepository } from "./repositories/NotificationRepository";
import { SessionsRepository } from "./repositories/SessionsRepository";
import { TabsRepository } from "./repositories/TabsRepository";
import { TraceRepository } from "./repositories/TraceRepository";

import { ContentScriptClient } from "./clients/ContentScriptClient";

import { startContentListener } from "./listeners/content";
import { startExtensionListener } from "./listeners/extension";
import { startTabListener } from "./listeners/tab";

import { ActiveSessionService } from "./services/ActiveSessionService";
import { AuthenticationService } from "./services/AuthenticationService";
import { BadgeService } from "./services/BadgeService";
import { ContentScriptService } from "./services/ContentScriptService";
import { ExtensionService } from "./services/ExtensionService";
import { NotificationService } from "./services/NotificationService";
import { OAuthService } from "./services/OAuthService";
import { SessionsService } from "./services/SessionsService";
import { TabsService } from "./services/TabsService";
import { TraceService } from "./services/TraceService";
import { TraceProcessorService } from "./services/TraceProcessorService";

import { GoogleDocumentEngine } from "./services/GoogleDocsService/GoogleDocumentEngine";
import { GoogleDocsApiClient } from "./services/GoogleDocsService/GoogleDocsApiClient";
import { GoogleDocsService } from "./services/GoogleDocsService/index";
import { GoogleDocumentStore } from "./services/GoogleDocsService/GoogleDocumentStore";

import { CaptureController } from "./controllers/CaptureController";
import { GoogleDocsController } from "./controllers/GoogleDocsController";
import { ExtensionController } from "./controllers/ExtensionController";
import { OptionsController } from "./controllers/OptionsController";

class Application {
  // ------------------------
  // Repositories
  // ------------------------
  readonly activeSessionRepository = new ActiveSessionRepository();
  readonly authRepository = new AuthRepository();
  readonly allowlistRepository = new AllowlistRepository();
  readonly extensionSettingsRepository = new ExtensionSettingsRepository();
  readonly notificationRepository = new NotificationRepository();
  readonly sessionsRepository = new SessionsRepository();
  readonly tabsRepository = new TabsRepository();
  readonly traceRepository = new TraceRepository();

  // ------------------------
  // Network
  // ------------------------
  readonly httpClient = new HttpClient();
  readonly oauthApi = new OAuthApi(this.httpClient);

  readonly oauthService = new OAuthService(
    this.oauthApi,
    this.authRepository,
  );

  readonly authenticatedClient =
    new AuthenticatedClient(this.oauthService);

  readonly profileApi =
    new ProfileApi(this.authenticatedClient);

  readonly sessionApi =
    new SessionApi(this.authenticatedClient);

  readonly traceApi =
    new TraceApi(this.authenticatedClient);

  // ------------------------
  // Clients
  // ------------------------

  readonly contentScriptClient =
    new ContentScriptClient(this.tabsRepository);

  // ------------------------
  // Services
  // ------------------------

  readonly activeSessionService =
    new ActiveSessionService(
      this.activeSessionRepository,
      this.contentScriptClient,
    );

  readonly authenticationService =
    new AuthenticationService(
      this.oauthApi,
      this.authRepository,
    );

  readonly badgeService =
    new BadgeService();

  readonly contentScriptService =
    new ContentScriptService(this.contentScriptClient);

  readonly extensionService =
    new ExtensionService(
      this.extensionSettingsRepository,
      this.contentScriptClient,
    );

  readonly sessionsService =
    new SessionsService(
      this.sessionApi,
      this.sessionsRepository,
      this.contentScriptClient,
    );

  readonly tabsService =
    new TabsService(
      this.allowlistRepository,
      this.tabsRepository,
      this.contentScriptClient,
    );

  readonly traceService =
    new TraceService(
      this.traceApi,
      this.traceRepository,
    );

  readonly traceProcessorService =
    new TraceProcessorService();

  readonly notificationService =
    new NotificationService(
      this.notificationRepository,
      this.contentScriptClient,
    );

  readonly googleApi =
    new GoogleDocsApiClient();

  readonly googleDocumentStore =
    new GoogleDocumentStore();

  readonly googleDocumentEngine =
    new GoogleDocumentEngine();

  readonly googleDocsService =
    new GoogleDocsService(
      this.googleApi,
      this.googleDocumentStore,
      this.googleDocumentEngine,
      this.contentScriptClient,
    );

  // ------------------------
  // Controllers
  // ------------------------

  readonly captureController =
    new CaptureController(
      this.activeSessionService,
      this.tabsService,
      this.traceService,
    );

  readonly googleDocsController=
    new GoogleDocsController(
      this.googleDocsService,
      this.tabsService,
    );

  readonly extensionController=
    new ExtensionController(
      this.activeSessionService,
      this.authenticationService,
      this.badgeService,
      this.contentScriptService,
      this.extensionService,
      this.notificationService,
      this.sessionsService,
      this.tabsService,
      this.traceService,
      this.traceProcessorService,
    );

  readonly optionsController =
    new OptionsController(
      this.extensionService,
      this.sessionsService,
      this.tabsService,
    );

  // ------------------------
  // Startup
  // ------------------------
  async start() {
    this.registerListeners();

    await this.initializeRepositories();

    await this.extensionController.onBackgroundStartup();

    console.log("Background started.");
  }

  private registerListeners() {
    startContentListener(
      this.captureController,
      this.extensionController,
      this.googleDocsController,
      this.optionsController,
    );

    startTabListener(
      this.captureController,
      this.extensionController,
      this.googleDocsController,
    );

    startExtensionListener(
      this.extensionController,
    );
  }

  private async initializeRepositories() {
    await Promise.all([
      this.activeSessionRepository.initialize(),
      this.allowlistRepository.initialize(),
      this.authRepository.initialize(),
      this.extensionSettingsRepository.initialize(),
      this.sessionsRepository.initialize(),
      this.tabsRepository.initialize(),
      this.traceRepository.initialize(),
    ]);
  }
}

export const app = new Application();
