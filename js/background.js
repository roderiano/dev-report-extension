chrome.webRequest.onCompleted.addListener(
  logCompletedRequest,
  { urls: ["<all_urls>"] }
);

function logCompletedRequest(details) {
  chrome.storage.sync.get(['tabId'], function(items) {
    if (details.tabId == items.tabId && details.type === "xmlhttprequest") {
      console.log("URL da Solicitação:", details.url);
      console.log("Método HTTP:", details.method);
      console.log("Cabeçalhos da Resposta:", details.responseHeaders);
      console.log("Código de Status da Resposta:", details.statusCode);

      if (details.requestBody) {
        console.log("Corpo da Solicitação:", details.requestBody);
      }

      fetch(details.url)
        .then(response => response.text())
        .then(responseText => console.log("Conteúdo da Resposta:", responseText));
    }
  });
}
