chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message
  sendResponse({ response: 'Received in background' });
  return true; 
});