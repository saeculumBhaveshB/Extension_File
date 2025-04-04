let wasm;

async function initializeWasm() {
  if (!wasm) {
    // Use chrome.runtime.getURL to get the correct path within the extension package
    wasm = await import(chrome.runtime.getURL("wasm/secure_wasm_logic.js"));
    await wasm.default(); // Initialize the WASM module (init is often the default export)
    console.log("WASM initialized for content script.");
  }
  return wasm;
}

// Note: Exports might not be directly usable by other scripts injected
// on the page without a module system or message passing.
export async function validateUserLicense(licenseKey) {
  const { validate_license } = await initializeWasm();
  return validate_license(licenseKey);
}

export async function encryptUserMessage(message) {
  const { encrypt_message } = await initializeWasm();
  return encrypt_message(message);
}

// Example usage (IIFE - Immediately Invoked Function Expression)
(async () => {
  try {
    const { validate_license } = await initializeWasm(); // Ensure WASM is loaded
    const isValid = await validate_license("RAJU-SECURE-KEY"); // Call the function
    console.log("📄 Content Script: License valid?", isValid);
  } catch (error) {
    console.error("Error in content script WASM usage:", error);
  }
})();
