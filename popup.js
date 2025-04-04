// Popup script for Indiamart Lead Fetcher

// DOM elements
const totalLeadsElement = document.getElementById("total-leads");
const lastFetchedElement = document.getElementById("last-fetched");
const fetchButton = document.getElementById("fetch-btn");
const exportCsvButton = document.getElementById("export-csv-btn");
const exportJsonButton = document.getElementById("export-json-btn");
const clearDataButton = document.getElementById("clear-data-btn");
const loadingElement = document.getElementById("loading");
const statusElement = document.getElementById("status");
const loadingTextElement = document.getElementById("loading-text");

// Add Direct Fetch button
const directFetchButton = document.createElement("button");
directFetchButton.id = "direct-fetch-btn";
directFetchButton.textContent = "Try Direct Fetch Method";
directFetchButton.style.backgroundColor = "#FF9800";
directFetchButton.style.marginTop = "10px";

// Insert the button after the regular fetch button
fetchButton.parentNode.insertBefore(directFetchButton, fetchButton.nextSibling);

// Function to format date
function formatDate(dateString) {
  if (!dateString) return "Never";

  const date = new Date(dateString);
  return date.toLocaleString();
}

// Function to show status message
function showStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.className = "status " + (isError ? "error" : "success");

  // Hide status after 5 seconds
  setTimeout(() => {
    statusElement.className = "status";
  }, 5000);
}

// Function to update UI with stored data
function updateUI() {
  chrome.storage.local.get(["indiamartLeads", "lastFetchTime"], (result) => {
    const leads = result.indiamartLeads || [];
    const lastFetchTime = result.lastFetchTime;

    totalLeadsElement.textContent = leads.length;
    lastFetchedElement.textContent = formatDate(lastFetchTime);

    // Enable/disable export buttons based on whether there are leads
    const hasLeads = leads.length > 0;
    exportCsvButton.disabled = !hasLeads;
    exportJsonButton.disabled = !hasLeads;
    clearDataButton.disabled = !hasLeads;

    // Show a message if no leads have been fetched
    if (!hasLeads && !lastFetchTime) {
      showStatus(
        'No leads have been fetched yet. Click "Fetch All Leads Now" to get started.',
        false
      );
    }
  });
}

// Function to check if user is on Indiamart
function checkIfOnIndiamart() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const isOnIndiamart =
        currentTab &&
        currentTab.url &&
        currentTab.url.includes("seller.indiamart.com");
      resolve(isOnIndiamart);
    });
  });
}

// Function to fetch lead data
async function fetchLeadData() {
  try {
    // Show loading indicator
    loadingElement.style.display = "block";
    loadingTextElement.textContent = "Fetching leads...";
    fetchButton.disabled = true;
    directFetchButton.disabled = true;
    xhrFetchButton.disabled = true;

    // Clear any previous status messages
    statusElement.className = "status";
    statusElement.textContent = "";
    statusElement.style.display = "none";

    console.log("Initiating lead fetch from popup");

    // For paid customers, we'll try the direct fetch method first
    chrome.runtime.sendMessage(
      {
        action: "directFetch",
      },
      (response) => {
        // Hide loading indicator
        loadingElement.style.display = "none";
        fetchButton.disabled = false;
        directFetchButton.disabled = false;
        xhrFetchButton.disabled = false;

        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          showStatus(
            `Error: ${chrome.runtime.lastError.message}. Please try a different fetch method.`,
            true
          );
          return;
        }

        if (response && response.success) {
          const { leads, totalCount } = response.data;

          if (leads.length === 0 && totalCount === 0) {
            showStatus(
              "No leads found. Please check if you have any leads in your account.",
              true
            );
          } else if (leads.length === 0 && totalCount > 0) {
            showStatus(
              `Found ${totalCount} leads but couldn't fetch them. Please try the XHR Fetch method.`,
              true
            );
          } else if (leads.length < totalCount) {
            showStatus(
              `Partially fetched ${leads.length} leads out of ${totalCount} total`
            );
          } else {
            showStatus(
              `Successfully fetched ${leads.length} leads out of ${totalCount} total`
            );
          }

          updateUI();
        } else {
          showStatus(
            `Failed to fetch leads: ${
              response ? response.error : "Unknown error"
            }. Please try a different fetch method.`,
            true
          );
        }
      }
    );
  } catch (error) {
    loadingElement.style.display = "none";
    fetchButton.disabled = false;
    directFetchButton.disabled = false;
    xhrFetchButton.disabled = false;
    showStatus(`Error: ${error.message}`, true);
  }
}

// Function to use direct fetch method
async function useDirectFetchMethod() {
  try {
    // Show loading indicator
    loadingElement.style.display = "block";
    loadingTextElement.textContent = "Using direct fetch method...";
    fetchButton.disabled = true;
    directFetchButton.disabled = true;

    // Clear any previous status messages
    statusElement.className = "status";
    statusElement.textContent = "";
    statusElement.style.display = "none";

    console.log("Initiating direct fetch method...");

    // Send message to background script to use direct fetch method
    chrome.runtime.sendMessage(
      {
        action: "directFetch",
      },
      (response) => {
        // Hide loading indicator
        loadingElement.style.display = "none";
        fetchButton.disabled = false;
        directFetchButton.disabled = false;

        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          showStatus(
            `Error: ${chrome.runtime.lastError.message}. Please check if you're logged in to Indiamart.`,
            true
          );
          return;
        }

        if (response && response.success) {
          const { leads, totalCount } = response.data;
          console.log(
            `Direct fetch results: ${leads.length} leads out of ${totalCount} total`
          );

          if (leads.length === 0 && totalCount === 0) {
            showStatus(
              "No leads found using direct method. Make sure you are logged in to Indiamart.",
              true
            );
          } else if (leads.length === 0 && totalCount > 0) {
            showStatus(
              `Found ${totalCount} leads but couldn't fetch them using direct method.`,
              true
            );
          } else if (leads.length < totalCount) {
            showStatus(
              `Partially fetched ${leads.length} leads out of ${totalCount} total using direct method`
            );
          } else {
            showStatus(
              `Successfully fetched ${leads.length} leads out of ${totalCount} total using direct method`
            );
          }

          updateUI();
        } else {
          const errorMessage = response ? response.error : "Unknown error";
          console.error("Direct fetch failed:", errorMessage);
          showStatus(
            `Direct fetch failed: ${errorMessage}. Please make sure you're logged in to Indiamart.`,
            true
          );
        }
      }
    );
  } catch (error) {
    console.error("Error in direct fetch method:", error);
    loadingElement.style.display = "none";
    fetchButton.disabled = false;
    directFetchButton.disabled = false;
    showStatus(`Error with direct fetch: ${error.message}`, true);
  }
}

// Function to convert leads to CSV
function leadsToCSV(leads) {
  if (!leads || !leads.length) return "";

  // Get all unique keys from all leads
  const allKeys = new Set();
  leads.forEach((lead) => {
    Object.keys(lead).forEach((key) => allKeys.add(key));
  });

  // Convert Set to Array and sort
  const headers = Array.from(allKeys).sort();

  // Create CSV header row
  let csv = headers.join(",") + "\n";

  // Add data rows
  leads.forEach((lead) => {
    const row = headers.map((header) => {
      let value = lead[header] || "";

      // Handle values that need quotes (contain commas, quotes, or newlines)
      if (
        typeof value === "string" &&
        (value.includes(",") || value.includes('"') || value.includes("\n"))
      ) {
        // Escape quotes by doubling them
        value = value.replace(/"/g, '""');
        // Wrap in quotes
        value = `"${value}"`;
      }

      return value;
    });

    csv += row.join(",") + "\n";
  });

  return csv;
}

// Function to export leads as CSV
function exportAsCSV() {
  // Show loading indicator
  loadingElement.style.display = "block";
  loadingTextElement.textContent = "Preparing CSV...";

  chrome.storage.local.get("indiamartLeads", (result) => {
    const leads = result.indiamartLeads || [];

    // Hide loading indicator
    loadingElement.style.display = "none";

    if (leads.length === 0) {
      showStatus("No leads to export", true);
      return;
    }

    const csv = leadsToCSV(leads);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Create a link and click it to download the file
    const a = document.createElement("a");
    a.href = url;
    a.download = `indiamart-leads-${timestamp}.csv`;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);

    showStatus(`Exported ${leads.length} leads as CSV`);
  });
}

// Function to export leads as JSON
function exportAsJSON() {
  // Show loading indicator
  loadingElement.style.display = "block";
  loadingTextElement.textContent = "Preparing JSON...";

  chrome.storage.local.get("indiamartLeads", (result) => {
    const leads = result.indiamartLeads || [];

    // Hide loading indicator
    loadingElement.style.display = "none";

    if (leads.length === 0) {
      showStatus("No leads to export", true);
      return;
    }

    const json = JSON.stringify(leads, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Create a link and click it to download the file
    const a = document.createElement("a");
    a.href = url;
    a.download = `indiamart-leads-${timestamp}.json`;
    a.click();

    // Clean up
    URL.revokeObjectURL(url);

    showStatus(`Exported ${leads.length} leads as JSON`);
  });
}

// Function to clear stored data
function clearStoredData() {
  if (confirm("Are you sure you want to clear all stored lead data?")) {
    // Show loading indicator
    loadingElement.style.display = "block";
    loadingTextElement.textContent = "Clearing data...";

    chrome.storage.local.remove(["indiamartLeads", "lastFetchTime"], () => {
      // Hide loading indicator
      loadingElement.style.display = "none";

      updateUI();
      showStatus("All lead data has been cleared");
    });
  }
}

// Add event listeners
fetchButton.addEventListener("click", fetchLeadData);
directFetchButton.addEventListener("click", useDirectFetchMethod);
exportCsvButton.addEventListener("click", exportAsCSV);
exportJsonButton.addEventListener("click", exportAsJSON);
clearDataButton.addEventListener("click", clearStoredData);

// Initialize UI when popup is opened
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  fetchButton = document.getElementById("fetch-btn");
  directFetchButton = document.getElementById("direct-fetch-btn");
  xhrFetchButton = document.getElementById("xhr-fetch-btn");
  exportCsvButton = document.getElementById("export-csv-btn");
  exportJsonButton = document.getElementById("export-json-btn");
  clearDataButton = document.getElementById("clear-data-btn");
  totalLeadsElement = document.getElementById("total-leads");
  lastFetchedElement = document.getElementById("last-fetched");
  statusElement = document.getElementById("status");
  loadingElement = document.getElementById("loading");
  loadingTextElement = document.getElementById("loading-text");

  // Update UI with stored data
  updateUI();

  // Add event listeners
  fetchButton.addEventListener("click", fetchLeadData);
  directFetchButton.addEventListener("click", useDirectFetchMethod);
  xhrFetchButton.addEventListener("click", useXhrFetchMethod);
  exportCsvButton.addEventListener("click", exportAsCSV);
  exportJsonButton.addEventListener("click", exportAsJSON);
  clearDataButton.addEventListener("click", clearStoredData);
});

// Function to use XHR fetch method
async function useXhrFetchMethod() {
  try {
    // Show loading indicator
    loadingElement.style.display = "block";
    loadingTextElement.textContent = "Using XHR fetch method...";
    fetchButton.disabled = true;
    directFetchButton.disabled = true;
    xhrFetchButton.disabled = true;

    // Clear any previous status messages
    statusElement.className = "status";
    statusElement.textContent = "";
    statusElement.style.display = "none";

    console.log("Initiating XHR fetch method...");

    // Send message to background script to use XHR fetch method
    chrome.runtime.sendMessage(
      {
        action: "xhrFetch",
      },
      (response) => {
        // Hide loading indicator
        loadingElement.style.display = "none";
        fetchButton.disabled = false;
        directFetchButton.disabled = false;
        xhrFetchButton.disabled = false;

        if (chrome.runtime.lastError) {
          console.error("Runtime error:", chrome.runtime.lastError);
          showStatus(
            `Error: ${chrome.runtime.lastError.message}. Please check if you're logged in to Indiamart.`,
            true
          );
          return;
        }

        if (response && response.success) {
          const { leads, totalCount } = response.data;
          console.log(
            `XHR fetch results: ${leads.length} leads out of ${totalCount} total`
          );

          if (leads.length === 0 && totalCount === 0) {
            showStatus(
              "No leads found using XHR method. Make sure you are logged in to Indiamart.",
              true
            );
          } else if (leads.length === 0 && totalCount > 0) {
            showStatus(
              `Found ${totalCount} leads but couldn't fetch them using XHR method.`,
              true
            );
          } else if (leads.length < totalCount) {
            showStatus(
              `Partially fetched ${leads.length} leads out of ${totalCount} total using XHR method`
            );
          } else {
            showStatus(
              `Successfully fetched ${leads.length} leads out of ${totalCount} total using XHR method`
            );
          }

          updateUI();
        } else {
          const errorMessage = response ? response.error : "Unknown error";
          console.error("XHR fetch failed:", errorMessage);
          showStatus(
            `XHR fetch failed: ${errorMessage}. Please make sure you're logged in to Indiamart.`,
            true
          );
        }
      }
    );
  } catch (error) {
    console.error("Error in XHR fetch method:", error);
    loadingElement.style.display = "none";
    fetchButton.disabled = false;
    directFetchButton.disabled = false;
    xhrFetchButton.disabled = false;
    showStatus(`Error with XHR fetch: ${error.message}`, true);
  }
}
