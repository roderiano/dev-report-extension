
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
    chrome.storage.local.set({'requests': []}, function() {
        console.log("Requests deleted from memory");
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;
        chrome.storage.local.set({'tabId': tabId}, function() {
            console.log('Listening to tab ' + tabId);
        });
    });
    
    routeScreen();
}

function stopRecord() {
    chrome.storage.local.get('requests', function(result) {
        const blob = new Blob([result.requests], { type: 'application/json' });
        const blobURL = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobURL;
        downloadLink.download = 'tabRequests.json';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
    
    chrome.storage.local.set({'tabId': null}, function() {
        console.log('Stop the listening...');
    });

    routeScreen();
}

function routeScreen() {
    chrome.storage.local.get(['tabId'], function(items) {
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
