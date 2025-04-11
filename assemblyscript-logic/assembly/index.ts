// Declare the external log function imported from the host environment (e.g., JavaScript)
// The JS host will need to provide this function during WASM instantiation under the 'env' module.
// @external("env", "log") // Removing decorator to see if simple declaration works
declare function log(s: string): void;

// Exported function to validate a license key
export function validate_license(license: string): boolean {
  log("AS: Validating license: " + license); // Use the imported log function
  // Simple comparison
  return license == "RAJU-SECURE-KEY";
}

// Exported function to encrypt a message (placeholder encryption)
export function encrypt_message(msg: string): string {
  log("AS: Encrypting message: " + msg); // Use the imported log function
  // Simple placeholder encryption
  return "encrypted-" + msg;
}

// --- trigger_api ---
// AssemblyScript running in a browser doesn't have direct async `fetch` access.
// The typical pattern is to have JS call synchronous AS functions and handle async operations itself.
// We can export functions to prepare data or handle responses if needed, but the actual fetch
// call needs to be made from the JavaScript host environment.

// Example: A function to prepare the request body or headers (if complex logic was needed)
export function prepare_payload(payload: string): string {
  log("AS: Preparing payload: " + payload); // Use the imported log function
  // In a real scenario, more complex validation or transformation might happen here.
  // For now, just return the payload, possibly after some validation or formatting.
  // For demonstration, let's assume we wrap it in a simple structure.
  // Note: JSON serialization in pure AssemblyScript requires libraries or manual construction.
  // This is a simplified example.
  return `{"data": "${payload}"}`;
}

// Example: A function that might be called by JS *after* a successful fetch
export function process_api_response(response_text: string): string {
  log("AS: Processing API response snippet: " + response_text.substring(0, 50)); // Use the imported log function
  // Process the response data received from the JS fetch call
  // Again, proper JSON parsing would typically involve a library.
  // Let's just prepend a string for demonstration.
  return "processed-" + response_text;
}

// NOTE on trigger_api:
// The original Rust code used wasm-bindgen to directly call async browser APIs (fetch).
// AssemblyScript does not have the same level of direct browser API binding generation.
// Therefore, the `trigger_api` function cannot be directly translated to an `async` function
// in AssemblyScript that performs the fetch.

// The JavaScript code previously here should be moved to a separate .js file
// in your extension (e.g., background.js) to load and interact with the compiled WASM.
