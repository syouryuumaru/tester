
import React from 'react';
import { ServerInfo, ServerTestState, TestStatus } from '../types.js';
import Spinner from './Spinner.js';

interface ServerCardProps {
  serverInfo: ServerInfo;
  testState: ServerTestState;
}

const StatusIndicator: React.FC<{ status: TestStatus, currentTest?: string }> = ({ status, currentTest }) => {
  if (status === 'pending') return <span className="text-xs text-yellow-400">Pending...</span>;
  if (status === 'testing-latency') return <div className="flex items-center text-xs text-sky-400"><Spinner size="h-3 w-3 mr-1" /> Testing Latency...</div>;
  if (status === 'testing-download') return <div className="flex items-center text-xs text-sky-400"><Spinner size="h-3 w-3 mr-1" /> Testing Download...</div>;
  if (status === 'testing-upload') return <div className="flex items-center text-xs text-sky-400"><Spinner size="h-3 w-3 mr-1" /> Testing Upload...</div>;
  if (status === 'completed') return <span className="text-xs text-green-400">Completed</span>;
  if (status === 'error') return <span className="text-xs text-red-400">Error</span>;
  return <span className="text-xs text-slate-400">Idle</span>;
};

const MetricDisplay: React.FC<{ label: string; value: number | null; unit: string; icon: React.ReactNode; status: TestStatus; testType: 'latency' | 'download' | 'upload' }> = ({ label, value, unit, icon, status, testType}) => {
  const isActiveTest = 
    (testType === 'latency' && status === 'testing-latency') ||
    (testType === 'download' && status === 'testing-download') ||
    (testType === 'upload' && status === 'testing-upload');

  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center">
        <span className="mr-2 text-slate-400">{icon}</span>
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      {isActiveTest ? (
        <Spinner size="h-4 w-4" color="text-sky-400" />
      ) : value !== null ? (
        <span className="text-sm font-semibold text-slate-100">{value} <span className="text-xs text-slate-400">{unit}</span></span>
      ) : (
        <span className="text-sm text-slate-500">-</span>
      )}
    </div>
  );
};

const PingIcon: React.FC = () => ( // Simplified icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l-2.481-2.481M19.5 12v6.75M10.5 17.25v6.75m0 0H4.5m6 0v-6.75m0 0L8.019 8.019m0 0c1.138-1.137 2.6-1.755 4.126-1.755C14.943 6.264 16.5 7.39 16.5 8.874c0 .892-.38 1.705-1.005 2.275M4.5 17.25H0" />
  </svg>
);

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);


const ServerCard: React.FC<ServerCardProps> = ({ serverInfo, testState }) => {
  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-6 w-full transform transition-all duration-300 hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold text-sky-400">{serverInfo.name}</h3>
          <p className="text-xs text-slate-400">{serverInfo.location}</p>
        </div>
        <StatusIndicator status={testState.status} />
      </div>
      
      <div className="space-y-1 divide-y divide-slate-700">
        <MetricDisplay 
            label="Latency" 
            value={testState.latency} 
            unit="ms" 
            icon={<PingIcon />} 
            status={testState.status}
            testType="latency"
        />
        <MetricDisplay 
            label="Download" 
            value={testState.downloadSpeed} 
            unit="Mbps" 
            icon={<DownloadIcon />}
            status={testState.status}
            testType="download"
        />
        <MetricDisplay 
            label="Upload" 
            value={testState.uploadSpeed} 
            unit="Mbps" 
            icon={<UploadIcon />}
            status={testState.status}
            testType="upload"
        />
      </div>
      {testState.error && (
        <p className="mt-3 text-xs text-red-400 bg-red-900/30 p-2 rounded">Error: {testState.error}</p>
      )}
    </div>
  );
};

export default ServerCard;