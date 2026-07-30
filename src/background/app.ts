import { HttpClient } from "./network/HttpClient";
import { AuthenticatedClient } from "./network/AuthenticatedClient";

import { OAuthApi } from "./api/OAuthApi";
import { ProfileApi } from "./api/ProfileApi";
import { SessionApi } from "./api/SessionApi";
import { TraceApi } from "./api/TraceApi";

import { AuthRepository } from "./repositories/AuthRepository";
import { SessionsRepository } from "./repositories/SessionsRepository";
import { StateRepository } from "./repositories/StateRepository";
import { TabsRepository } from "./repositories/TabsRepository";
import { TraceRepository } from "./repositories/TraceRepository";
import { NotificationRepository } from "./repositories/NotificationRepository";

import { ContentScriptClient } from "./clients/ContentScriptClient";

import { TraceProcessor } from "./TraceProcessor";

import { startActionListener } from "./listeners/action";
import { startAuthListener } from "./listeners/auth";
import { startContentListener } from "./listeners/content";
import { startTabListener } from "./listeners/tab";

import { AuthenticationService } from "./services/AuthenticationService";
import { BadgeService } from "./services/BadgeService";
import { ContentScriptService } from "./services/ContentScriptService";
import { OAuthService } from "./services/OAuthService";
import { PageService } from "./services/PageService";
import { SessionService } from "./services/SessionService";
import { SessionsService } from "./services/SessionsService";
import { TabService } from "./services/TabService";
import { TraceService } from "./services/TraceService";
import { NotificationService } from "./services/NotificationService";

import { GoogleDocumentEngine } from "./services/GoogleDocsService/GoogleDocumentEngine";
import { GoogleDocsApiClient } from "./services/GoogleDocsService/GoogleDocsApiClient";
import { GoogleDocsService } from "./services/GoogleDocsService/index";
import { GoogleDocumentStore } from "./services/GoogleDocsService/GoogleDocumentStore";

import { CaptureController } from "./controllers/CaptureController";
import { ContentController } from "./controllers/ContentController";
import { GoogleDocsController } from "./controllers/GoogleDocsController";
import { InitializationController } from "./controllers/InitializationController";
import { NotificationController } from "./controllers/NotificationController";
import { OptionsController } from "./controllers/OptionsController";
import { PopupController } from "./controllers/PopupController";
import { RecordingController } from "./controllers/RecordingController";
import { TabController } from "./controllers/TabController";

class Application {
  // ------------------------
  // Repositories
  // ------------------------
  readonly authRepository = new AuthRepository();
  readonly sessionsRepository = new SessionsRepository();
  readonly stateRepository = new StateRepository();
  readonly tabsRepository = new TabsRepository();
  readonly traceRepository = new TraceRepository();
  readonly notificationRepository = new NotificationRepository();

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

  readonly authenticationService =
    new AuthenticationService(this.oauthApi, this.authRepository,);

  readonly badgeService =
    new BadgeService();

  readonly contentScriptService =
    new ContentScriptService(this.contentScriptClient);

  readonly pageService =
    new PageService(
      this.stateRepository,
      this.contentScriptClient,
    );

  readonly sessionService =
    new SessionService(
      this.stateRepository,
      this.contentScriptClient,
    );

  readonly sessionsService =
    new SessionsService(
      this.sessionApi,
      this.sessionsRepository,
      this.contentScriptClient,
    );

  readonly tabService =
    new TabService(
      this.tabsRepository,
      this.contentScriptClient,
    );

  readonly traceProcessor =
    new TraceProcessor();

  readonly traceService =
    new TraceService(
      this.traceApi,
      this.traceRepository,
      this.traceProcessor,
    );

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
      this.sessionService,
      this.tabService,
      this.traceService,
    );

  readonly contentController =
    new ContentController(
      this.pageService,
      this.tabService,
    );

  readonly googleDocsController=
    new GoogleDocsController(
      this.googleDocsService,
      this.tabService,
    );

  readonly initializationController=
    new InitializationController(
      this.authenticationService,
      this.sessionsService,
    );

  readonly optionsController =
    new OptionsController(
      this.authenticationService,
      this.pageService,
      this.sessionsService,
      this.tabService,
      this.notificationService,
    );

  readonly recordingController =
    new RecordingController(
      this.pageService,
      this.sessionService,
      this.sessionsService,
      this.tabService,
      this.traceService,
    );

  readonly popupController =
    new PopupController(
      this.authenticationService,
      this.pageService,
      this.sessionService,
      this.tabService,
      this.contentScriptService,
    );

  readonly notificationController =
    new NotificationController(
      this.notificationService,
    );

  readonly tabController =
    new TabController(
      this.contentScriptService,
      this.tabService,
    );

  // ------------------------
  // Startup
  // ------------------------
  async start() {
    this.registerListeners();

    await this.initializeRepositories();

    await this.initializationController.onStartup();

    console.log("Background started.");
  }

  private registerListeners() {
    startContentListener(
      this.captureController,
      this.contentController,
      this.googleDocsController,
      this.optionsController,
      this.recordingController,
      this.notificationController,
      this.tabController,
    );

    startTabListener(
      this.captureController,
      this.googleDocsController,
      this.tabController,
    );

    startAuthListener(
      this.initializationController,
      this.notificationController,
    );

    startActionListener(
      this.notificationController,
      this.popupController,
      this.tabController,
    );
  }

  private async initializeRepositories() {
    await Promise.all([
      this.authRepository.initialize(),
      this.stateRepository.initialize(),
      this.traceRepository.initialize(),
    ]);
  }
}

export const app = new Application();
