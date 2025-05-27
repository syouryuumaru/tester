
export interface ServerInfo {
  id: string;
  name: string;
  location: string;
  latencyTestUrl: string;
  downloadTestUrl: string;
  // Upload test is typically to the same infrastructure, but we'll mock it.
}

export interface TestScores {
  latency: number | null; // in ms
  downloadSpeed: number | null; // in Mbps
  uploadSpeed: number | null; // in Mbps
}

export interface ServerTestResult extends TestScores {
  error?: string | null;
}

export type TestStatus = 'idle' | 'pending' | 'testing-latency' | 'testing-download' | 'testing-upload' | 'completed' | 'error';

export interface ServerTestState extends ServerTestResult {
  status: TestStatus;
}

export type AllServersTestState = Record<string, ServerTestState>;
