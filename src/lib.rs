use wasm_bindgen::prelude::*;

// Add this if you plan to log things from Rust to the JS console
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn validate_license(license: &str) -> bool {
    log(&format!("WASM validating license: {}", license));
    license == "RAJU-SECURE-KEY"
}

#[wasm_bindgen]
pub fn encrypt_message(msg: &str) -> String {
    log(&format!("WASM encrypting message: {}", msg));
    format!("encrypted-{}", msg)
}

// Function to demonstrate usage, called internally if needed
pub fn run_wasm_tests() {
    log("Running internal WASM tests...");
    let is_valid = validate_license("RAJU-SECURE-KEY");
    log(&format!("Internal test: License valid? {}", is_valid));
    let encrypted = encrypt_message("hello from rust");
    log(&format!("Internal test: Encrypted: {}", encrypted));
}

// Optional: Expose a function to trigger tests from JS
#[wasm_bindgen]
pub fn test_wasm_functions() {
    run_wasm_tests();
} 