
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
  chrome.storage.local.set({ 'requests': [] }, function () {
    console.log("Requests deleted from memory");
  });
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id;
    chrome.storage.local.set({ 'tabId': tabId }, function () {
      console.log('Listening to tab ' + tabId);
    });
  });

  routeScreen();
}

function loadJSZip(callback) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('./js/jszip.min.js');
  script.onload = callback;
  document.head.appendChild(script);
}

function getFileContent(fileURL) {
  return fetch(fileURL).then(response => response.text());
}

function stopRecord() {
  // Load JSZip dynamically
  loadJSZip(function () {
    chrome.storage.local.get('requests', async function (result) {
      const jsonData = result.requests;

      // Fetch content of preview.html
      const previewHtmlContent = await getFileContent(chrome.runtime.getURL('./html/preview.html'));

      // Create a zip file containing both preview.html and tabRequests.json
      const zip = new JSZip();

      // Add preview.html to the zip
      zip.file('preview.html', previewHtmlContent);

      // Add tabRequests.json to the zip
      zip.file('tabRequests.js', "var data = " + jsonData);

      // Generate the zip file
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // Trigger download of the zip file
        chrome.downloads.download({
          url: URL.createObjectURL(content),
          filename: 'extension_data.zip',
          saveAs: false,
          conflictAction: 'uniquify',
          method: 'GET'
        }, function (downloadId) {
          if (chrome.runtime.lastError) {
            console.error('Error downloading zip file:', chrome.runtime.lastError);
          } else {
            console.log('Zip file saved locally.');
          }
        });
      });

      chrome.storage.local.set({ 'tabId': null }, function () {
        console.log('Stop the listening...');
      });

      routeScreen();
    });
  });
}


function routeScreen() {
  chrome.storage.local.get(['tabId'], function (items) {
    if (!items.tabId) {
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
