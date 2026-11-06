// Development environment (swapped in via fileReplacements in angular.json).
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  // Simulated network delay (ms) so loading skeletons are visible during development.
  mockLatency: { min: 250, max: 600 },
};
