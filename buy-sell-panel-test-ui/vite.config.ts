import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

// This app lives inside the SDK repo; the SDK's TypeScript source is in the
// parent directory and uses `#*` subpath imports (its package.json `imports`
// map). We consume the source directly so the browser bundle only includes the
// orderbook + pipmath code (and not the REST/WebSocket clients, ethers, axios,
// etc.). bignumber.js resolves from the SDK's own node_modules via Vite's
// default node resolution.
const sdkSrc = fileURLToPath(new URL('../src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^#(.*)$/, replacement: `${sdkSrc}/$1` }],
  },
  server: {
    // Allow Vite to read the SDK source from the parent directory.
    fs: { allow: ['..'] },
  },
});
