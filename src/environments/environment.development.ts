// Development environment (swapped in via fileReplacements in angular.json).
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  /** Base URL encoded in check-in QR codes. Empty = the address the admin opened the app on. */
  publicAppUrl: '',
  // Simulated network delay (ms) so loading skeletons are visible during development.
  mockLatency: { min: 250, max: 600 },
};
