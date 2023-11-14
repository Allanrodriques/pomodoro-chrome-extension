// background.js

let popupWindow;

chrome.runtime.onConnect.addListener(function (port) {
  // Keep reference to the popup window
  popupWindow = port.sender.tab.id;

  // Listen for disconnect event (e.g., when popup is closed)
  port.onDisconnect.addListener(function () {
    popupWindow = null;
  });
});

// Keep popup open when clicking outside
chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.onActivated.addListener(function () {
    if (popupWindow !== undefined && popupWindow !== null) {
      chrome.pageAction.show(popupWindow);
    }
  });
});
