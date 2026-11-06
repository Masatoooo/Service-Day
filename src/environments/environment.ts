// Production environment.
// Assignment 2: point apiUrl at the Express server; nothing else in the app changes.
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000',
  // Simulated network delay (ms) added by LatencyInterceptor. Off in production.
  mockLatency: { min: 0, max: 0 },
};
