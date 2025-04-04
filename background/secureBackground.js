// Background service worker

console.log("Background service worker started.");

// Listener for messages from popup or other scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received from:", sender);
  console.log("Message content:", message);

  if (message.action === "fetchLeads") {
    // TODO: Implement logic for fetching leads (potentially via content script messaging)
    console.log(
      "Received fetchLeads action, but logic is not implemented yet."
    );
    // Send a basic response to prevent the popup error
    sendResponse({
      success: false,
      error: "Fetch logic not implemented in background.",
    });
  } else if (message.action === "directFetch") {
    // TODO: Implement logic for direct fetch
    console.log(
      "Received directFetch action, but logic is not implemented yet."
    );
    sendResponse({
      success: false,
      error: "Direct fetch logic not implemented in background.",
    });
  } else {
    // Handle unknown actions or send an empty response
    sendResponse({});
  }

  // Return true to indicate you wish to send a response asynchronously
  // (Important if you do async work before calling sendResponse)
  // For this synchronous example, it's not strictly necessary but good practice.
  return true;
});

// Add other background script logic here (e.g., listeners for alarms, etc.)
// WASM logic has been removed from the background script due to loading difficulties.
// If WASM operations are needed by the background script, consider using
// message passing to the content script.
