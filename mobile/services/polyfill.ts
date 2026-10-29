// Polyfill for React Native Bridgeless / Hermes Response constructor
// Fixes RangeError: Failed to construct 'Response': The status provided (0) is outside the range [200, 599]
if (typeof globalThis.Response !== 'undefined') {
  const OriginalResponse = globalThis.Response;
  const PatchedResponse = function (this: any, body?: any, init?: ResponseInit) {
    let safeInit = init;
    if (init && typeof init.status === 'number' && (init.status < 200 || init.status > 599)) {
      safeInit = {
        ...init,
        status: 200,
      };
    }
    return Reflect.construct(OriginalResponse, [body, safeInit], new.target || PatchedResponse);
  };

  PatchedResponse.prototype = OriginalResponse.prototype;
  Object.setPrototypeOf(PatchedResponse, OriginalResponse);
  (globalThis as any).Response = PatchedResponse;
}

export {};

