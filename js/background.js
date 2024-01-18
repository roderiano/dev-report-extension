// Request representation
var requests = [];

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
  if(!await isCurrentTabId(tabId))
    return;
  
  console.log(`onBeforeRequest callback received from tab ` + tabId);
  var request = new RequestObject();
  request.url = details.url;
  request.method = details.method;
  request.requestType = details.type;
  request.requestId = details.requestId;
  request.requestBody = details.requestBody;
  requests.push(request);
}

async function registerRequestHeaders(details) {
  var tabId = details.tabId;
  if(!await isCurrentTabId(tabId))
    return;
  
  console.log(`onBeforeSendHeaders callback received from tab ` + tabId);
  var request = getRequestByRequestId(details.requestId);
  request.requestHeaders = details.requestHeaders;
}

async function registerRequestResponse(details) {
  var tabId = details.tabId;
  if(!await isCurrentTabId(tabId))
    return;
  
  console.log(`onCompleted callback received from tab ` + tabId);
  var request = getRequestByRequestId(details.requestId);
  request.statusCode = details.statusCode;
  request.responseHeaders = details.responseHeaders;
  
  await fetch(details.url, {
    method: details.method, 
    headers: formatHeaders(request.requestHeaders),
    body: request.requestBody
  })
  .then(response => response.text())
  .then(responseText => {
    request.responseBody = responseText;
  });
}

// Stored tabId checker
function checkLocalStorageChanges() {
  if(isCurrentTabId(storedTabId))
    return;

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