// WASM test helper utilities

export class WasmTestHelper {
  // Check if WASM is supported in the current environment
  static isWasmSupported(): boolean {
    return typeof WebAssembly === 'object' && 
           typeof WebAssembly.instantiate === 'function';
  }

  // Load WASM module with error handling
  static async loadWasmModule(wasmPath: string): Promise<WebAssembly.Instance> {
    try {
      const response = await fetch(wasmPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch WASM module: ${response.statusText}`);
      }
      
      const wasmModule = await WebAssembly.instantiateStreaming(response);
      return wasmModule.instance;
    } catch (error) {
      console.error('WASM loading error:', error);
      throw new Error('Failed to load WASM module');
    }
  }

  // Verify WASM memory access
  static verifyWasmMemory(instance: WebAssembly.Instance): boolean {
    return instance.exports.memory instanceof WebAssembly.Memory;
  }

  // Test WASM function call with error handling
  static async testWasmFunction(
    instance: WebAssembly.Instance,
    functionName: string,
    args: any[]
  ): Promise<any> {
    try {
      const func = instance.exports[functionName] as Function;
      if (typeof func !== 'function') {
        throw new Error(`Function ${functionName} not found in WASM module`);
      }
      return func(...args);
    } catch (error) {
      console.error(`WASM function call error (${functionName}):`, error);
      throw error;
    }
  }

  // Validate CSP headers for WASM security
  static validateCspHeaders(headers: Headers): boolean {
    const csp = headers.get('Content-Security-Policy');
    return csp !== null && 
           csp.includes("'wasm-unsafe-eval'") && 
           csp.includes("'self'");
  }
}