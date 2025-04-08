use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn validate_license(license: &str) -> bool {
    license == "RAJU-SECURE-KEY"
}

#[wasm_bindgen]
pub fn encrypt_message(msg: &str) -> String {
    format!("encrypted-{}", msg)
}
