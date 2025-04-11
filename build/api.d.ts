/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/api/generateTimestamp
 * @returns `i64`
 */
export declare function generateTimestamp(): bigint;
/**
 * assembly/api/encryptRequest
 * @param url `~lib/string/String`
 * @returns `~lib/string/String`
 */
export declare function encryptRequest(url: string): string;
/**
 * assembly/api/prepareApiRequest
 * @param url `~lib/string/String`
 * @returns `~lib/string/String`
 */
export declare function prepareApiRequest(url: string): string;
/**
 * assembly/api/getApiUrl
 * @returns `~lib/string/String`
 */
export declare function getApiUrl(): string;
