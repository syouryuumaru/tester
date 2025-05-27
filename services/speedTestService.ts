
import { TARGET_DOWNLOAD_DURATION_MS, TARGET_UPLOAD_DURATION_MS, UPLOAD_CHUNK_SIZE_BYTES } from '../constants.js';

const CACHE_BUSTER = () => `?v=${Date.now()}&r=${Math.random()}`;

/**
 * Measures latency by sending a HEAD request to the specified URL.
 * This function performs a REAL network request (HTTP HEAD)
 * to the specified URL to measure latency.
 * 'no-cors' mode is used as we only need the timing for the headers,
 * and the server might not support CORS for HEAD requests or return an opaque response.
 * The CACHE_BUSTER ensures a fresh measurement attempt.
 * @param url The URL to test latency against.
 * @returns A promise that resolves to the latency in milliseconds.
 */
export async function measureLatency(url: string): Promise<number> {
  const startTime = performance.now();
  try {
    // This fetch initiates an actual network request.
    await fetch(`${url}${CACHE_BUSTER()}`, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
  } catch (e) {
    // Errors are common with 'no-cors' HEAD requests if the server response is truly opaque
    // or if there's a network issue. The timing up to this point is still measured.
    // console.warn('Latency test fetch error (can be expected in no-cors HEAD):', e);
  }
  const endTime = performance.now();
  return Math.round(endTime - startTime);
}

/**
 * Measures download speed by repeatedly fetching data from the specified URL.
 * This function performs REAL network downloads from the specified URL
 * to measure download speed. It repeatedly fetches data chunks
 * for a target duration and calculates speed based on actual bytes received.
 * The CACHE_BUSTER ensures fresh data is downloaded for each chunk.
 * @param url The URL to download data from.
 * @param onProgress Callback function to report progress (current speed in Mbps).
 * @returns A promise that resolves to the final average download speed in Mbps.
 */
export async function measureDownloadSpeed(
  url: string,
  onProgress: (currentSpeedMbps: number) => void
): Promise<number> {
  let totalBytesDownloaded = 0;
  const testStartTime = performance.now();

  try {
    // This loop continuously downloads data chunks from the network.
    while (performance.now() - testStartTime < TARGET_DOWNLOAD_DURATION_MS) {
      const response = await fetch(`${url}${CACHE_BUSTER()}`, { cache: 'no-store' });
      if (!response.ok) {
        console.warn(`Download chunk failed: ${response.status} ${response.statusText} for ${url}`);
        if (performance.now() - testStartTime >= TARGET_DOWNLOAD_DURATION_MS) break;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before retry
        continue;
      }
      // Actual data is received from the network here.
      const blob = await response.blob();
      totalBytesDownloaded += blob.size;

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
    // The function will return the speed calculated so far, or 0.
  }

  const actualDurationMs = Math.max(1, performance.now() - testStartTime);
  const durationSeconds = actualDurationMs / 1000;

  if (totalBytesDownloaded === 0) return 0;
  if (durationSeconds <= 0) return 0;

  const finalSpeedBps = (totalBytesDownloaded * 8) / durationSeconds;
  const finalSpeedMbps = finalSpeedBps / (1024 * 1024);
  return parseFloat(finalSpeedMbps.toFixed(2));
}

/**
 * Measures upload speed by attempting to POST data chunks to the specified URL.
 * This function performs REAL network upload attempts to the specified URL.
 * It repeatedly sends data chunks for a target duration.
 * Accuracy depends on server accepting POSTs and network conditions.
 * @param url The URL to POST data to.
 * @param onProgress Callback function to report progress (current speed in Mbps).
 * @returns A promise that resolves to the final average upload speed in Mbps.
 */
export async function measureUploadSpeed(
  url: string, 
  onProgress: (currentSpeedMbps: number) => void
): Promise<number> {
  let totalBytesSent = 0;
  const testStartTime = performance.now();
  
  const dataChunk = new Blob([new Uint8Array(UPLOAD_CHUNK_SIZE_BYTES).map(() => Math.floor(Math.random() * 256))], { type: 'application/octet-stream' });

  try {
    // This loop continuously attempts to send data chunks over the network.
    while (performance.now() - testStartTime < TARGET_UPLOAD_DURATION_MS) {
      const requestStartTime = performance.now();
      try {
        // This fetch initiates an actual network POST request with a data payload.
        await fetch(`${url}${CACHE_BUSTER()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: dataChunk,
          cache: 'no-store',
        });
        totalBytesSent += dataChunk.size;
      } catch (fetchError) {
        console.warn(`Upload chunk POST error to ${url}:`, fetchError);
        // Optional: Add a small delay if fetch fails very quickly, to avoid tight loop on persistent errors
        if (performance.now() - requestStartTime < 100) { 
            await new Promise(resolve => setTimeout(resolve, 250));
        }
      }

      const currentElapsedTimeMs = performance.now() - testStartTime;
      if (currentElapsedTimeMs > 0 && totalBytesSent > 0) {
        const currentSpeedBps = (totalBytesSent * 8) / (currentElapsedTimeMs / 1000);
        const currentSpeedMbps = currentSpeedBps / (1024 * 1024);
        onProgress(parseFloat(currentSpeedMbps.toFixed(2)));
      } else if (totalBytesSent === 0) {
        // If no bytes sent yet, report 0 speed to avoid NaN if currentElapsedTimeMs is also 0 briefly
        onProgress(0);
      }

      if (currentElapsedTimeMs >= TARGET_UPLOAD_DURATION_MS) {
        break;
      }
    }
  } catch (error) {
    // Catch any unexpected errors in the outer loop/setup
    console.error("Upload measurement critical error:", error);
  }
  
  const actualDurationMs = Math.max(1, performance.now() - testStartTime); // Ensure duration is at least 1ms to avoid division by zero
  const durationSeconds = actualDurationMs / 1000;

  if (totalBytesSent === 0) return 0;
  if (durationSeconds <= 0) return 0; // Should be caught by Math.max(1, ..) but as a safeguard

  const finalSpeedBps = (totalBytesSent * 8) / durationSeconds;
  const finalSpeedMbps = finalSpeedBps / (1024 * 1024);
  
  // Ensure final progress update reflects the calculated final speed
  onProgress(parseFloat(finalSpeedMbps.toFixed(2)));
  return parseFloat(finalSpeedMbps.toFixed(2));
}