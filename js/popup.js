document.addEventListener('DOMContentLoaded', function () {
    routeScreen();

    var startReportButton = document.getElementById("startReport");
    startReportButton.addEventListener('click', function () {
        startRecord();
    });

    var stopReportButton = document.getElementById("stopReport");
    stopReportButton.addEventListener('click', function () {
        showStartScreen();
    });

});

function startRecord() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.storage.sync.set({'tabId': tabId}, function() {
            console.log('Listening to tab ' + tabId);
          });
        chrome.tabs.create({ url: `../html/popup.html?screen=capture&tab=${tabId}` });
    });
}

function routeScreen() {
    const extensionUrl = window.location.toString();
    const urlObject = new URL(extensionUrl);
    const params = new URLSearchParams(urlObject.search);
    const screenRoute = params.get('screen') ?? 'start';

    if(screenRoute == 'start')
    {
        showStartScreen();
    }
    else if(screenRoute == 'capture')
    {
        showCaptureScreen();
    }
        
    console.log(`Screen: `+ screenRoute);
}

function showCaptureScreen() {
    document.getElementById("start-screen").hidden = true;
    document.getElementById("capture-screen").hidden = false;
}

function showStartScreen() {
    document.getElementById("start-screen").hidden = false;
    document.getElementById("capture-screen").hidden = true;
}
