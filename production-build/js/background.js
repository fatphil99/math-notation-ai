// background.js - Minimal service worker for Math Notation AI


// Handle keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'screenshot-explain') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'screenshot-explain' })
          .catch(err => console.error('Failed to send message:', err));
      }
    });
  }
});

// Handle screenshot capture
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureVisibleTab') {
    if (!sender.tab) {
      sendResponse({ dataUrl: null });
      return;
    }

    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' })
      .then(dataUrl => sendResponse({ dataUrl }))
      .catch(err => {
        console.error('Screenshot capture failed:', err);
        sendResponse({ dataUrl: null });
      });

    return true; // Keep message channel open
  }
});
