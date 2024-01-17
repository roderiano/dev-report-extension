document.addEventListener('DOMContentLoaded', function () {
    routeScreen();

    var startReportButton = document.getElementById("startReport");
    startReportButton.addEventListener('click', function () {
        startRecord();
    });

    var stopReportButton = document.getElementById("stopReport");
    stopReportButton.addEventListener('click', function () {
        stopRecord();
    });

});

function startRecord() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.storage.sync.set({'tabId': tabId}, function() {
            console.log('Listening to tab ' + tabId);
          });
    });
    showCaptureScreen();
}

function stopRecord() {
    chrome.storage.sync.set({'tabId': null}, function() {
        console.log('Stop the listening...');
    });
    showStartScreen();
}

function routeScreen() {
    chrome.storage.sync.get(['tabId'], function(items) {
        if(!items.tabId) {
            showStartScreen();
        } else {
            showCaptureScreen();
        }
    });
}

function showCaptureScreen() {
    document.getElementById("start-screen").hidden = true;
    document.getElementById("capture-screen").hidden = false;
}

function showStartScreen() {
    document.getElementById("start-screen").hidden = false;
    document.getElementById("capture-screen").hidden = true;
}
