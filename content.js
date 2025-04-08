// Content script for Indiamart Lead Fetcher

console.log("Content script initializing - Adding message listener first...");

// **MOVED TO TOP** Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(
    "Message listener at TOP triggered. Received from background:",
    message
  );

  if (
    message.action === "scrapeLeads" ||
    message.action === "scrapeLeadsDirect"
  ) {
    // Ensure dependent functions exist before calling them
    if (
      typeof showNotification !== "function" ||
      typeof handleScrapingRequest !== "function"
    ) {
      console.error(
        "Listener dependencies (showNotification/handleScrapingRequest) not ready!"
      );
      // Try to send an error response, though it might fail if sendResponse itself isn't ready?
      try {
        sendResponse({
          success: false,
          error: "Content script internal error: Functions not ready.",
        });
      } catch (e) {
        console.error("Failed to send error response from early listener", e);
      }
      return false; // Indicate synchronous response (or failure)
    }

    showNotification(
      `Received request from background (TOP listener): ${message.action}. Starting scrape...`,
      "info",
      10000
    );

    // Call the central scraping handler
    handleScrapingRequest(
      message.action,
      message // pass full message as params
    )
      .then((response) => {
        console.log(
          "Sending response back to background (TOP listener):",
          response
        );
        showNotification(
          `Scraping complete (TOP listener) for ${message.action}. Sending data back.`,
          response.success ? "success" : "error",
          5000
        );
        sendResponse(response);
      })
      .catch((error) => {
        console.error(
          `Error during scraping (TOP listener) for action ${message.action}:`,
          error
        );
        showNotification(
          `Scraping failed (TOP listener): ${error.message}`,
          "error",
          5000
        );
        sendResponse({
          success: false,
          error: error.message || "Unknown scraping error from TOP listener",
        });
      });

    // Return true because we will respond asynchronously
    return true;
  }

  // Optional: handle other actions if needed
  // Return false or undefined if we don't handle the message or respond synchronously
});

// ---- WASM Integration ----
let wasmApi = null; // To hold the imported WASM API module

async function getWasmApi() {
  if (!wasmApi) {
    console.log("Loading WASM API module...");
    try {
      // Dynamically import the secureContent.js script AS A MODULE
      // chrome.runtime.getURL is crucial here
      const module = await import(
        chrome.runtime.getURL("contentScripts/secureContent.js")
      );
      wasmApi = module.default; // We exported the API object as default
      console.log("WASM API module loaded:", wasmApi);
      // Optionally initialize right away, or let functions initialize on first call
      await wasmApi.initializeWasmOnce();
    } catch (error) {
      console.error("Failed to load WASM API module:", error);
      showNotification("Failed to load secure WASM module.", "error");
      wasmApi = null; // Ensure it's null on failure
    }
  }
  return wasmApi;
}

// **NEW** Test function to call from console or button
async function testWasmLicense() {
  console.log("Testing WASM License Validation...");
  showNotification("Testing WASM License...", "info");
  try {
    const api = await getWasmApi();
    if (api) {
      const key = "RAJU-SECURE-KEY";
      const isValid = await api.callValidateLicense(key);
      console.log(`WASM Test: Is license '${key}' valid?`, isValid);
      showNotification(
        `WASM Test: License '${key}' valid? ${isValid}`,
        isValid ? "success" : "warning"
      );

      const invalidKey = "WRONG-KEY";
      const isInvalidValid = await api.callValidateLicense(invalidKey);
      console.log(
        `WASM Test: Is license '${invalidKey}' valid?`,
        isInvalidValid
      );
      showNotification(
        `WASM Test: License '${invalidKey}' valid? ${isInvalidValid}`,
        isInvalidValid ? "success" : "warning"
      );

      // Test encryption
      const messageToEncrypt = "Test Message";
      const encryptedMsg = await api.callEncryptMessage(messageToEncrypt);
      console.log(`WASM Test: Encrypted '${messageToEncrypt}':`, encryptedMsg);
      showNotification(`WASM Test: Encrypted to '${encryptedMsg}'`, "success");
    } else {
      console.error("WASM API not available for testing.");
      showNotification("WASM API module failed to load.", "error");
    }
  } catch (error) {
    console.error("Error during WASM test:", error);
    showNotification(`Error during WASM test: ${error.message}`, "error");
  }
}

// Function to check if we're on the Lead Manager page
function isLeadManagerPage() {
  return window.location.href.includes("seller.indiamart.com/messagecentre");
}

// Function to check if user is logged in
function isUserLoggedIn() {
  // Check for multiple possible indicators of being logged in

  // Method 1: Check for common profile elements
  const userProfileElements = document.querySelectorAll(
    ".user-profile, .user-name, .logout-btn, .logout, .user-info"
  );
  if (userProfileElements.length > 0) {
    console.log("Login detected via profile elements");
    return true;
  }

  // Method 2: Check for session cookies
  const hasCookies =
    document.cookie.includes("ImeshVisitor") ||
    document.cookie.includes("im_iss") ||
    document.cookie.includes("xnHist");
  if (hasCookies) {
    console.log("Login detected via cookies");
    return true;
  }

  // Method 3: Check for lead manager specific elements that only appear when logged in
  const leadManagerElements = document.querySelectorAll(
    ".lead-list, .lead-item, .lead-container, .message-centre"
  );
  if (leadManagerElements.length > 0) {
    console.log("Login detected via lead manager elements");
    return true;
  }

  // Method 4: Check for any element with text containing username or account info
  const pageText = document.body.innerText;
  if (
    pageText.includes("My Account") ||
    pageText.includes("Sign Out") ||
    pageText.includes("Log Out") ||
    pageText.includes("Dashboard")
  ) {
    console.log("Login detected via page text");
    return true;
  }

  // Method 5: Check if URL contains authenticated sections
  if (
    window.location.href.includes("/messagecentre") ||
    window.location.href.includes("/dashboard")
  ) {
    console.log("Login detected via URL pattern");
    return true;
  }

  // If we've reached this point, we couldn't find any login indicators
  console.log("No login indicators found");
  return false;
}

// Function to trigger lead data fetching (NOW MAINLY FOR BUTTONS ON PAGE)
function fetchLeadData(forceBypassLoginCheck = false) {
  console.log("Triggering lead data fetch from content script button");

  if (!forceBypassLoginCheck && !isUserLoggedIn()) {
    console.error("User is not logged in to Indiamart");
    showNotification("Please log in to your Indiamart account first", "error");
    return;
  }

  showNotification("Fetching lead data from Indiamart...", "info", 0);

  // *** COMMENTED OUT: Message now comes FROM background script ***
  /*
  chrome.runtime.sendMessage(
    {
      action: "fetchLeads",
      forceBypassLoginCheck: forceBypassLoginCheck,
    },
    (response) => {
      // ... (response handling logic - might need adjustment later)
    }
  );
  */

  // *** INSTEAD: Call the scraping logic directly or trigger it ***
  // We need to call the actual scraping logic here now.
  // For consistency, let's use the same structure as the message listener
  // but call a local scraping function directly.
  handleScrapingRequest("scrapeLeads", forceBypassLoginCheck).then((result) => {
    hideNotification();
    // Handle the result (e.g., show notification)
    if (result.success) {
      const { leads, totalCount } = result.data;
      showNotification(
        `Local fetch: Successfully fetched ${leads.length} leads from Indiamart`
      );
    } else {
      showNotification(`Local fetch failed: ${result.error}`, "error");
    }
  });
}

// Function to hide notification
function hideNotification() {
  let notification = document.getElementById(
    "indiamart-lead-fetcher-notification"
  );
  if (notification) {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Function to show a notification to the user
function showNotification(message, type = "info", duration = 5000) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById(
    "indiamart-lead-fetcher-notification"
  );

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "indiamart-lead-fetcher-notification";
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "9999";
    notification.style.maxWidth = "300px";
    notification.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    notification.style.transition = "opacity 0.3s ease-in-out";
    document.body.appendChild(notification);
  }

  // Set notification style based on type
  if (type === "error") {
    notification.style.backgroundColor = "#f44336";
    notification.style.color = "white";
  } else if (type === "warning") {
    notification.style.backgroundColor = "#ff9800";
    notification.style.color = "white";
  } else if (type === "info") {
    notification.style.backgroundColor = "#2196F3";
    notification.style.color = "white";
  } else {
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
  }

  // Set notification message
  notification.textContent = message;

  // Show notification
  notification.style.opacity = "1";

  // Hide notification after specified duration (if not 0)
  if (duration > 0) {
    setTimeout(() => {
      hideNotification();
    }, duration);
  }
}

// Function to add a button to manually trigger data fetching
function addFetchButton() {
  // Check if button already exists
  if (document.getElementById("indiamart-fetch-button")) {
    return;
  }

  // Create button
  const button = document.createElement("button");
  button.id = "indiamart-fetch-button";
  button.textContent = "Fetch All Leads";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";
  button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  // Add hover effect
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "#45a049";
  });

  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "#4CAF50";
  });

  // Add click event listener
  button.addEventListener("click", () => {
    fetchLeadData(false); // Normal fetch with login check
  });

  // Add button to page
  document.body.appendChild(button);

  // Add Force Fetch button
  const forceButton = document.createElement("button");
  forceButton.id = "indiamart-force-fetch-button";
  forceButton.textContent = "Force Fetch (Bypass Login Check)";
  forceButton.style.position = "fixed";
  forceButton.style.bottom = "20px";
  forceButton.style.right = "180px";
  forceButton.style.padding = "10px 20px";
  forceButton.style.backgroundColor = "#FF9800";
  forceButton.style.color = "white";
  forceButton.style.border = "none";
  forceButton.style.borderRadius = "5px";
  forceButton.style.cursor = "pointer";
  forceButton.style.zIndex = "9999";
  forceButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  // Add hover effect
  forceButton.addEventListener("mouseover", () => {
    forceButton.style.backgroundColor = "#F57C00";
  });

  forceButton.addEventListener("mouseout", () => {
    forceButton.style.backgroundColor = "#FF9800";
  });

  // Add click event listener
  forceButton.addEventListener("click", () => {
    fetchLeadData(true); // Force fetch with login check bypassed
  });

  // Add button to page
  document.body.appendChild(forceButton);

  // Add Direct Fetch button
  const directButton = document.createElement("button");
  directButton.id = "indiamart-direct-fetch-button";
  directButton.textContent = "Try Direct Fetch Method";
  directButton.style.position = "fixed";
  directButton.style.bottom = "60px";
  directButton.style.right = "20px";
  directButton.style.padding = "10px 20px";
  directButton.style.backgroundColor = "#2196F3";
  directButton.style.color = "white";
  directButton.style.border = "none";
  directButton.style.borderRadius = "5px";
  directButton.style.cursor = "pointer";
  directButton.style.zIndex = "9999";
  directButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";

  // Add hover effect
  directButton.addEventListener("mouseover", () => {
    directButton.style.backgroundColor = "#0b7dda";
  });

  directButton.addEventListener("mouseout", () => {
    directButton.style.backgroundColor = "#2196F3";
  });

  // Add click event listener
  directButton.addEventListener("click", () => {
    useDirectFetchMethod();
  });

  // Add button to page
  document.body.appendChild(directButton);
}

// Function to handle direct fetch method logic (NOW MAINLY FOR BUTTONS ON PAGE)
function useDirectFetchMethod() {
  console.log("Using direct fetch method from content script button");

  showNotification("Fetching leads using direct method...", "info", 0);

  // *** COMMENTED OUT: Message now comes FROM background script ***
  /*
  chrome.runtime.sendMessage(
    {
      action: "directFetch",
    },
    (response) => {
        // ... (response handling logic)
    }
  );
  */
  // *** INSTEAD: Call the scraping logic directly or trigger it ***
  handleScrapingRequest("scrapeLeadsDirect").then((result) => {
    hideNotification();
    if (result.success) {
      const { leads, totalCount } = result.data;
      showNotification(
        `Local direct fetch: Successfully fetched ${leads.length} leads`
      );
    } else {
      showNotification(`Local direct fetch failed: ${result.error}`, "error");
    }
  });
}

// Function to add a debug panel
function addDebugPanel() {
  // Check if panel already exists
  if (document.getElementById("indiamart-debug-panel")) {
    return;
  }

  // Create panel
  const panel = document.createElement("div");
  panel.id = "indiamart-debug-panel";
  panel.style.position = "fixed";
  panel.style.bottom = "80px";
  panel.style.right = "20px";
  panel.style.padding = "10px";
  panel.style.backgroundColor = "#f5f5f5";
  panel.style.border = "1px solid #ddd";
  panel.style.borderRadius = "5px";
  panel.style.zIndex = "9998";
  panel.style.width = "300px";
  panel.style.maxHeight = "200px";
  panel.style.overflowY = "auto";
  panel.style.fontSize = "12px";
  panel.style.display = "none";

  // Add debug info
  panel.innerHTML = `
    <h3 style="margin-top: 0;">Debug Info</h3>
    <p><strong>URL:</strong> ${window.location.href}</p>
    <p><strong>Logged in:</strong> ${isUserLoggedIn() ? "Yes" : "No"}</p>
    <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
    <button id="indiamart-debug-check-cookies">Check Cookies</button>
  `;

  // Add panel to page
  document.body.appendChild(panel);

  // Add event listener to check cookies button
  document
    .getElementById("indiamart-debug-check-cookies")
    .addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "checkCookies" }, (response) => {
        if (response && response.cookies) {
          const cookieInfo = document.createElement("div");
          cookieInfo.innerHTML = `<p><strong>Cookies:</strong> ${response.cookies.join(
            ", "
          )}</p>`;
          panel.appendChild(cookieInfo);
        }
      });
    });

  // Add debug toggle button
  const debugToggle = document.createElement("button");
  debugToggle.id = "indiamart-debug-toggle";
  debugToggle.textContent = "Debug";
  debugToggle.style.position = "fixed";
  debugToggle.style.bottom = "20px";
  debugToggle.style.right = "150px";
  debugToggle.style.padding = "10px 20px";
  debugToggle.style.backgroundColor = "#2196F3";
  debugToggle.style.color = "white";
  debugToggle.style.border = "none";
  debugToggle.style.borderRadius = "5px";
  debugToggle.style.cursor = "pointer";
  debugToggle.style.zIndex = "9999";

  // Add click event listener to toggle debug panel
  debugToggle.addEventListener("click", () => {
    if (panel.style.display === "none") {
      panel.style.display = "block";
    } else {
      panel.style.display = "none";
    }
  });

  // Add button to page
  document.body.appendChild(debugToggle);
}

// **NEW** Central function to handle scraping logic (called by listener or buttons)
async function handleScrapingRequest(action, params) {
  // TODO: Implement the actual scraping logic here.
  // This function should find leads on the current page,
  // extract the data, possibly navigate pagination, etc.
  // Use 'action' to differentiate between normal and direct if needed.
  // 'params' can contain other data passed from the background/popup.
  console.log(`Handling scraping action: '${action}' with params:`, params);

  // Simulate scraping delay and return dummy data
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate 2 seconds

  const dummyLeads = [
    {
      name: "Dummy Lead 1",
      email: "dummy1@example.com",
      phone: "1234567890",
      source: action,
    },
    {
      name: "Dummy Lead 2",
      email: "dummy2@example.com",
      phone: "0987654321",
      source: action,
    },
  ];
  console.log("Dummy scraping complete.");
  return {
    success: true,
    data: { leads: dummyLeads, totalCount: dummyLeads.length },
  };
  // In case of error during scraping:
  // return { success: false, error: "Failed to scrape leads due to XYZ." };
}

// Modify initialize to add a WASM test button
function initialize() {
  console.log("Indiamart Lead Fetcher content script initializing...");

  if (isLeadManagerPage()) {
    console.log("On Lead Manager page. Adding fetch button and debug panel.");
    addFetchButton(); // Existing button
    addDebugPanel(); // Existing panel

    // **NEW** Add WASM Test Button
    if (!document.getElementById("indiamart-wasm-test-button")) {
      const testButton = document.createElement("button");
      testButton.id = "indiamart-wasm-test-button";
      testButton.textContent = "Test WASM";
      testButton.style.position = "fixed";
      testButton.style.bottom = "70px"; // Adjust position relative to debug panel/other buttons
      testButton.style.right = "180px"; // Adjust position
      testButton.style.padding = "5px 10px";
      testButton.style.backgroundColor = "#607D8B"; // Blue Grey
      testButton.style.color = "white";
      testButton.style.border = "none";
      testButton.style.borderRadius = "3px";
      testButton.style.cursor = "pointer";
      testButton.style.zIndex = "9999";
      testButton.style.fontSize = "12px";
      testButton.addEventListener("click", testWasmLicense);
      document.body.appendChild(testButton);
    }

    showNotification("Indiamart Lead Fetcher is active!", "success", 3000);
  } else {
    console.log("Not on Lead Manager page.");
  }
}

// Initialize when the page is fully loaded
if (document.readyState === "complete") {
  initialize();
} else {
  window.addEventListener("load", initialize);
}

// Listen for navigation events (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isLeadManagerPage()) {
      console.log("Navigation detected to Lead Manager page");
      addFetchButton();
      addDebugPanel();
    }
  }
}).observe(document, { subtree: true, childList: true });
