// Content script for Indiamart Lead Fetcher

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

// Function to trigger lead data fetching
function fetchLeadData(forceBypassLoginCheck = false) {
  console.log("Triggering lead data fetch from content script");

  // Check if user is logged in (unless we're forcing bypass)
  if (!forceBypassLoginCheck && !isUserLoggedIn()) {
    console.error("User is not logged in to Indiamart");
    showNotification("Please log in to your Indiamart account first", "error");
    return;
  }

  // Show a notification to the user
  showNotification("Fetching lead data from Indiamart...", "info", 0); // 0 means don't auto-hide

  // Send message to background script to fetch lead data
  chrome.runtime.sendMessage(
    {
      action: "fetchLeads",
      forceBypassLoginCheck: forceBypassLoginCheck,
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
            "No leads found. Make sure you are on the Lead Manager page and are logged in.",
            "warning"
          );
        } else if (leads.length === 0 && totalCount > 0) {
          showNotification(
            `Found ${totalCount} leads but couldn't fetch them. Please check console for details.`,
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
          "Failed to fetch lead data: " +
            (response ? response.error : "Unknown error"),
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
        console.error(
          "Failed to fetch lead data using direct method:",
          response ? response.error : "Unknown error"
        );
        showNotification(
          "Failed to fetch lead data using direct method: " +
            (response ? response.error : "Unknown error"),
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
