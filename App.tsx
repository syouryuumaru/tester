
import React, { useState, useCallback } from 'react';
import { ServerInfo, AllServersTestState, ServerTestState, TestStatus } from './types';
import { SERVERS } from './constants';
import { measureLatency, measureDownloadSpeed, measureUploadSpeed } from './services/speedTestService';
import ServerCard from './components/ServerCard';
import Spinner from './components/Spinner';

const initialServerStates = (): AllServersTestState => {
  return SERVERS.reduce((acc, server) => {
    acc[server.id] = {
      latency: null,
      downloadSpeed: null,
      uploadSpeed: null,
      status: 'idle',
      error: null,
    };
    return acc;
  }, {} as AllServersTestState);
};

const App: React.FC = () => {
  const [serverStates, setServerStates] = useState<AllServersTestState>(initialServerStates());
  const [isTestingOverall, setIsTestingOverall] = useState<boolean>(false);
  const [currentTestServerName, setCurrentTestServerName] = useState<string | null>(null);
  const [currentGlobalTestStep, setCurrentGlobalTestStep] = useState<string | null>(null);
  const [userPublicIp, setUserPublicIp] = useState<string | null>(null);
  const [isFetchingIp, setIsFetchingIp] = useState<boolean>(false);
  const [ipFetchError, setIpFetchError] = useState<Error | null>(null);


  const updateServerState = useCallback((serverId: string, updates: Partial<ServerTestState>) => {
    setServerStates(prevStates => ({
      ...prevStates,
      [serverId]: {
        ...prevStates[serverId],
        ...updates,
      },
    }));
  }, []);

  const fetchPublicIp = async () => {
    setIsFetchingIp(true);
    setUserPublicIp(null);
    setIpFetchError(null);
    try {
      // Changed IP service URL back to api.ipify.org
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        cache: 'no-cache', // Ensure a fresh request
      });
      if (!response.ok) {
        // Check for specific error text that might indicate a CORS preflight failure or similar
        const responseText = await response.text().catch(() => "Could not read response body.");
        throw new Error(`API request failed with status ${response.status} ${response.statusText}. Response: ${responseText.substring(0,100)}`);
      }
      const data = await response.json();
      if (typeof data.ip !== 'string') {
        throw new Error('Invalid IP data format from API');
      }
      setUserPublicIp(data.ip);
    } catch (error) {
      console.error("Error fetching public IP:", error);
      if (error instanceof Error) {
        setIpFetchError(error);
      } else {
        setIpFetchError(new Error("An unknown error occurred while fetching IP."));
      }
      setUserPublicIp(null); 
    } finally {
      setIsFetchingIp(false);
    }
  };

  const runTestForServer = useCallback(async (server: ServerInfo) => {
    setCurrentTestServerName(server.name); 
    updateServerState(server.id, { status: 'pending', error: null, latency: null, downloadSpeed: null, uploadSpeed: null });

    // Latency Test
    setCurrentGlobalTestStep(`Latency - ${server.name}`);
    updateServerState(server.id, { status: 'testing-latency' });
    try {
      const latency = await measureLatency(server.latencyTestUrl);
      updateServerState(server.id, { latency });
    } catch (error) {
      console.error(`Latency test failed for ${server.name}:`, error);
      updateServerState(server.id, { status: 'error', error: 'Latency test failed.' });
      throw error; 
    }

    // Download Test
    setCurrentGlobalTestStep(`Download - ${server.name}`);
    updateServerState(server.id, { status: 'testing-download', downloadSpeed: 0 }); // Show 0 initially
    try {
      const downloadSpeed = await measureDownloadSpeed(
        server.downloadTestUrl,
        (currentSpeedMbps) => {
          updateServerState(server.id, { downloadSpeed: currentSpeedMbps });
        }
      );
      updateServerState(server.id, { downloadSpeed }); // Set final speed
    } catch (error) {
      console.error(`Download test failed for ${server.name}:`, error);
      updateServerState(server.id, { status: 'error', error: 'Download test failed.' });
      throw error; 
    }

    // Upload Test (Simulated with live progress)
    setCurrentGlobalTestStep(`Upload - ${server.name}`);
    updateServerState(server.id, { status: 'testing-upload', uploadSpeed: 0 }); // Show 0 initially
    try {
      const uploadSpeed = await measureUploadSpeed(
        (currentSimulatedSpeedMbps) => {
          updateServerState(server.id, { uploadSpeed: currentSimulatedSpeedMbps });
        }
      );
      updateServerState(server.id, { uploadSpeed }); // Set final speed
    } catch (error) { 
      console.error(`Upload test failed for ${server.name}:`, error);
      updateServerState(server.id, { status: 'error', error: 'Upload test failed.' });
      throw error;
    }
    
    updateServerState(server.id, { status: 'completed' });
  }, [updateServerState]);


  const startAllTests = useCallback(async () => {
    if (isTestingOverall || isFetchingIp) return;

    await fetchPublicIp(); 

    setIsTestingOverall(true);
    setServerStates(initialServerStates()); 
    setCurrentGlobalTestStep("Initializing tests..."); 

    for (const server of SERVERS) {
      try {
        await runTestForServer(server);
      } catch (e) {
        console.error(`Failed testing server ${server.name}, stopping its tests.`);
        // runTestForServer already sets error state for the specific server
      }
    }

    setIsTestingOverall(false);
    setCurrentTestServerName(null); 
    setCurrentGlobalTestStep('All tests completed!');
  }, [isTestingOverall, isFetchingIp, runTestForServer, fetchPublicIp]); 

  const isNetworkOrCORSFailure = ipFetchError?.message?.toLowerCase().includes('networkerror') || 
                                 ipFetchError?.message?.toLowerCase().includes('failed to fetch') ||
                                 ipFetchError?.message?.toLowerCase().includes('cors');

  const hasNullStatusCode = ipFetchError?.message?.toLowerCase().includes('status (null)') || ipFetchError?.message?.toLowerCase().includes('kode status: (null)');


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-sky-400 tracking-tight">Speed Test</h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Measure your internet connection's performance in real-time.
        </p>
      </header>

      <div className="w-full max-w-4xl mb-6">
        <button
          onClick={startAllTests}
          disabled={isTestingOverall || isFetchingIp}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center text-lg"
          aria-live="polite"
          aria-controls="test-results-area"
        >
          {isTestingOverall || isFetchingIp ? (
            <>
              <Spinner size="h-5 w-5 mr-3" />
              {isFetchingIp ? "Fetching IP..." : (currentGlobalTestStep || "Testing...")}
            </>
          ) : (
             "Start Speed Test"
          )}
        </button>
        
        <div className="w-full max-w-4xl text-center mt-4 space-y-1 text-sm" aria-live="polite">
          {/* IP Fetching Status/Result */}
          {isFetchingIp && <p className="text-sky-300">Fetching your IP address...</p>}
          {!isFetchingIp && userPublicIp && !ipFetchError && (
            <p className="text-slate-300" aria-label="Your Public IP Address">
              Your Public IP: <span className="font-semibold text-sky-400">{userPublicIp}</span>
            </p>
          )}
          {!isFetchingIp && ipFetchError && (
            <div className="text-red-400 p-3 bg-red-900/30 rounded-md" role="alert">
              <p className="font-semibold">Could not retrieve your Public IP.</p>
              <p className="text-sm text-red-300 mt-1">Error: {ipFetchError.message || "Network request failed"}</p>
              {(isNetworkOrCORSFailure || hasNullStatusCode) && (
                <div className="mt-2 text-xs text-slate-300 text-left border-t border-red-700 pt-2">
                  <p className="font-medium mb-1">Troubleshooting suggestions:</p>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    <li><strong>Try an Incognito/Private window:</strong> This often isolates issues caused by browser extensions (ad blockers, privacy shields, VPN extensions).</li>
                    <li><strong>Temporarily disable browser extensions:</strong> If Incognito works, try disabling extensions one by one in your main browser profile.</li>
                    <li>Check your browser's built-in tracking protection or privacy settings; they might be too strict.</li>
                    <li>Check for firewall, VPN, or proxy server interference on your computer or network.</li>
                    <li>If the error mentions "status (null)" or "kode status: (null)", it strongly suggests a browser-side or local network blockage preventing the request from completing.</li>
                    <li>Ensure your internet connection is stable.</li>
                  </ul>
                  <p className="mt-1">If the issue persists across different browsers/networks, the IP service itself might be temporarily unavailable, but this is less common for established services.</p>
                </div>
              )}
            </div>
          )}

          {/* Overall Test Progress - shown if not fetching IP. Can appear alongside IP error if tests proceed. */}
          {isTestingOverall && currentGlobalTestStep && !isFetchingIp && (
            <p className="text-sky-300 animate-pulse">
              {currentGlobalTestStep}
            </p>
          )}
          {!isTestingOverall && !isFetchingIp && currentGlobalTestStep === 'All tests completed!' && (
            <p className="text-green-400">
              {currentGlobalTestStep}
            </p>
          )}
        </div>
      </div>

      <main id="test-results-area" className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVERS.map(server => (
          <ServerCard
            key={server.id}
            serverInfo={server}
            testState={serverStates[server.id]}
          />
        ))}
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Speed Test Application. For informational purposes.</p>
        <p>
          Download tests are performed against public file sources. Upload test is a client-side simulation.
          Results indicate performance to these specific sources under current network conditions.
        </p>
      </footer>
    </div>
  );
};

export default App;
