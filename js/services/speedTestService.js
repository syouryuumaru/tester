// This file is generated from services/speedTestService.ts
import { MOCKED_UPLOAD_SIZE_BYTES, MOCKED_UPLOAD_DURATION_MS, TARGET_DOWNLOAD_DURATION_MS } from '../constants.js';

const CACHE_BUSTER = () => `?v=${Date.now()}&r=${Math.random()}`;

export async function measureLatency(url) {
  const startTime = performance.now();
  try {
    // 'no-cors' mode for HEAD requests often results in an opaque response,
    // which is fine for latency as we're primarily interested in the round-trip time.
    // Errors are common and don't necessarily mean the server is unreachable, just that the response is opaque.
    await fetch(`${url}${CACHE_BUSTER()}`, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
  } catch (e) {
    // Even if an error occurs (expected in 'no-cors' with some servers),
    // the timing until this point can still serve as a rough latency measure.
    // console.warn('Latency test fetch error (common in no-cors HEAD):', e);
  }
  const endTime = performance.now();
  return Math.round(endTime - startTime);
}

export async function measureDownloadSpeed(
  url,
  onProgress
) {
  let totalBytesDownloaded = 0;
  const testStartTime = performance.now();
  let requestCount = 0;

  try {
    while (performance.now() - testStartTime < TARGET_DOWNLOAD_DURATION_MS) {
      const loopIterationStartTime = performance.now();
      const response = await fetch(`${url}${CACHE_BUSTER()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch download chunk: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      totalBytesDownloaded += blob.size;
      requestCount++;

      const currentElapsedTimeMs = performance.now() - testStartTime;
      if (currentElapsedTimeMs > 0) {
        const currentSpeedBps = (totalBytesDownloaded * 8) / (currentElapsedTimeMs / 1000);
        const currentSpeedMbps = currentSpeedBps / (1024 * 1024);
        onProgress(parseFloat(currentSpeedMbps.toFixed(2)));
      }

      if (currentElapsedTimeMs >= TARGET_DOWNLOAD_DURATION_MS) {
        break;
      }
    }
  } catch (error) {
    console.error("Download measurement error:", error);
    throw error;
  }

  const actualDurationMs = Math.max(1, performance.now() - testStartTime);
  const durationSeconds = actualDurationMs / 1000;

  if (totalBytesDownloaded === 0 && durationSeconds > 0) {
    return 0;
  }
  if (durationSeconds <= 0) return 0;

  const finalSpeedBps = (totalBytesDownloaded * 8) / durationSeconds;
  const finalSpeedMbps = finalSpeedBps / (1024 * 1024);
  return parseFloat(finalSpeedMbps.toFixed(2));
}

export async function measureUploadSpeed(
  onProgress
) {
  return new Promise((resolve) => {
    const intervalTimeMs = 200; // Update progress every 200ms
    let elapsedMockTimeMs = 0;
    
    const intervalId = setInterval(() => {
      elapsedMockTimeMs += intervalTimeMs;
      const progressRatio = Math.min(elapsedMockTimeMs / MOCKED_UPLOAD_DURATION_MS, 1);
      const simulatedBytesSent = progressRatio * MOCKED_UPLOAD_SIZE_BYTES;
      
      let currentSimulatedSpeedMbps = 0;
      if (elapsedMockTimeMs > 0) {
        const currentSimulatedSpeedBps = (simulatedBytesSent * 8) / (elapsedMockTimeMs / 1000);
        currentSimulatedSpeedMbps = parseFloat((currentSimulatedSpeedBps / (1024 * 1024)).toFixed(2));
      }
      onProgress(currentSimulatedSpeedMbps);

      if (elapsedMockTimeMs >= MOCKED_UPLOAD_DURATION_MS) {
        clearInterval(intervalId);
        // Ensure the final reported speed matches the total mock size and duration
        const finalDurationSeconds = MOCKED_UPLOAD_DURATION_MS / 1000;
        if (finalDurationSeconds <= 0) {
            resolve(0);
            return;
        }
        const finalSpeedBps = (MOCKED_UPLOAD_SIZE_BYTES * 8) / finalDurationSeconds;
        const finalSpeedMbps = parseFloat((finalSpeedBps / (1024 * 1024)).toFixed(2));
        onProgress(finalSpeedMbps); // One last update with the final speed
        resolve(finalSpeedMbps);
      }
    }, intervalTimeMs);
  });
}
