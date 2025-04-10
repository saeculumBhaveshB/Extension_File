// Popup script for Indiamart Lead Fetcher

// Add this near the top of popup.js, outside any existing functions
import initWasm, {
  trigger_api,
} from "./secure-wasm-logic/pkg/secure_wasm_logic.js"; // Adjust path if needed!

let wasmApiInitialized = false;
let initPromise = null;

// Function to initialize WASM in the popup context
async function initializeWasmInPopup() {
  if (wasmApiInitialized) {
    console.log("Popup: WASM already initialized.");
    return true;
  }
  if (!initPromise) {
    console.log("Popup: Initializing WASM...");
    // Path relative to popup.html
    // The init function often needs the path to the *actual* wasm file
    initPromise = initWasm("./secure-wasm-logic/pkg/secure_wasm_logic_bg.wasm")
      .then(() => {
        wasmApiInitialized = true;
        console.log("Popup: WASM initialized successfully.");
        initPromise = null; // Clear promise after success
        return true;
      })
      .catch((error) => {
        console.error("Popup: Failed to initialize WASM:", error);
        initPromise = null; // Reset promise on failure
        wasmApiInitialized = false;
        return false;
      });
  }
  return initPromise;
}

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
    // Check if user is on Indiamart
    const isOnIndiamart = await checkIfOnIndiamart();

    if (!isOnIndiamart) {
      showStatus("Please navigate to Indiamart Lead Manager page first", true);
      return;
    }

    // Show loading indicator
    loadingElement.style.display = "block";
    loadingTextElement.textContent = "Fetching leads...";
    fetchButton.disabled = true;
    directFetchButton.disabled = true;

    // Send message to background script to fetch lead data
    // Force bypass login check when fetching from popup
    chrome.runtime.sendMessage(
      {
        action: "fetchLeads",
        forceBypassLoginCheck: true,
      },
      (response) => {
        // Hide loading indicator
        loadingElement.style.display = "none";
        fetchButton.disabled = false;
        directFetchButton.disabled = false;

        if (response && response.success) {
          const { leads, totalCount } = response.data;

          if (leads.length === 0 && totalCount === 0) {
            showStatus(
              "No leads found. Make sure you are logged in to Indiamart.",
              true
            );
          } else if (leads.length === 0 && totalCount > 0) {
            showStatus(
              `Found ${totalCount} leads but couldn't fetch them. Check console for details.`,
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
            `Failed to fetch lead data: ${
              response ? response.error : "Unknown error"
            }`,
            true
          );
        }
      }
    );
  } catch (error) {
    loadingElement.style.display = "none";
    fetchButton.disabled = false;
    directFetchButton.disabled = false;
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

        if (response && response.success) {
          const { leads, totalCount } = response.data;

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
          showStatus(
            `Direct fetch failed: ${
              response ? response.error : "Unknown error"
            }`,
            true
          );
        }
      }
    );
  } catch (error) {
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

// --- Consolidated DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup DOM Loaded. Setting up listeners.");

  // Initialize UI (from original listener)
  updateUI();

  // Setup for existing buttons (fetch, direct fetch, export, clear)
  if (fetchButton) fetchButton.addEventListener("click", fetchLeadData);
  if (directFetchButton)
    directFetchButton.addEventListener("click", useDirectFetchMethod);
  if (exportCsvButton) exportCsvButton.addEventListener("click", exportAsCSV);
  if (exportJsonButton)
    exportJsonButton.addEventListener("click", exportAsJSON);
  if (clearDataButton)
    clearDataButton.addEventListener("click", clearStoredData);

  // --- Setup for the WASM API button (Moved inside the single listener) ---
  const statusDiv = document.getElementById("status");
  const hitButton = document.getElementById("hitApiButtonPopup");

  if (hitButton) {
    console.log("WASM API Hit button found.");
    hitButton.addEventListener("click", async () => {
      console.log('Popup "Hit API" button clicked.');
      if (statusDiv) {
        statusDiv.textContent = "Initializing WASM...";
        statusDiv.className = "status"; // Reset class
      }

      console.log("Attempting to initialize WASM...");
      const wasmReady = await initializeWasmInPopup();

      if (!wasmReady) {
        console.error("Popup: WASM initialization FAILED.");
        if (statusDiv) {
          statusDiv.textContent = "Error: WASM failed to load.";
          statusDiv.className = "status error";
        }
        return; // Stop execution if WASM isn't ready
      }
      console.log("Popup: WASM initialization SUCCESS.");

      if (statusDiv) {
        statusDiv.textContent = "Triggering API POST via WASM...";
        statusDiv.className = "status";
      }

      const apiUrl =
        "https://webhook.site/0b1c45b7-1af7-4828-b345-b459276dfea5";
      const apiPayload = JSON.stringify({ licence: "testing" });

      try {
        console.log(`Popup: Calling WASM trigger_api with URL: ${apiUrl}`);
        const result = await trigger_api(apiUrl, apiPayload);
        console.log(
          "Popup: WASM trigger_api finished successfully. Result:",
          result
        ); // Log result
        if (statusDiv) {
          statusDiv.textContent = `API POST successful! Check service worker console.`;
          statusDiv.className = "status success";
        }
      } catch (error) {
        console.error("Popup: Error calling WASM trigger_api:", error); // More specific error log
        if (statusDiv) {
          statusDiv.textContent = `Error triggering API: ${error}`;
          statusDiv.className = "status error";
        }
      }
    });
  } else {
    console.error(
      "Popup: Hit API button (hitApiButtonPopup) NOT FOUND in popup.html!"
    );
    if (statusDiv) {
      statusDiv.textContent = "Error: Button not found."; // Simpler error message
      statusDiv.className = "status error";
    }
  }
  // --- End of WASM button setup ---
});
