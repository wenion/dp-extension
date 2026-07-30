export async function connect() {
  return chrome.runtime.sendMessage({
    type: "CONTENT/CONNECT",    
    source: "CONTENT",
  });
}

export function startSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/START",
    source: "CONTENT",
  })
}

export function endSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/END",
    source: "CONTENT",
  })
}

export function exit() {
  chrome.runtime.sendMessage({
    type: "SESSION/EXIT",
    source: "CONTENT",
  });
}

export function expand() {
  chrome.runtime.sendMessage({
    type: "PAGE/EXPAND",
    source: "CONTENT",
  })
}

export function collapse() {
  chrome.runtime.sendMessage({
    type: "PAGE/COLLAPSE",
    source: "CONTENT",
  })
}

export function pauseSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/PAUSE",
    source: "CONTENT",
  })
}

export function resumeSession() {
  chrome.runtime.sendMessage({
    type: "SESSION/RESUME",
    source: "CONTENT",
  })
}

export function stop() {
  chrome.runtime.sendMessage({
    type: "PAGE/STOP",
    source: "CONTENT",
  })
}

export function cancelStop() {
  chrome.runtime.sendMessage({
    type: "PAGE/BACK",
    source: "CONTENT",
  })
}

export function finishUploaded() {
  chrome.runtime.sendMessage({
    type: "SESSION/FINISH_UPLOADED",
    source: "CONTENT",
  })
}

export function finishFailed() {
  chrome.runtime.sendMessage({
    type: "SESSION/FINISH_FAILED",
    source: "CONTENT",
  })
}

export function includeTab() {
  chrome.runtime.sendMessage({
    type: "TAB/INCLUDE",
    source: "CONTENT",
  })
}

export function excludeTab() {
  chrome.runtime.sendMessage({
    type: "TAB/EXCLUDE",
    source: "CONTENT",
  })
}

export function openOptionsPage() {
  chrome.runtime.sendMessage({
    type: "TAB/OPEN_OPTIONS",
    source: "CONTENT",
  })
}
