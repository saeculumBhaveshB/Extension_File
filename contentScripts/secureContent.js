// File: contentScripts/secureContent.js

// Import the default export (init) AND the named exports from the JS glue module
import init, {
  validate_license,
  encrypt_message,
  // test_wasm_functions // Removed from simplified Rust code
} from "../wasm/secure_wasm_logic.js";

let wasmInitialized = false;
let initPromise = null;
// let wasmExports = null; // No longer storing this

// Initialization function specific to this module
async function initializeWasmOnce() {
  if (wasmInitialized) {
    console.log("WASM module already initialized.");
    return true;
  }
  if (!initPromise) {
    console.log("Initializing WASM module (attempt 4: named imports)...");
    initPromise = init()
      .then(() => {
        wasmInitialized = true;
        console.log("WASM module initialized successfully (named imports).");
        return true;
      })
      .catch((error) => {
        console.error("Failed to initialize WASM module:", error);
        initPromise = null;
        return false;
      });
  }
  return initPromise;
}

// Expose functions for the importer (content.js) to use
async function callValidateLicense(licenseKey) {
  const loaded = await initializeWasmOnce();
  if (!loaded) throw new Error("WASM not initialized");
  // Call the imported named export directly
  console.log("Calling WASM validate_license...");
  return validate_license(licenseKey);
}

async function callEncryptMessage(message) {
  const loaded = await initializeWasmOnce();
  if (!loaded) throw new Error("WASM not initialized");
  // Call the imported named export directly
  console.log("Calling WASM encrypt_message...");
  return encrypt_message(message);
}

/* // Removed test_wasm_functions from Rust code
async function callTestWasmFunctions() {
  const loaded = await initializeWasmOnce();
  if (!loaded) throw new Error("WASM not initialized");
  // Call the imported named export directly
  test_wasm_functions();
}
*/

// The object that will be the "module exports" when dynamically imported
const WasmApi = {
  initializeWasmOnce,
  callValidateLicense,
  callEncryptMessage,
  // callTestWasmFunctions // Removed
};

// Use default export for the API object
export default WasmApi;
