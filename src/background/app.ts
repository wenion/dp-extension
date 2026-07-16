import { env } from "@/config/env";
import { ApiClient } from "./api/ApiClient";
import { ContentScriptClient } from "./clients/ContentScriptClient";
import { HttpClient } from "./network/HttpClient";
import { Storage } from "./storage/Storage";
import { IndexedDBTraceStore } from "./storage/TraceStorage";

import { startContentListener } from "./listeners/content";
import { startStorageListener } from "./listeners/storage";
import { startTabListener } from "./listeners/tab";

import { ContentScriptService } from "./services/ContentScriptService";
import { ActionService } from "./services/ActionService";
import { TabService } from "./services/TabService";
import { SessionService } from "./services/SessionService";
import { PermissionService } from "./services/PermissionService";
import { AuthService } from "./services/AuthService";
import { StorageService } from "./services/StorageService";

import { GoogleDocumentEngine } from "./services/GoogleDocsService/GoogleDocumentEngine";
import { startAuthListener } from "./listeners/auth";
import { startActionListener } from "./listeners/action";
import { GoogleDocsService } from "./services/GoogleDocsService/index";
import { GoogleDocsApiClient } from "./services/GoogleDocsService/GoogleDocsApiClient";
import { GoogleDocumentStore } from "./services/GoogleDocsService/GoogleDocumentStore";
import { CaptureController } from "./controllers/CaptureController";
import { TraceService } from "./services/TraceService";
import { UploadService } from "./services/UploadService";
import { TraceProcessor } from "./TraceProcessor";
import { SessionPersistenceService } from "./services/SessionPersistenceService";
import { PageService } from "./services/PageService";


export async function bootstrap() {
  const storage = new Storage();
  await storage.init();

  const traceStroage = new IndexedDBTraceStore();
  const api = new ApiClient(new HttpClient(env.apiUrl, storage));
  const contentScriptClient = new ContentScriptClient(storage);

  const traceProcessor = new TraceProcessor();

  const permissionService = new PermissionService();
  const storageService = new StorageService(storage);
  const traceService = new TraceService(traceStroage);
  const authService = new AuthService(api, storage);
  const tabService = new TabService(storage, contentScriptClient);
  const contentScriptService =
    new ContentScriptService(storage, contentScriptClient, storageService );

  const sessionPersistenceService =
    new SessionPersistenceService(
      api,
      contentScriptClient,
      storage
    );
  const uploadService = new UploadService(api, traceService, traceProcessor);
  const pageService = new PageService(storage, storageService, contentScriptClient);
  const sessionService =
    new SessionService(
      storage,
      contentScriptClient,
      pageService,
      sessionPersistenceService,
      uploadService
    );
  const actionService =
    new ActionService(
      storage,
      storageService,
      pageService,
      sessionService,
    );

  const googleApi = new GoogleDocsApiClient();
  const googleDocsStore = new GoogleDocumentStore();
  const googleDocumentEngine = new GoogleDocumentEngine();
  const googleDocsService = new GoogleDocsService(googleApi, googleDocsStore, googleDocumentEngine);

  const captureController = new CaptureController(sessionService, tabService, traceService);

  startContentListener(
    env.apiUrl,
    authService,
    storageService,
    permissionService,
    pageService,
    sessionService,
    sessionPersistenceService,
    tabService,
    contentScriptService,
    googleDocsService,
    captureController
  );
  startStorageListener(contentScriptService);
  startTabListener(tabService, permissionService, contentScriptService, googleDocsService, captureController);
  startAuthListener(env.apiUrl, authService);
  startActionListener(
    env.apiUrl,
    permissionService,
    actionService,
    authService,
    contentScriptService,
    tabService
  );

  console.log("app start")
}
