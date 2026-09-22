/**
 * Local Companion Client
 * Connects directly to the user's host machine (http://localhost:4040)
 * to provide 100% Claude-Code level integration with local directories,
 * arbitrary path access, and native process execution (MAME, MinGW, Ghidra, Git).
 */

const COMPANION_URL = 'http://localhost:4040';

export interface CompanionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  output?: string;
  exitCode?: number;
}

export async function pingLocalCompanion(): Promise<{
  connected: boolean;
  info?: any;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${COMPANION_URL}/status`, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { connected: true, info: data };
    }
    return { connected: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { connected: false, error: err.message || 'Connection refused' };
  }
}

export async function executeOnLocalMachine(
  command: string,
  cwd: string = 'C:\\dev\\mame-arcade',
  shell: string = 'powershell'
): Promise<CompanionResponse> {
  try {
    const res = await fetch(`${COMPANION_URL}/exec`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, cwd, shell }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.exitCode === 0,
        output: data.output || '',
        exitCode: data.exitCode,
        error: data.error,
      };
    }
    return {
      success: false,
      error: `Companion server responded with HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Could not reach local companion daemon: ${err.message}`,
    };
  }
}

export async function readLocalHostFile(filePath: string): Promise<string> {
  const res = await fetch(`${COMPANION_URL}/fs/read`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath }),
  });

  if (!res.ok) {
    throw new Error(`Failed to read local file ${filePath}: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content || '';
}

export async function writeLocalHostFile(
  filePath: string,
  content: string
): Promise<void> {
  const res = await fetch(`${COMPANION_URL}/fs/write`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: filePath, content }),
  });

  if (!res.ok) {
    throw new Error(`Failed to write local file ${filePath}: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
}

export async function listLocalHostDirectory(dirPath: string): Promise<any[]> {
  const res = await fetch(`${COMPANION_URL}/fs/list`, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directory: dirPath }),
  });

  if (!res.ok) {
    throw new Error(`Failed to list local directory ${dirPath}: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.files || [];
}
