# WASM Integration Guide: Content & Background Script in Chrome Extension (React + Webpack)

This guide walks through step-by-step instructions to integrate WebAssembly (WASM) securely into both **content script functions** and **background file functions** of a React + Webpack-based Chrome extension. It ensures full compliance with Google Chrome Web Store policies to prevent rejection.

---

## 🎯 Objective

- Securely integrate WASM into specific functions within content and background script files.
- Prevent reverse engineering by offloading sensitive logic to WASM.
- Ensure Google Web Store approval (Manifest V3 compliant).

---

## 🧰 Prerequisites

### System Setup:

- Node.js & NPM
- Rust toolchain:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- Install `wasm-pack`:

```bash
cargo install wasm-pack
```

---

## ✅ Step 1: Create WASM Project

```bash
wasm-pack new secure_wasm_logic
cd secure_wasm_logic
```

Edit `src/lib.rs`:

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn validate_license(license: &str) -> bool {
    license == "RAJU-SECURE-KEY"
}

#[wasm_bindgen]
pub fn encrypt_message(msg: &str) -> String {
    format!("encrypted-{}", msg)
}
```

Build it:

```bash
wasm-pack build --target web
```

This will create a `pkg/` directory with `.wasm`, `.js`, and `.d.ts` files.

---

## 📁 Step 2: Add WASM Files to Extension

Copy the following files from `pkg/` into your extension folder:

```
extension/
├── wasm/
│   ├── secure_wasm_logic.js
│   └── secure_wasm_logic_bg.wasm
```

---

## 🧩 Step 3: Use WASM in a Function Inside Background File

### File: `background/secureBackground.js`

```js
import init, {
  validate_license,
  encrypt_message,
} from "../wasm/secure_wasm_logic.js";

export async function verifyLicenseBackground(licenseKey) {
  await init();
  return validate_license(licenseKey);
}

export async function encryptDataBackground(data) {
  await init();
  return encrypt_message(data);
}

// Example usage:
verifyLicenseBackground("RAJU-SECURE-KEY").then((valid) => {
  console.log("🔐 Background: License valid?", valid);
});
```

---

## 🧩 Step 4: Use WASM in a Function Inside Content Script

### File: `contentScripts/secureContent.js`

```js
import init, {
  validate_license,
  encrypt_message,
} from "../wasm/secure_wasm_logic.js";

export async function validateUserLicense(licenseKey) {
  await init();
  return validate_license(licenseKey);
}

export async function encryptUserMessage(message) {
  await init();
  return encrypt_message(message);
}

// Example usage:
validateUserLicense("RAJU-SECURE-KEY").then((isValid) => {
  console.log("📄 Content Script: License valid?", isValid);
});
```

---

## 🔧 Step 5: Update `webpack.config.js`

Ensure support for `.wasm` and correct JS module rules:

```js
module.exports = {
  // your config
  experiments: {
    asyncWebAssembly: true,
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "webassembly/async",
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "wasm"),
        use: ["babel-loader"],
      },
    ],
  },
};
```

---

## 📝 Step 6: Update `manifest.json`

Ensure WASM file is accessible to both contexts.

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background/secureBackground.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScripts/secureContent.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["wasm/secure_wasm_logic_bg.wasm"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

---

## 🛑 Step 7: Follow Chrome Web Store Guidelines

- ❌ Do not use `eval()` or `new Function()` in your JS or WASM loader.
- ✅ Use `wasm-pack build --target web` to generate safe wrappers.
- ✅ Declare WASM files in `web_accessible_resources`.
- ✅ Add a note in your Chrome Web Store submission like:
  > "This extension uses WebAssembly for license validation and lightweight encryption. It performs no tracking and adheres to Chrome policies."

---

## 🔒 Step 8: Strengthen Security Further (Optional)

- Encrypt `.wasm` or rename with misleading names.
- Add junk exports to WASM.
- Pair with backend license validation for multi-layered security.
- Log suspicious usage in your backend.

---

## ✅ Summary

- WASM is used inside functions within both content and background scripts.
- Secure logic like license validation and message encryption is offloaded to WASM.
- All integration is compliant with Manifest V3 and Chrome Store guidelines.

---

Let me know if you want a boilerplate project or ZIP with this structure prebuilt for direct use.
