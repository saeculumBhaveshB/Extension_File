import { WasmTestHelper } from './wasm-helper';

describe('Popup WASM Integration Tests', () => {
  let wasmInstance: WebAssembly.Instance;

  beforeAll(async () => {
    // Check WASM support
    expect(WasmTestHelper.isWasmSupported()).toBe(true);
    
    // Load WASM module
    wasmInstance = await WasmTestHelper.loadWasmModule('../build/api.wasm');
    expect(wasmInstance).toBeDefined();
  });

  test('WASM memory is properly initialized', () => {
    expect(WasmTestHelper.verifyWasmMemory(wasmInstance)).toBe(true);
  });

  test('API request preparation with WASM encryption', async () => {
    const testUrl = 'https://seller.indiamart.com/api/leads';
    const result = await WasmTestHelper.testWasmFunction(
      wasmInstance,
      'prepareApiRequest',
      [testUrl]
    );
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  test('CSP headers are properly configured for WASM', () => {
    const headers = new Headers({
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; object-src 'self'"
    });
    expect(WasmTestHelper.validateCspHeaders(headers)).toBe(true);
  });

  test('WASM encryption is secure', async () => {
    const testData = 'sensitive_data';
    const encrypted = await WasmTestHelper.testWasmFunction(
      wasmInstance,
      'encryptRequest',
      [testData]
    );
    
    // Verify encryption properties
    expect(encrypted).not.toContain(testData); // No plaintext
    expect(encrypted.length).toBeGreaterThan(testData.length); // Added security data
    
    // Verify different timestamps produce different results
    jest.advanceTimersByTime(1000);
    const encrypted2 = await WasmTestHelper.testWasmFunction(
      wasmInstance,
      'encryptRequest',
      [testData]
    );
    expect(encrypted).not.toBe(encrypted2);
  });

  test('Error handling for invalid WASM operations', async () => {
    await expect(
      WasmTestHelper.testWasmFunction(wasmInstance, 'nonexistentFunction', [])
    ).rejects.toThrow();
  });
});