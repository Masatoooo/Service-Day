// LAN demo environment (`npm run dev:lan`): a phone on the same Wi-Fi opens the app
// at http://<Mac IP>:4200, so the API is the same host on port 3000.
export const environment = {
  production: false,
  apiUrl: `http://${globalThis.location?.hostname ?? 'localhost'}:3000`,
  /** Empty = the address the page was opened on (the Mac's IP in LAN mode). */
  publicAppUrl: '',
  mockLatency: { min: 250, max: 600 },
};
