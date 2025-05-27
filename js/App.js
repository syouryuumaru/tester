// This file is generated from App.tsx
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import './types.js'; // Keep for module graph, actual types are erased.
import { SERVERS } from './constants.js';
import { measureLatency, measureDownloadSpeed, measureUploadSpeed } from './services/speedTestService.js';
import ServerCard from './components/ServerCard.js';
import Spinner from './components/Spinner.js';

const initialServerStates = () => {
  return SERVERS.reduce((acc, server) => {
    acc[server.id] = {
      latency: null,
      downloadSpeed: null,
      uploadSpeed: null,
      status: 'idle',
      error: null,
    };
    return acc;
  }, {});
};

const App = () => {
  const [serverStates, setServerStates] = useState(initialServerStates());
  const [isTestingOverall, setIsTestingOverall] = useState(false);
  const [currentTestServerName, setCurrentTestServerName] = useState(null);
  const [currentGlobalTestStep, setCurrentGlobalTestStep] = useState(null);
  const [userPublicIp, setUserPublicIp] = useState(null);
  const [isFetchingIp, setIsFetchingIp] = useState(false);
  const [ipFetchError, setIpFetchError] = useState(null);


  const updateServerState = useCallback((serverId, updates) => {
    setServerStates((prevStates) => ({
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
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        cache: 'no-cache', 
      });
      if (!response.ok) {
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

  const runTestForServer = useCallback(async (server) => {
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
    updateServerState(server.id, { status: 'testing-download', downloadSpeed: 0 }); 
    try {
      const downloadSpeed = await measureDownloadSpeed(
        server.downloadTestUrl,
        (currentSpeedMbps) => {
          updateServerState(server.id, { downloadSpeed: currentSpeedMbps });
        }
      );
      updateServerState(server.id, { downloadSpeed }); 
    } catch (error) {
      console.error(`Download test failed for ${server.name}:`, error);
      updateServerState(server.id, { status: 'error', error: 'Download test failed.' });
      throw error; 
    }

    // Upload Test (Actual data POST attempts)
    setCurrentGlobalTestStep(`Upload - ${server.name}`);
    updateServerState(server.id, { status: 'testing-upload', uploadSpeed: 0 }); 
    try {
      const uploadSpeed = await measureUploadSpeed(
        server.uploadTestUrl, // Pass the server's uploadTestUrl
        (currentSpeedMbps) => {
          updateServerState(server.id, { uploadSpeed: currentSpeedMbps });
        }
      );
      updateServerState(server.id, { uploadSpeed }); 
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
    _jsxs("div", {
      className: "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 md:p-8 flex flex-col items-center",
      children: [
        _jsxs("header", {
          className: "w-full max-w-4xl mb-8 text-center",
          children: [
            _jsx("h1", { className: "text-4xl md:text-5xl font-bold text-sky-400 tracking-tight", children: "Speed Test" }),
            _jsx("p", { className: "text-slate-400 mt-2 text-sm md:text-base", children: "Measure your internet connection's performance in real-time." })
          ]
        }),
        _jsxs("div", {
          className: "w-full max-w-4xl mb-6",
          children: [
            _jsx("button", {
              onClick: startAllTests,
              disabled: isTestingOverall || isFetchingIp,
              className: "w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out flex items-center justify-center text-lg",
              "aria-live": "polite",
              "aria-controls": "test-results-area",
              children: isTestingOverall || isFetchingIp ? (_jsxs(_Fragment, {
                children: [_jsx(Spinner, { size: "h-5 w-5 mr-3" }), isFetchingIp ? "Fetching IP..." : (currentGlobalTestStep || "Testing...")]
              })) : ("Start Speed Test")
            }),
            _jsxs("div", {
              className: "w-full max-w-4xl text-center mt-4 space-y-1 text-sm",
              "aria-live": "polite",
              children: [isFetchingIp && _jsx("p", { className: "text-sky-300", children: "Fetching your IP address..." }), !isFetchingIp && userPublicIp && !ipFetchError && (_jsxs("p", {
                className: "text-slate-300",
                "aria-label": "Your Public IP Address",
                children: ["Your Public IP: ", _jsx("span", { className: "font-semibold text-sky-400", children: userPublicIp })]
              })), !isFetchingIp && ipFetchError && (_jsxs("div", {
                className: "text-red-400 p-3 bg-red-900/30 rounded-md",
                role: "alert",
                children: [_jsx("p", { className: "font-semibold", children: "Could not retrieve your Public IP." }), _jsxs("p", {
                  className: "text-sm text-red-300 mt-1",
                  children: ["Error: ", ipFetchError.message || "Network request failed"]
                }), (isNetworkOrCORSFailure || hasNullStatusCode) && (_jsxs("div", {
                  className: "mt-2 text-xs text-slate-300 text-left border-t border-red-700 pt-2",
                  children: [_jsx("p", { className: "font-medium mb-1", children: "Troubleshooting suggestions:" }), _jsxs("ul", {
                    className: "list-disc list-inside pl-2 space-y-0.5",
                    children: [_jsx("li", { children: _jsx("strong", { children: "Try an Incognito/Private window:" }), children: " This often isolates issues caused by browser extensions (ad blockers, privacy shields, VPN extensions)." }), _jsx("li", { children: _jsx("strong", { children: "Temporarily disable browser extensions:" }), children: " If Incognito works, try disabling extensions one by one in your main browser profile." }), _jsx("li", { children: "Check your browser's built-in tracking protection or privacy settings; they might be too strict." }), _jsx("li", { children: "Check for firewall, VPN, or proxy server interference on your computer or network." }), _jsx("li", { children: "If the error mentions \"status (null)\" or \"kode status: (null)\", it strongly suggests a browser-side or local network blockage preventing the request from completing." }), _jsx("li", { children: "Ensure your internet connection is stable." })]
                  }), _jsx("p", { className: "mt-1", children: "If the issue persists across different browsers/networks, the IP service itself might be temporarily unavailable, but this is less common for established services." })]
                }))]
              })), isTestingOverall && currentGlobalTestStep && !isFetchingIp && (_jsx("p", { className: "text-sky-300 animate-pulse", children: currentGlobalTestStep })), !isTestingOverall && !isFetchingIp && currentGlobalTestStep === 'All tests completed!' && (_jsx("p", { className: "text-green-400", children: currentGlobalTestStep }))]
            })]
        }),
        _jsx("main", {
          id: "test-results-area",
          className: "w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6",
          children: SERVERS.map(server => (_jsx(ServerCard, {
            serverInfo: server,
            testState: serverStates[server.id]
          }, server.id)))
        }),
        _jsxs("footer", {
          className: "w-full max-w-4xl mt-12 text-center text-xs text-slate-500",
          children: [_jsxs("p", {
            children: ["© ", new Date().getFullYear(), " Speed Test Application. For informational purposes."]
          }), _jsx("p", { children: "Download tests are performed against public file sources. Upload tests attempt to send data to the target server; actual speed measured may be affected by server response to POST requests. Results indicate performance to these specific sources under current network conditions." })]
        })]
    })
  );
};

export default App;