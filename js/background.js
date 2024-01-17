// chrome.webRequest.onCompleted.addListener(
//   logCompletedRequest,
//   { urls: ["<all_urls>"] },
//   ["responseHeaders", "extraHeaders"]
// );

chrome.webRequest.onBeforeRequest.addListener(
  logCompletedRequest,
  { urls: ["<all_urls>"] },
  ["extraHeaders", "requestBody"]
);

function logCompletedRequest(details) {
  chrome.storage.sync.get(['tabId'], function(items) {
    if (details.tabId == items.tabId && details.type === "xmlhttprequest") {

      var requestInfo = {
        requestId: details.requestId,
        url: details.url,
        method: details.method,
        responseHeaders: details.responseHeaders,
        statusCode: details.statusCode,
        requestBody: details.requestBody,
      };

      saveRequestToChromeStorage(requestInfo);
    }
  });
}

function saveRequestToChromeStorage(requestInfo) {
  console.log(requestInfo);
  // Recuperar as informações já armazenadas no chrome.storage.sync (se houver)
  chrome.storage.sync.get(['storedRequests'], function(data) {
    var storedRequests = data.storedRequests || [];

    // Adicionar a nova solicitação às informações armazenadas
    storedRequests.push(requestInfo);

    // Salvar as informações atualizadas no chrome.storage.sync
    // chrome.storage.sync.set({'storedRequests': storedRequests}, function() {
    // });
  });
}
