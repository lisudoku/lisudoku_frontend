const URL_ASSIGNMENT = 'URL = globalThis.URL'

// Some users experience this error because of the 'vite-plugin-wasm' plugin.
// I couldn't reproduce it, so this is an attempt to mitigate the issue.
export function fixWasmUrlAssignment() {
  return {
    name: 'lisudoku-fix-wasm-url-assignment',
    transform(code, id) {
      if (!id.toLowerCase().endsWith('.wasm') || !code.includes(URL_ASSIGNMENT)) {
        return
      }

      return {
        code: code.replace(URL_ASSIGNMENT, 'try { URL = globalThis.URL } catch {}'),
        map: null,
      }
    },
  }
}
