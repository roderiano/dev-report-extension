// Request representation
class RequestObject {
  constructor() {
    this.requestType = null;
    this.requestId = null;
    this.url = null;
    this.method = null;
    this.responseHeaders = null;
    this.requestHeaders = null;
    this.statusCode = null;
    this.responseBody = null;
    this.requestBody = null;
  }
}

// Array to store requests
var requests = [];

// Listeners
chrome.webRequest.onBeforeRequest.addListener(
  registerRequestObject,
  { urls: ["<all_urls>"] },
  ["extraHeaders", "requestBody"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  registerRequestHeaders,
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

chrome.webRequest.onCompleted.addListener(
  registerRequestResponse,
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
);

// Listeners callbacks
async function registerRequestObject(details) {
  var tabId = details.tabId;
  if (!await isCurrentTabId(tabId)) return;

  console.log(`Callback onBeforeRequest received from tab ` + tabId);
  var request = new RequestObject();
  request.url = details.url;
  request.method = details.method;
  request.requestType = details.type;
  request.requestId = details.requestId;

  if (details.requestBody && details.requestBody.raw)
    var postedString = decodeURIComponent(
      String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes))
    );
  request.requestBody = postedString;

  requests.push(request);
}

async function registerRequestHeaders(details) {
  var tabId = details.tabId;
  if (!await isCurrentTabId(tabId)) return;

  console.log(`Callback onBeforeSendHeaders received from tab ` + tabId);
  var request = getRequestByRequestId(details.requestId);

  request.requestHeaders = details.requestHeaders;
}

async function registerRequestResponse(details) {
  var tabId = details.tabId;
  if (!await isCurrentTabId(tabId)) return;

  console.log(`Callback onCompleted received from tab ` + tabId);
  var request = getRequestByRequestId(details.requestId);

  request.statusCode = details.statusCode;
  request.responseHeaders = details.responseHeaders;

  await fetch(details.url, {
    method: details.method,
    headers: formatHeaders(request.requestHeaders),
    body: request.requestBody
  })
    .then(async response => {
      request.responseBody = request.statusCode < 400 && response.status >= 400 ? "" : await response.text();
      saveRequests();
    })
    .catch(function (error) {
      console.log(
        "There has been a problem with your fetch operation: " + error.message,
      );
    });
}

// Stored tabId checker
function checkLocalStorageChanges() {
  if (isCurrentTabId(storedTabId)) return;

  chrome.storage.local.get(['tabId'], function (item) {
    storedTabId = item.tabId;
  });

  requests = [];
}
let storedTabId = null;
setInterval(checkLocalStorageChanges, 1000);

// Utils
function formatHeaders(headers) {
  const formattedHeaders = {};
  for (const header of headers) {
    if (formattedHeaders[header.name]) {
      formattedHeaders[header.name] += `, ${header.value}`;
    } else {
      formattedHeaders[header.name] = header.value;
    }
  }
  return formattedHeaders;
}

function isCurrentTabId(tabId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tabId'], function (items) {
      const storedTabId = items.tabId;
      resolve(Number(tabId) === Number(storedTabId));
    });
  });
}

function getRequestByRequestId(requestId) {
  return requests.find(request => request.requestId === requestId);
}

function saveRequests() {
  chrome.storage.local.set({ 'requests': JSON.stringify(requests, null, 2) }, function () {
    console.log("Request saved to memory:", requests);
  });
}
