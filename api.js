// api.js - Handles WASM loading and secure API calls

let wasmModuleInstance = null;
let wasmMemory = null;
let wasmInitializationPromise = null;

// --- WASM Initialization ---

async function initializeWasmInternal() {
  try {
    const response = await fetch(chrome.runtime.getURL("build/api.wasm"));
    // Check if fetch was successful
    if (!response.ok) {
      throw new Error(
        `Failed to fetch api.wasm: ${response.status} ${response.statusText}`
      );
    }
    const wasmBytes = await response.arrayBuffer();

    wasmMemory = new WebAssembly.Memory({ initial: 2, maximum: 10 });

    const importObject = {
      env: {
        abort: (messagePtr, fileNamePtr, line, column) => {
          // TODO: Could enhance this to read strings from memory if needed
          console.error(
            `WASM aborted: messagePtr=${messagePtr}, filePtr=${fileNamePtr}, line=${line}, col=${column}`
          );
          throw new Error(`WASM aborted: line ${line}, col ${column}`);
        },
        "Date.now": () => Date.now(),
        memory: wasmMemory,
      },
    };

    const { instance } = await WebAssembly.instantiate(wasmBytes, importObject);
    wasmModuleInstance = instance.exports;
    console.log("WASM Module loaded and instantiated in api.js");
    return wasmModuleInstance; // Resolve the promise with the instance
  } catch (error) {
    console.error("Failed to initialize WASM module in api.js:", error);
    wasmModuleInstance = null; // Ensure it's null on failure
    wasmMemory = null;
    throw error; // Rethrow to reject the promise
  }
}

function getWasmInstance() {
  if (!wasmInitializationPromise) {
    wasmInitializationPromise = initializeWasmInternal();
  }
  return wasmInitializationPromise;
}

// --- WASM Memory Helpers ---

function getStringFromWasm(pointer) {
  if (!wasmModuleInstance || !wasmMemory || !pointer) {
    console.error(
      "Cannot read string from WASM: Instance, Memory or pointer invalid."
    );
    return null;
  }
  try {
    if (wasmModuleInstance.__getString) {
      return wasmModuleInstance.__getString(pointer);
    }
    const buffer = new Uint16Array(wasmMemory.buffer);
    let idx = pointer >>> 1;
    let endIdx = idx;
    while (buffer[endIdx] !== 0 && endIdx < buffer.length) {
      endIdx++;
    }
    return String.fromCharCode(...buffer.subarray(idx, endIdx));
  } catch (e) {
    console.error("Error reading string from WASM memory:", e);
    return null;
  }
}

function putStringToWasm(str) {
  if (!wasmModuleInstance || !wasmMemory) {
    console.error("Cannot write string to WASM: Instance or Memory invalid.");
    return 0;
  }
  try {
    if (wasmModuleInstance.__new && wasmModuleInstance.__pin) {
      const pointer = wasmModuleInstance.__new(str.length << 1, 1);
      wasmModuleInstance.__pin(pointer);
      const buffer = new Uint16Array(wasmMemory.buffer);
      for (let i = 0; i < str.length; i++) {
        buffer[(pointer >>> 1) + i] = str.charCodeAt(i);
      }
      // Note: Ideally unpin later, but requires careful management
      return pointer;
    } else {
      console.error("WASM module does not export __new and/or __pin.");
      return 0;
    }
  } catch (e) {
    console.error("Error writing string to WASM memory:", e);
    return 0;
  }
}

// --- Public API Call Function ---

export async function triggerSecureApiCall(onSuccessCallback) {
  // Ensure WASM is initialized before proceeding
  try {
    await getWasmInstance();
    if (!wasmModuleInstance) {
      throw new Error("WASM module failed to initialize.");
    }
  } catch (initError) {
    console.error(
      "Cannot proceed with API call due to WASM init failure:",
      initError
    );
    // Rethrow or return a specific error structure
    throw new Error(`WASM Initialization failed: ${initError.message}`);
  }

  // --- Core API Logic ---
  let targetUrl = null;
  let encodedPayloadString = null;
  let payloadPointer = 0; // Keep track to potentially unpin later
  let encodedPayloadPointer = 0;

  try {
    // 1. Get URL
    const apiUrlPointer = wasmModuleInstance.getApiUrl();
    targetUrl = getStringFromWasm(apiUrlPointer);
    if (!targetUrl) {
      throw new Error("Failed to get API URL string from WASM module");
    }
    console.log(`Calling API URL from WASM: ${targetUrl}`);

    // 2. Prepare & Encode Payload
    const payload = {
      source: "chrome_extension_wasm_call_obfuscated_refactored",
      timestamp: Date.now(),
    };
    const payloadString = JSON.stringify(payload);

    payloadPointer = putStringToWasm(payloadString);
    if (!payloadPointer) {
      throw new Error("Failed to allocate memory for payload in WASM");
    }

    encodedPayloadPointer = wasmModuleInstance.encodePayload(payloadPointer);
    encodedPayloadString = getStringFromWasm(encodedPayloadPointer);

    // Optional: Unpin original payload string pointer if managing memory
    // if (wasmModuleInstance.__unpin) { wasmModuleInstance.__unpin(payloadPointer); }

    if (!encodedPayloadString) {
      throw new Error(
        "Failed to encode payload or read encoded string from WASM"
      );
    }
    console.log(`Encoded Payload: ${encodedPayloadString}`);

    // 3. Fetch API
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "X-Payload-Encoding": "base64",
      },
      body: encodedPayloadString,
    });

    // Optional: Manage memory for the encoded payload string pointer if needed

    // 4. Handle Response
    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        /* ignore */
      }
      throw new Error(
        `HTTP error! status: ${response.status} ${response.statusText}. Body: ${errorBody}`
      );
    }

    const responseText = await response.text();
    console.log("API Response (api.js):", responseText); // Internal log

    if (typeof onSuccessCallback === "function") {
      onSuccessCallback(responseText); // Calls the function passed from popup.js
    }
  } catch (error) {
    console.error("API call failed within api.js:", error);
    // Rethrow the error to reject the promise for popup.js to catch
    throw error;
  } finally {
    // Optional: Advanced memory management - ensure pointers are unpinned/freed
    // Be very careful here if implementing manual __unpin or __free
    // if (wasmModuleInstance && wasmModuleInstance.__unpin) {
    //     if (payloadPointer) wasmModuleInstance.__unpin(payloadPointer);
    //     // Need to know if encodePayload result needs explicit free/unpin
    // }
  }
}

// Automatically start initializing WASM when the module is loaded
// getWasmInstance(); // We call this within triggerSecureApiCall instead to handle errors better
