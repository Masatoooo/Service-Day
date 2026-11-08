// Production environment.
// When deployed to static hosts like GitHub Pages, useMockBackend fulfills all API
// requests client-side using localStorage seeded from the initial mock data.
// Assignment 2: point apiUrl at the Express server and set useMockBackend: false.
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000',
  useMockBackend: true,
  /** Base URL encoded in check-in QR codes. Empty = the address the admin opened the app on. */
  publicAppUrl: '',
  // Simulated network delay (ms) added by LatencyInterceptor. Off in production.
  mockLatency: { min: 0, max: 0 },
};
