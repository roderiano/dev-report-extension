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

chrome.webRequest.onBeforeSendHeaders.addListener(
  logCompletedRequest,
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

async function logCompletedRequest(details) {
  chrome.storage.sync.get(['tabId'], async function(items) {
    if (details.tabId == items.tabId && details.type === "xmlhttprequest") {

      var requestId = details.requestId;
      if (!capturedRequests[requestId]) {
        capturedRequests[requestId] = {
          request: null,
          response: null
        };
      }

      if (details.statusCode) {
        // É uma resposta
        capturedRequests[requestId].response = {
          url: details.url,
          method: details.method,
          responseHeaders: details.responseHeaders,
          statusCode: details.statusCode,
          responseBody: null
        };
        const response = await fetch(details.url, {
          method: details.method, 
          headers: formatHeaders(capturedRequests[requestId].request.requestHeaders),
          body: capturedRequests[requestId].request.requestBody
        })
        .then(response => response.text())
        .then(responseText => {
          capturedRequests[requestId].response.responseBody = responseText;
        })
      } else if (!details.requestHeaders) {
        capturedRequests[requestId].request = {
          url: details.url,
          method: details.method,
          requestBody: details.requestBody,
        };
      }
      else if(details.requestHeaders) {
        capturedRequests[requestId].request.requestHeaders = details.requestHeaders;
      }
      console.log(capturedRequests);
    }
  });
  
}

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

var capturedRequests = {};