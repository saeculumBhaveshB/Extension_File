// Popup script for Indiamart Lead Fetcher

// We are not importing from api.js anymore
// import { getApiUrl } from './build/api.js';

// DOM elements
const totalLeadsElement = document.getElementById("total-leads");
const lastFetchedElement = document.getElementById("last-fetched");
const fetchButton = document.getElementById("fetch-btn");
const hitApiButton = document.getElementById("hit-api-btn");
const exportCsvButton = document.getElementById("export-csv-btn");
const exportJsonButton = document.getElementById("export-json-btn");
const clearDataButton = document.getElementById("clear-data-btn");
const loadingElement = document.getElementById("loading");
const statusElement = document.getElementById("status");
const loadingTextElement = document.getElementById("loading-text");

// Reintroduce wasmModule and manual initialization
let wasmModuleInstance = null;
let wasmMemory = null;

async function initWasm() {
  try {
    const response = await fetch(chrome.runtime.getURL("build/api.wasm"));
    const wasmBytes = await response.arrayBuffer();

    // Create the memory instance WASM needs
    wasmMemory = new WebAssembly.Memory({ initial: 2, maximum: 10 }); // Start small

    const importObject = {
      env: {
        abort: (messagePtr, fileNamePtr, line, column) => {
          // Basic abort: read message/fileName from memory if needed
          // For now, just throw a generic error
          throw new Error(`WASM aborted: line ${line}, col ${column}`);
        },
        "Date.now": () => Date.now(),
        memory: wasmMemory, // Provide the memory instance
      },
      // Add other namespaces if AS expects them (check your build output)
      // index: { }
    };

    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
    wasmModuleInstance = instance.exports;
    console.log(
      "WASM Module loaded and instantiated manually:",
      wasmModuleInstance
    );
    hitApiButton.disabled = false;
  } catch (error) {
    console.error("Failed to initialize WASM module manually:", error);
    hitApiButton.disabled = true;
    showStatus("WebAssembly initialization failed: " + error.message, true);
  }
}

// Helper function to read string from WASM memory
function getStringFromWasm(pointer) {
  if (
    !pointer ||
    !wasmMemory ||
    !wasmModuleInstance ||
    !wasmModuleInstance.__getString
  ) {
    // Attempt to use the standard __getString if exported, otherwise basic read
    if (wasmModuleInstance && wasmModuleInstance.__getString) {
      // Newer AS versions might export __getString directly
      return wasmModuleInstance.__getString(pointer);
    } else if (wasmMemory && pointer) {
      // Manual fallback if __getString isn't readily available
      // This is a simplified version and might break with complex strings
      const buffer = new Uint16Array(wasmMemory.buffer);
      let str = "";
      let i = pointer / 2; // Pointer is byte offset, JS string uses 16-bit chars
      while (buffer[i] !== 0) {
        // Read until null terminator
        str += String.fromCharCode(buffer[i]);
        i++;
        if (i * 2 > buffer.byteLength) break; // Safety break
      }
      return str;
    } else {
      console.error("Cannot read string from WASM: Memory or pointer invalid.");
      return null;
    }
  }
  // If __getString exists on the instance, use it (common pattern)
  return wasmModuleInstance.__getString(pointer);
}

// Initialize WASM module when popup opens
initWasm();

// Function to make secure API call
async function makeSecureApiCall() {
  if (!wasmModuleInstance) {
    showStatus("WebAssembly module not initialized correctly", true);
    return;
  }

  try {
    // Show loading indicator
    loadingElement.style.display = "block";
    loadingTextElement.textContent = "Making API call via WASM...";
    hitApiButton.disabled = true;

    // Get the API URL pointer from the WASM module
    const apiUrlPointer = wasmModuleInstance.getApiUrl();
    // Decode the pointer to a JS string using helper
    const targetUrl = getStringFromWasm(apiUrlPointer);

    if (!targetUrl) {
      throw new Error("Failed to get API URL string from WASM module");
    }

    console.log(`Calling API URL from WASM: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "chrome_extension_wasm_call",
        timestamp: Date.now(), // Add a simple timestamp from JS
      }),
    });

    if (!response.ok) {
      // Try to read the response body for more details on error
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        // Ignore if reading body fails
      }
      throw new Error(
        `HTTP error! status: ${response.status} ${response.statusText}. Body: ${errorBody}`
      );
    }

    // Webhook.site often returns a simple status or request ID, not necessarily JSON
    const responseText = await response.text();
    console.log("API Response:", responseText);
    showStatus("API call successful!");
  } catch (error) {
    console.error("API call failed:", error);
    showStatus(`API call failed: ${error.message}`, true);
  } finally {
    loadingElement.style.display = "none";
    hitApiButton.disabled = false;
  }
}

// Add click handler for Hit API button
hitApiButton.addEventListener("click", makeSecureApiCall);

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

// Add event listeners
fetchButton.addEventListener("click", fetchLeadData);
directFetchButton.addEventListener("click", useDirectFetchMethod);
exportCsvButton.addEventListener("click", exportAsCSV);
exportJsonButton.addEventListener("click", exportAsJSON);
clearDataButton.addEventListener("click", clearStoredData);

// Initialize UI when popup is opened
document.addEventListener("DOMContentLoaded", updateUI);
