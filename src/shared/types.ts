export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  updated_at: string;
};

// User Event Trace type
export type UserEvent = {
  eventType?: string; // API url
  tag?: string; // API Method
  elementType?: string; // API Subtype

  // url?: string;
  name?: string;
  placeholder?: string;
  textContent?: string;
  //clientX: selectionStart for input[select event]
  //clientX: scrollX for scroll and wheel
  clientX?: number;
  //selectionEnd for input[select event]
  //scrollY for scroll and wheel
  clientY?: number;
  width?: number;
  height?: number;
  xpath?: string;

  valueName?: string; // for input change
  originValue?: string; // avoid circular structure
  valueType?: string; // typeof value
  // for select element
  valueIndex?: number;
  valueLabel?: string;

  // "backward"/"forward" for select event and selection
  direction?: string;

  label?: string;
  timestamp: number;

  code?: string; // for keyboard event
  key?: string; // for keyboard event

  message?: string;
  eventValue?: string;
  eventState?: string;
  eventId?: string;
  startPosition?: number;
  endPosition?: number;

  // sessionId?: string;
  author?: string;
  containerId?: number;
  source?: string;
};

export type TraceContext = {
  sessionId: string;
  sessionStart: number;
  sessionEnd?: number;

  tabId: number;
  windowId?: number;
  sequence?: number;

  url: string;
};

export type Trace = UserEvent & TraceContext;

// Database Trace record type
export type TraceRecord = {
  /**
   * url
   * The base URL or page where the event happened.
   * Example: "https://example.com/editor"
   */
  url: string;

  /**
   * page_type
   * Kind of URL
   * Example values: "AI", "editor", "other"
   */
  page_type: string | null;

  /**
   * author
   * Subject or doer of the event
   * Example values: "human", "AI", "other"
   */
  author: string | null;

  /**
   * container_id
   * Identifier for the text field. Needed for when a page has multiple text fields (e.g., a form).
   */
  container_id: number | null;

  /**
   * event_type
   * Type interface event
   * Example values: "insert", "delete", "select(text)", "copy", "paste", "cursor-forward",
   * "cursor-backward", "click (element)", "scroll", "mouseenter", "mouseleave", "blur"
   */
  event_type: string | null;

  /**
   * message
   * Full text content of prompt sent to AI; full text content of AI response
   */
  message: string | null;

  /**
   * cursor_position
   * Position of cursor in text container
   */
  cursor_position: number | null;

  /**
   * end_position
   * Position of final cursor in text container
   */
  end_position: number | null;

  /**
   * event_time
   * Time of event
   * Number of milliseconds since Unix epoch /timestamp with time zone (ISO string)
   */
  event_time: string | null;

  /**
   * event_value
   * Most recently typed content in text field
   */
  event_value: string | null;

  /**
   * event_id
   * Identifier for the event
   */
  event_id: string | null;

  /**
   * event_state
   * Accumulated typed content
   */
  event_state: string | null;

  /**
   * The HTML tag where the event occurred
   */
  tag_name: string | null;

  /**
   * element_text
   * The visible text of the element the user interacted with (e.g., button label or link text).
   */
  element_text: string | null;

  /**
   * offset_x
   * X-coordinate offset (relative to the viewport) where the event occurred.
   */
  offset_x: number | null;

  /**
   * Y-coordinate offset (relative to the viewport) where the event occurred.
   */
  offset_y: number | null;

  /**
   * width
   * The width of the viewport (in pixels)
   */
  width: number | null;

  /**
   * height
   * The height of the viewport (in pixels)
   */
  height: number | null;

  /**
   * x_path
   * The full XPath of the DOM element, useful for uniquely identifying the element interacted with.
   */
  x_path: string | null;
};

export type GoogleDocsMeta = {
  api: string;
  requestId: number;
  index: number;
  acc: number; // accumulated character count of previous commands in the same bundle
  url: string;
  type: string;
  startPosition?: number;
  endPosition?: number;
  content?: string;
  timestamp: number;
  category?: string;
};

export type UploadStatus =
  | "waiting"
  | "uploading"
  | "uploaded"
  | "failed";

export interface Session {
  clientId: string;
  ref?: number;
  name?: string;

  startedAt: number;
  endedAt?: number;
  eventCount: number;

  captureState:
    | "recording"
    | "paused";

  uploadStatus: UploadStatus;

  urls?: string[];
};

export type RecordingScope =
  | "recording"
  | "excluded"
  | "not_in_scope";

export interface TabState {
  tabId: number;
  windowId?: number;

  url: string;
  origin: string;
  title?: string;
  googleDocId?: string;

  recordingScope: RecordingScope;
  connected: boolean;

  createdAt: number;
  updatedAt: number;
};

export const NotificationLevel = {
  Info: "info",
  Success: "success",
  Warning: "warning",
  Error: "error",
} as const;

export type NotificationLevel =
  (typeof NotificationLevel)[keyof typeof NotificationLevel];

export const NotificationAction = {
  GrantHostPermission: "grant_host_permission",
  SignIn: "sign_in",
} as const;

export type NotificationAction =
  (typeof NotificationAction)[keyof typeof NotificationAction];

export interface Notification {
  id: string;

  createdAt: number;

  level: NotificationLevel;

  title: string;
  message: string;

  dismissible: boolean;
  expiresAt?: number;

  tabId?: number;
  action?: {
    type: NotificationAction;
    label: string;
  };
}

export interface BackgroundState {
  pageMounted?: boolean;
  pageState?: PageState;
  activeSession?: Session;
  tabs: readonly TabState[];
}

export interface ContentState extends BackgroundState {
  tabId: number;
};

export interface OptionsState extends BackgroundState {  
  sessions: readonly Session[];
  currentNotification?: Notification;
  notifications: readonly Notification[];
}

export type PageState =
  | "idle"
  | "collapsed"
  | "expanded"
  | "confirm"
  | "uploading"
  | "uploaded"
  | "forceUploaded"
  | "uploadFailed"
  | "alert";

export type PageTrigger = 
  | "START_SESSION"
  | "END_SESSION"
  | "EXPAND"
  | "COLLAPSE"
  | "PAUSE"
  | "RESUME"
  | "STOP"
  | "BACK"
  | "UPLOAD" // END_SESSION
  | "UPLOADED"
  | "FORCE_UPLOADED"
  | "UPLOADFAILED"
  | "EXIT"
  | "FINISH"
  | "INCLUDE_PAGE"
  | "EXCLUDE_PAGE";
