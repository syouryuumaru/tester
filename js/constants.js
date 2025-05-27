// This file is generated from constants.ts
import './types.js'; // Keep for module graph, actual types are erased.

// Using generic, publicly accessible image URLs for simulation.
// The names and locations are updated as requested.
// Actual Ookla test URLs are complex and might have CORS/TOS restrictions for direct use.

export const SERVERS = [
  {
    id: 'nexa-semarang-ookla',
    name: 'Nexa Semarang by Ookla',
    location: 'Semarang, Indonesia',
    // Using a small, publicly accessible image for reliable latency test
    latencyTestUrl: `https://picsum.photos/seed/nexa-smg-latency/10/10`,
    // Using a publicly accessible image for repeated downloads
    downloadTestUrl: `https://picsum.photos/seed/nexa-smg-download/200/200`,
  },
  {
    id: 'singtel-sg-ookla',
    name: 'Singtel Singapore by Ookla',
    location: 'Singapore',
    latencyTestUrl: `https://picsum.photos/seed/singtel-sg-latency/10/10`,
    downloadTestUrl: `https://picsum.photos/seed/singtel-sg-download/200/200`,
  },
];

// Target duration for download tests
export const TARGET_DOWNLOAD_DURATION_MS = 15000; // 15 seconds

// Mocked upload size and duration for simulation
export const MOCKED_UPLOAD_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
export const MOCKED_UPLOAD_DURATION_MS = 15000; // Simulate 15 seconds for upload
