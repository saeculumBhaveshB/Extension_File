// Content script for Indiamart Lead Fetcher

// Function to check if we're on the Lead Manager page
function isLeadManagerPage() {
  return window.location.href.includes("seller.indiamart.com/messagecentre");
}

// Function to check if user is logged in - for paid customers, we assume they're always logged in
function isUserLoggedIn() {
  // For paid customers, always return true
  return true;
}

// Function to fetch lead data
function fetchLeadData(forceBypassLoginCheck = true) {
  console.log("Fetching lead data...");

  // Show a notification to the user
  showNotification("Fetching lead data...", "info", 0); // 0 means don't auto-hide

  // For paid customers, we always bypass login check
  console.log("Bypassing login check for paid customer");

  // Send message to background script
  chrome.runtime.sendMessage(
    {
      action: "fetchLeads",
      forceBypassLoginCheck: true, // Always true for paid customers
    },
    (response) => {
      console.log("Received response from background script:", response);

      // Hide the loading notification
      hideNotification();

      if (response && response.success) {
        const { leads, totalCount } = response.data;
        console.log(
          `Successfully fetched ${leads.length} leads out of ${totalCount} total`
        );

        if (leads.length === 0 && totalCount === 0) {
          showNotification(
            "No leads found. Please check if you have any leads in your account.",
            "warning"
          );
        } else if (leads.length === 0 && totalCount > 0) {
          showNotification(
            `Found ${totalCount} leads but couldn't fetch them. Please try the Direct Fetch or XHR Fetch method.`,
            "warning"
          );
        } else if (leads.length < totalCount) {
          showNotification(
            `Partially fetched ${leads.length} leads out of ${totalCount} total`,
            "warning"
          );
        } else {
          showNotification(
            `Successfully fetched ${leads.length} leads from Indiamart`
          );
        }
      } else {
        console.error(
          "Failed to fetch lead data:",
          response ? response.error : "Unknown error"
        );
        showNotification(
          "Failed to fetch lead data. Please try the Direct Fetch or XHR Fetch method.",
          "error"
        );
      }
    }
  );
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

// Function to use direct fetch method
function useDirectFetchMethod() {
  console.log("Using direct fetch method");

  // Show a notification to the user
  showNotification("Using direct fetch method...", "info", 0); // 0 means don't auto-hide

  // Send message to background script to use direct fetch method
  chrome.runtime.sendMessage(
    {
      action: "directFetch",
    },
    (response) => {
      console.log("Received response from background script:", response);

      // Hide the loading notification
      hideNotification();

      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
        showNotification(
          `Error: ${chrome.runtime.lastError.message}. Please check if you're logged in to Indiamart.`,
          "error"
        );
        return;
      }

      if (response && response.success) {
        const { leads, totalCount } = response.data;
        console.log(
          `Successfully fetched ${leads.length} leads out of ${totalCount} total using direct method`
        );

        if (leads.length === 0 && totalCount === 0) {
          showNotification(
            "No leads found using direct method. Make sure you are on the Lead Manager page and are logged in.",
            "warning"
          );
        } else if (leads.length === 0 && totalCount > 0) {
          showNotification(
            `Found ${totalCount} leads but couldn't fetch them using direct method. Please check console for details.`,
            "warning"
          );
        } else if (leads.length < totalCount) {
          showNotification(
            `Partially fetched ${leads.length} leads out of ${totalCount} total using direct method`,
            "warning"
          );
        } else {
          showNotification(
            `Successfully fetched ${leads.length} leads from Indiamart using direct method`
          );
        }
      } else {
        const errorMessage = response ? response.error : "Unknown error";
        console.error(
          "Failed to fetch lead data using direct method:",
          errorMessage
        );
        showNotification(
          `Failed to fetch lead data using direct method: ${errorMessage}. Please make sure you're logged in to Indiamart and try again.`,
          "error"
        );
      }
    }
  );
}

// Function to use XHR fetch method
function useXhrFetchMethod() {
  console.log("Using XHR fetch method");

  // Show a notification to the user
  showNotification("Using XHR fetch method...", "info", 0); // 0 means don't auto-hide

  // Send message to background script to use XHR fetch method
  chrome.runtime.sendMessage(
    {
      action: "xhrFetch",
    },
    (response) => {
      console.log("Received response from background script:", response);

      // Hide the loading notification
      hideNotification();

      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError);
        showNotification(
          `Error: ${chrome.runtime.lastError.message}. Please check if you're logged in to Indiamart.`,
          "error"
        );
        return;
      }

      if (response && response.success) {
        const { leads, totalCount } = response.data;
        console.log(
          `Successfully fetched ${leads.length} leads out of ${totalCount} total using XHR method`
        );

        if (leads.length === 0 && totalCount === 0) {
          showNotification(
            "No leads found using XHR method. Make sure you are on the Lead Manager page and are logged in.",
            "warning"
          );
        } else if (leads.length === 0 && totalCount > 0) {
          showNotification(
            `Found ${totalCount} leads but couldn't fetch them using XHR method. Please check console for details.`,
            "warning"
          );
        } else if (leads.length < totalCount) {
          showNotification(
            `Partially fetched ${leads.length} leads out of ${totalCount} total using XHR method`,
            "warning"
          );
        } else {
          showNotification(
            `Successfully fetched ${leads.length} leads from Indiamart using XHR method`
          );
        }
      } else {
        const errorMessage = response ? response.error : "Unknown error";
        console.error(
          "Failed to fetch lead data using XHR method:",
          errorMessage
        );
        showNotification(
          `Failed to fetch lead data using XHR method: ${errorMessage}. Please make sure you're logged in to Indiamart and try again.`,
          "error"
        );
      }
    }
  );
}

// Function to add a debug info panel
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

// Function to add fetch buttons to the page
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
  button.style.zIndex = "9999";
  button.style.padding = "10px 15px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.fontSize = "14px";
  button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";

  // Add hover effect
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "#45a049";
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "#4CAF50";
  });

  // Add click event
  button.addEventListener("click", () => {
    fetchLeadData();
  });

  // Create direct fetch button
  const directButton = document.createElement("button");
  directButton.id = "indiamart-direct-fetch-button";
  directButton.textContent = "Try Direct Fetch Method";
  directButton.style.position = "fixed";
  directButton.style.bottom = "60px";
  directButton.style.right = "20px";
  directButton.style.zIndex = "9999";
  directButton.style.padding = "10px 15px";
  directButton.style.backgroundColor = "#2196F3";
  directButton.style.color = "white";
  directButton.style.border = "none";
  directButton.style.borderRadius = "5px";
  directButton.style.cursor = "pointer";
  directButton.style.fontSize = "14px";
  directButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";

  // Add hover effect
  directButton.addEventListener("mouseover", () => {
    directButton.style.backgroundColor = "#1976D2";
  });
  directButton.addEventListener("mouseout", () => {
    directButton.style.backgroundColor = "#2196F3";
  });

  // Add click event
  directButton.addEventListener("click", () => {
    useDirectFetchMethod();
  });

  // Create XHR fetch button
  const xhrButton = document.createElement("button");
  xhrButton.id = "indiamart-xhr-fetch-button";
  xhrButton.textContent = "Try XHR Fetch Method";
  xhrButton.style.position = "fixed";
  xhrButton.style.bottom = "60px";
  xhrButton.style.right = "180px";
  xhrButton.style.zIndex = "9999";
  xhrButton.style.padding = "10px 15px";
  xhrButton.style.backgroundColor = "#9C27B0";
  xhrButton.style.color = "white";
  xhrButton.style.border = "none";
  xhrButton.style.borderRadius = "5px";
  xhrButton.style.cursor = "pointer";
  xhrButton.style.fontSize = "14px";
  xhrButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";

  // Add hover effect
  xhrButton.addEventListener("mouseover", () => {
    xhrButton.style.backgroundColor = "#7B1FA2";
  });
  xhrButton.addEventListener("mouseout", () => {
    xhrButton.style.backgroundColor = "#9C27B0";
  });

  // Add click event
  xhrButton.addEventListener("click", () => {
    useXhrFetchMethod();
  });

  // Add debug button
  const debugButton = document.createElement("button");
  debugButton.id = "indiamart-debug-button";
  debugButton.textContent = "Debug";
  debugButton.style.position = "fixed";
  debugButton.style.bottom = "100px";
  debugButton.style.right = "20px";
  debugButton.style.zIndex = "9999";
  debugButton.style.padding = "10px 15px";
  debugButton.style.backgroundColor = "#607D8B";
  debugButton.style.color = "white";
  debugButton.style.border = "none";
  debugButton.style.borderRadius = "5px";
  debugButton.style.cursor = "pointer";
  debugButton.style.fontSize = "14px";
  debugButton.style.boxShadow = "0 2px 5px rgba(0,0,0,0.3)";

  // Add hover effect
  debugButton.addEventListener("mouseover", () => {
    debugButton.style.backgroundColor = "#455A64";
  });
  debugButton.addEventListener("mouseout", () => {
    debugButton.style.backgroundColor = "#607D8B";
  });

  // Add click event
  debugButton.addEventListener("click", () => {
    addDebugPanel();
  });

  // Add buttons to page
  document.body.appendChild(button);
  document.body.appendChild(directButton);
  document.body.appendChild(xhrButton);
  document.body.appendChild(debugButton);
}

// Main function to initialize the content script
function initialize() {
  console.log("Indiamart Lead Fetcher content script initialized");

  if (isLeadManagerPage()) {
    console.log("Detected Lead Manager page");

    // Add fetch button
    addFetchButton();

    // Add debug panel
    addDebugPanel();

    // Wait a bit for the page to fully load before checking login status
    setTimeout(() => {
      const loggedIn = isUserLoggedIn();
      console.log("Login status check result:", loggedIn);

      if (!loggedIn) {
        console.warn("User does not appear to be logged in to Indiamart");
        showNotification(
          'Login not detected. You can use "Force Fetch" to bypass login check or try logging in again.',
          "warning",
          10000
        );
      } else {
        // Automatically fetch lead data when page loads
        fetchLeadData(false);
      }

      // Update debug panel with login status
      const debugPanel = document.getElementById("indiamart-debug-panel");
      if (debugPanel) {
        const loginStatusElement = document.createElement("p");
        loginStatusElement.innerHTML = `<strong>Login Status:</strong> ${
          loggedIn ? "Logged In" : "Not Logged In"
        }`;
        debugPanel.appendChild(loginStatusElement);

        // Add cookie info
        const cookieInfo = document.createElement("p");
        cookieInfo.innerHTML = `<strong>Cookies Present:</strong> ${
          document.cookie.includes("ImeshVisitor") ||
          document.cookie.includes("im_iss")
        }`;
        debugPanel.appendChild(cookieInfo);
      }
    }, 2000);
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
