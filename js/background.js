// background.js

let extensionWindowState = {};

chrome.action.onClicked.addListener(function(tab) {
  if (extensionWindowState.isOpen) {
    console.log("Fechando a extensão...");
    chrome.windows.remove(extensionWindowState.windowId, function () {
      console.log("Extensão fechada com sucesso.");
      extensionWindowState.isOpen = false;
      extensionWindowState.windowId = null;
      saveExtensionState();
    });
  } else {
    console.log("Abrindo a extensão...");
    chrome.windows.create({
      url: "main.html",
      type: "popup",
      width: 600,
      height: 400
    }, function (window) {
      console.log("Extensão aberta com sucesso.");
      extensionWindowState.isOpen = true;
      extensionWindowState.windowId = window.id;
      saveExtensionState();
    });
  }
});

function saveExtensionState() {
  // Salva o estado
  chrome.storage.local.set({ extensionWindowState }, function () {
    console.log("Estado da extensão salvo:", extensionWindowState);
  });
}

// Adiciona um listener para salvar o estado quando a janela for fechada pelo usuário
chrome.windows.onRemoved.addListener(function (windowId) {
  if (extensionWindowState.windowId === windowId) {
    console.log("Janela da extensão fechada pelo usuário.");
    extensionWindowState.isOpen = false;
    extensionWindowState.windowId = null;
    saveExtensionState();
  }
});

// Restaura o estado salvo ao iniciar a extensão
chrome.storage.local.get("extensionWindowState", function (result) {
  extensionWindowState = result.extensionWindowState || {};
  console.log("Estado da extensão restaurado:", extensionWindowState);
});
