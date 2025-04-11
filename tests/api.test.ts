import { prepareApiRequest, encryptRequest, generateTimestamp } from '../assembly/api';

describe('WASM API Security Tests', () => {
  // Test WebAssembly module loading
  test('WASM module loads successfully', async () => {
    const response = await WebAssembly.instantiateStreaming(
      fetch('../build/api.wasm')
    );
    expect(response.instance).toBeDefined();
  });

  // Test URL validation
  test('prepareApiRequest rejects non-HTTPS URLs', () => {
    const insecureUrl = 'http://example.com';
    const result = prepareApiRequest(insecureUrl);
    expect(result).toBe('');
  });

  test('prepareApiRequest accepts HTTPS URLs', () => {
    const secureUrl = 'https://seller.indiamart.com/api';
    const result = prepareApiRequest(secureUrl);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });

  // Test encryption functionality
  test('encryptRequest produces different outputs for same input at different times', () => {
    const url = 'https://seller.indiamart.com/api';
    const result1 = encryptRequest(url);
    // Simulate time passing
    jest.advanceTimersByTime(1000);
    const result2 = encryptRequest(url);
    expect(result1).not.toBe(result2);
  });

  // Test timestamp generation
  test('generateTimestamp produces valid timestamps', () => {
    const timestamp = generateTimestamp();
    expect(typeof timestamp).toBe('number');
    expect(timestamp).toBeGreaterThan(0);
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });

  // Test encryption consistency
  test('encryption is deterministic for same input and timestamp', () => {
    const url = 'https://seller.indiamart.com/api';
    const mockTime = 1234567890000;
    jest.setSystemTime(mockTime);
    
    const result1 = encryptRequest(url);
    const result2 = encryptRequest(url);
    expect(result1).toBe(result2);
  });
});