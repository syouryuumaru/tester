// This file is generated from constants.ts
import './types.js'; // Keep for module graph, actual types are erased.

// Using generic, publicly accessible image URLs for simulation/testing.
// Actual Ookla test URLs are complex and might have CORS/TOS restrictions for direct use.

export const SERVERS = [
  {
    id: 'nexa-semarang-ookla',
    name: 'Nexa Semarang by Ookla',
    location: 'Semarang, Indonesia',
    latencyTestUrl: `https://picsum.photos/seed/nexa-smg-latency/10/10`,
    downloadTestUrl: `https://picsum.photos/seed/nexa-smg-download/200/200`,
    // Using the same URL for upload attempts; the server will likely reject POST but we measure send attempt.
    uploadTestUrl: `https://picsum.photos/seed/nexa-smg-upload/submit`,
  },
  {
    id: 'singtel-sg-ookla',
    name: 'Singtel Singapore by Ookla',
    location: 'Singapore',
    latencyTestUrl: `https://picsum.photos/seed/singtel-sg-latency/10/10`,
    downloadTestUrl: `https://picsum.photos/seed/singtel-sg-download/200/200`,
    uploadTestUrl: `https://picsum.photos/seed/singtel-sg-upload/submit`,
  },
];

// Target duration for download tests
export const TARGET_DOWNLOAD_DURATION_MS = 15000; // 15 seconds

// Target duration for upload tests
export const TARGET_UPLOAD_DURATION_MS = 10000; // 10 seconds for upload attempts

// Size of data chunk for each upload POST request
export const UPLOAD_CHUNK_SIZE_BYTES = 256 * 1024; // 256KB

// MOCKED_UPLOAD_SIZE_BYTES is no longer primarily used for calculation but can be kept for reference or future fallback.
export const MOCKED_UPLOAD_SIZE_BYTES = 1 * 1024 * 1024; // 1MB (Legacy, for potential simulation fallback)