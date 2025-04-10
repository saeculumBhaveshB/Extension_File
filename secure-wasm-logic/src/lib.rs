use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;
use web_sys::{console, Headers, Request, RequestInit, RequestMode, Response};
use wasm_bindgen::JsValue;

#[wasm_bindgen]
pub fn validate_license(license: &str) -> bool {
    console::log_1(&format!("WASM validating license: {}", license).into());
    license == "RAJU-SECURE-KEY"
}

#[wasm_bindgen]
pub fn encrypt_message(msg: &str) -> String {
    console::log_1(&format!("WASM encrypting message: {}", msg).into());
    format!("encrypted-{}", msg)
}

#[wasm_bindgen]
pub async fn trigger_api(url: String, payload: String) -> Result<JsValue, JsValue> {
    console::log_1(&format!("WASM: trigger_api called with URL: {}, Payload: {}", url, payload).into());

    let mut opts = RequestInit::new();
    opts.method("POST");
    opts.mode(RequestMode::Cors);

    let headers = Headers::new().map_err(|_| JsValue::from_str("Failed to create Headers"))?;
    headers.append("Content-Type", "application/json").map_err(|_| JsValue::from_str("Failed to set Content-Type"))?;
    opts.headers(&headers);

    opts.body(Some(&JsValue::from_str(&payload)));

    let request = Request::new_with_str_and_init(&url, &opts)
        .map_err(|e| JsValue::from_str(&format!("Failed to create Request: {:?}", e)))?;

    let window = web_sys::window().ok_or_else(|| JsValue::from_str("Could not get window object"))?;
    let resp_value_js = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| JsValue::from_str(&format!("Fetch failed: {:?}", e)))?;

    let resp: Response = resp_value_js.dyn_into()
         .map_err(|_| JsValue::from_str("Failed to convert fetch result to Response"))?;

    console::log_1(&format!("WASM: Received response status: {}", resp.status()).into());

    if !resp.ok() {
        return Err(JsValue::from_str(&format!("API request failed with status: {}", resp.status())));
    }

    match resp.json() {
        Ok(promise) => {
            let json = JsFuture::from(promise).await.map_err(|e| JsValue::from_str(&format!("Failed to parse JSON response: {:?}", e)))?;
            console::log_1(&"WASM: API call successful, returning JSON.".into());
            Ok(json)
        }
        Err(e) => {
            console::error_1(&format!("WASM: Failed to get JSON promise from response: {:?}", e).into());
            Err(JsValue::from_str("Failed to get JSON promise from response"))
        }
    }
}