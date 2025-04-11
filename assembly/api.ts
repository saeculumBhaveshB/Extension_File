// AssemblyScript module for secure API calls

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

// Function to securely provide the target API URL
export function getApiUrl(): string {
  // In a real secure scenario, this might involve decryption or validation.
  // For this example, we just return the hardcoded URL.
  return "https://webhook.site/0b1c45b7-1af7-4828-b345-b459276dfea5";
}
