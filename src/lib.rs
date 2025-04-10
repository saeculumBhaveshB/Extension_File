use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use web_sys::{Request, RequestInit, RequestMode, Response};

// Define the API URL as a constant within Rust
const API_URL: &str = "https://webhook.site/0b1c45b7-1af7-4828-b345-b459276dfea5";

// Add this if you plan to log things from Rust to the JS console
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log(s: &str);
}

// Helper function to log messages (optional, you can use the extern directly)
fn log_message(message: &str) {
    log(message);
}

#[wasm_bindgen]
pub fn validate_license(license: &str) -> bool {
    log_message(&format!("WASM validating license: {}", license));
    license == "RAJU-SECURE-KEY"
}

#[wasm_bindgen]
pub fn encrypt_message(msg: &str) -> String {
    log_message(&format!("WASM encrypting message: {}", msg));
    format!("encrypted-{}", msg)
}

// Function to demonstrate usage, called internally if needed
pub fn run_wasm_tests() {
    log_message("Running internal WASM tests...");
    let is_valid = validate_license("RAJU-SECURE-KEY");
    log_message(&format!("Internal test: License valid? {}", is_valid));
    let encrypted = encrypt_message("hello from rust");
    log_message(&format!("Internal test: Encrypted: {}", encrypted));
}

// Optional: Expose a function to trigger tests from JS
#[wasm_bindgen]
pub fn test_wasm_functions() {
    run_wasm_tests();
}

// NEW Function to trigger the API call from WASM
#[wasm_bindgen]
pub fn trigger_api_call() {
    log_message("WASM: trigger_api_call invoked. Spawning fetch task...");
    
    spawn_local(async {
        log_message(&format!("WASM: Fetching URL: {}", API_URL));
        
        // Prepare the request (optional, fetch_with_str is simpler for GET)
        let mut opts = RequestInit::new();
        opts.method("GET"); // Or POST, etc.
        opts.mode(RequestMode::Cors); // Necessary for cross-origin requests

        // Create the Request object
        let request = match Request::new_with_str_and_init(API_URL, &opts) {
            Ok(req) => req,
            Err(e) => {
                log_message(&format!("WASM: Failed to create request: {:?}", e));
                return;
            }
        };

        // Get the window object and trigger fetch
        let window = web_sys::window().expect("no global `window` exists");
        let resp_value_js = match window.fetch_with_request(&request) {
            Ok(promise) => promise,
            Err(e) => {
                log_message(&format!("WASM: Failed to initiate fetch: {:?}", e));
                return;
            }
        };

        // Convert the JS Promise to a Rust Future
        let resp_value_fut = wasm_bindgen_futures::JsFuture::from(resp_value_js);
        
        // Await the future to get the Response
        match resp_value_fut.await {
            Ok(resp_js) => {
                // Try to cast the JsValue to a Response
                match resp_js.dyn_into::<Response>() {
                    Ok(resp) => {
                        if resp.ok() {
                            log_message(&format!("WASM: API call successful! Status: {}", resp.status()));
                            // Optionally process response body: resp.text().await
                        } else {
                            log_message(&format!("WASM: API call failed! Status: {}", resp.status()));
                        }
                    }
                    Err(e) => {
                         log_message(&format!("WASM: Failed to convert fetch result to Response: {:?}", e));
                    }
                }
            }
            Err(e) => {
                 log_message(&format!("WASM: Error awaiting fetch future: {:?}", e));
            }
        }
    });
    log_message("WASM: trigger_api_call function finished (fetch running in background).");
} 