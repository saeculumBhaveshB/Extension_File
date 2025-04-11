// Popup script for Indiamart Lead Fetcher - UI and Trigger Logic

// Import the trigger function from api.js
import { triggerSecureApiCall } from "./api.js";

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

// --- UI Helper Functions (Keep these in popup.js) ---

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

// --- Function to display text (e.g., to console) ---
function displayTextMessage(message) {
  console.log("Displaying message from popup.js:", message);
  // If you wanted to display this in the popup HTML instead,
  // you could target an element like the statusElement:
  // statusElement.textContent = message;
  // statusElement.className = "status success"; // Or a different class
}

// Function to update UI with stored data (Example)
function updateUI() {
  chrome.storage.local.get(["indiamartLeads", "lastFetchTime"], (result) => {
    const leads = result.indiamartLeads || [];
    const lastFetchTime = result.lastFetchTime;
    totalLeadsElement.textContent = leads.length;
    lastFetchedElement.textContent = formatDate(lastFetchTime);
    const hasLeads = leads.length > 0;
    exportCsvButton.disabled = !hasLeads;
    exportJsonButton.disabled = !hasLeads;
    clearDataButton.disabled = !hasLeads;
    // Initial button states (assuming WASM loads ok eventually)
    hitApiButton.disabled = false;
    // Note: fetchButton/directFetchButton logic might be elsewhere
  });
}

// --- Event Handlers ---

// Handler for the "Hit API" button
hitApiButton.addEventListener("click", async () => {
  // Show loading indicator specific to this button
  loadingElement.style.display = "block";
  loadingTextElement.textContent = "Hitting secure API...";
  hitApiButton.disabled = true;

  try {
    // Call the function from api.js, passing displayTextMessage as the callback
    await triggerSecureApiCall(displayTextMessage);

    // Success is now handled by the callback
    // showStatus('Secure API call successful!'); // Can remove this if callback handles UI
  } catch (error) {
    console.error("Secure API Call Failed (popup.js):", error);
    // Display a user-friendly message from the error
    showStatus(`Secure API call failed: ${error.message}`, true);
  } finally {
    // Hide loading indicator and re-enable button
    loadingElement.style.display = "none";
    hitApiButton.disabled = false;
  }
});

// TODO: Add back other event listeners (fetch, export, clear) if they were removed
// fetchButton.addEventListener("click", fetchLeadData);
// directFetchButton.addEventListener("click", useDirectFetchMethod);
// exportCsvButton.addEventListener("click", exportAsCSV);
// exportJsonButton.addEventListener("click", exportAsJSON);
// clearDataButton.addEventListener("click", clearStoredData);

// Initialize UI when popup is opened
document.addEventListener("DOMContentLoaded", updateUI);

// --- Removed Functions (Moved to api.js or other files) ---
// - initWasm
// - getStringFromWasm
// - putStringToWasm
// - makeSecureApiCall (replaced by the click handler above)
// - fetchLeadData (assuming this is handled elsewhere or needs adding back)
// - useDirectFetchMethod (assuming this is handled elsewhere or needs adding back)
// - exportAsCSV (assuming this is handled elsewhere or needs adding back)
// - exportAsJSON (assuming this is handled elsewhere or needs adding back)
// - clearStoredData (assuming this is handled elsewhere or needs adding back)
// - checkIfOnIndiamart (if needed by fetchLeadData etc.)
// - leadsToCSV (if needed by exportAsCSV)

console.log("popup.js loaded as module");
