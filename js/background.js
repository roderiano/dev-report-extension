chrome.webRequest.onCompleted.addListener(
  logCompletedRequest,
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
  logCompletedRequest,
  { urls: ["<all_urls>"] },
  ["extraHeaders", "requestBody"]
);

function logCompletedRequest(details) {
  chrome.storage.sync.get(['tabId'], function(items) {
    if (details.tabId == items.tabId && details.type === "xmlhttprequest") {

      var requestId = details.requestId;

      // Verificar se já existe uma entrada para este requestId
      if (!capturedRequests[requestId]) {
        capturedRequests[requestId] = {
          request: null,
          response: null
        };
      }

      // Verificar se é uma solicitação ou uma resposta
      if (details.statusCode) {
        // É uma resposta
        capturedRequests[requestId].response = {
          url: details.url,
          method: details.method,
          responseHeaders: details.responseHeaders,
          statusCode: details.statusCode,
        };
      } else {
        // É uma solicitação
        capturedRequests[requestId].request = {
          url: details.url,
          method: details.method,
          requestBody: details.requestBody,
        };
      }

      console.log(capturedRequests[requestId]);
    }
  });
  
}

var capturedRequests = {};