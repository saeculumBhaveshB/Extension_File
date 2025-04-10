// Background service worker

console.log("Background service worker started.");

// Helper function to get the active Indiamart tab
async function getIndiamartTab() {
  const tabs = await chrome.tabs.query({
    active: true,
    currentWindow: true, // Check active tab in current window first
    url: "https://seller.indiamart.com/*",
  });
  if (tabs.length > 0) {
    return tabs[0];
  }
  // Fallback: Check any window if not found in current
  const allTabs = await chrome.tabs.query({
    url: "https://seller.indiamart.com/*",
  });
  if (allTabs.length > 0) {
    console.warn("Indiamart tab found, but not active in current window.");
    return allTabs[0]; // Return the first one found
  }
  return null; // No Indiamart tab found
}

// Listener for messages from popup or other scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received from:", sender);
  console.log("Message content:", message);

  if (message.action === "fetchLeads" || message.action === "directFetch") {
    // Forward the request to the content script on the Indiamart page
    (async () => {
      const tab = await getIndiamartTab();
      if (!tab || !tab.id) {
        sendResponse({
          success: false,
          error:
            "Could not find an active Indiamart tab. Please navigate to Indiamart Lead Manager.",
        });
        return;
      }

      try {
        // Send message to the specific tab's content script
        const response = await chrome.tabs.sendMessage(tab.id, {
          action:
            message.action === "fetchLeads"
              ? "scrapeLeads"
              : "scrapeLeadsDirect", // Use different actions if needed, or pass original
          // You might pass other parameters from the original message if needed
          // e.g., forceBypassLoginCheck: message.forceBypassLoginCheck
        });

        console.log("Response from content script:", response);

        if (response && response.success) {
          // Forward success response from content script to popup
          sendResponse({ success: true, data: response.data });
        } else {
          // Forward error response from content script or create a generic one
          sendResponse({
            success: false,
            error: response?.error || "Content script failed to fetch leads.",
          });
        }
      } catch (error) {
        console.error(
          `Error communicating with content script on tab ${tab.id}:`,
          error
        );
        // Handle errors like the content script not being injected or not responding
        if (
          error.message?.includes("Could not establish connection") ||
          error.message?.includes("Receiving end does not exist")
        ) {
          sendResponse({
            success: false,
            error:
              "Indiamart tab found, but the content script is not responding. Please refresh the Indiamart page.",
          });
        } else {
          sendResponse({
            success: false,
            error: `Failed to communicate with content script: ${error.message}`,
          });
        }
      }
    })(); // Immediately invoke the async function

    // Return true ONLY because we are using async operations (await) before sendResponse
    return true;
  }
  // Add a new handler for the API call
  else if (message.action === "makeApiCall") {
    const apiUrl = "https://webhook.site/0b1c45b7-1af7-4828-b345-b459276dfea5";
    console.log(`Background: Received request to call API: ${apiUrl}`);
    (async () => {
      try {
        const response = await fetch(apiUrl, { method: "GET" }); // Use GET as requested
        const responseText = await response.text();

        if (response.ok) {
          console.log(
            `Background: API call successful. Status: ${response.status}`
          );
          console.log("Background: API Response Text:", responseText);
          sendResponse({ success: true, responseText: responseText });
        } else {
          console.error(
            `Background: API call failed. Status: ${response.status}, Response: ${responseText}`
          );
          sendResponse({
            success: false,
            error: `API call failed with status ${response.status}`,
            responseText: responseText, // Still send back the text if available
          });
        }
      } catch (error) {
        console.error("Background: Error during fetch:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Indicate asynchronous response
  } else {
    // Handle unknown actions
    console.log("Unknown action received:", message.action);
    // Send an empty response for unknown actions if needed, or just ignore
    // sendResponse({}); // Optional: send empty response
  }

  // If we didn't handle the message asynchronously, return false or undefined
  // return false; // uncomment if you have synchronous paths that don't use sendResponse
});

console.log("Background script listeners set up.");
// Add other background script logic here (e.g., listeners for alarms, etc.)
// WASM logic has been removed from the background script due to loading difficulties.
// If WASM operations are needed by the background script, consider using
// message passing to the content script.
