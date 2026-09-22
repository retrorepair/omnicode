export type ShellType = 'powershell' | 'cmd' | 'bash';

export interface WorkspaceFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  size?: number;
  updatedAt: string;
}

export interface AgentToolStep {
  toolName: string;
  arguments: Record<string, any>;
  output: any;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought?: string;
  toolCalls?: AgentToolStep[];
  timestamp: string;
}

export interface ToolchainStatus {
  name: string;
  category: string;
  version: string;
  status: 'installed' | 'missing' | 'checking';
  path: string;
  description: string;
}

export interface MamePreset {
  id: string;
  name: string;
  romName: string;
  year: number;
  cpu: string;
  defaultLuaScript: string;
  description: string;
}

export interface GhidraArch {
  id: string;
  name: string;
  description: string;
  endianness: 'LE' | 'BE';
  bits: number;
}

export interface MountedFolder {
  id: string;
  name: string;
  path: string;
  type: 'working_dir' | 'roms' | 'ghidra' | 'mingw' | 'custom';
  isLocalDiskMounted?: boolean;
  fileCount?: number;
  handle?: any; // FileSystemDirectoryHandle
}

export interface LocalHostStatus {
  connected: boolean;
  port: number;
  host: string;
  os?: string;
  username?: string;
  workingDir?: string;
  mountedFolders?: string[];
  mameInstalled?: boolean;
  ghidraInstalled?: boolean;
  mingwInstalled?: boolean;
  gitInstalled?: boolean;
}

export interface GeminiAuthStatus {
  signedIn: boolean;
  email?: string;
  name?: string;
  authMethod: 'cloud_env' | 'custom_key' | 'guest' | 'workspace_secret';
  model: string;
  tier: string;
  quotaStatus?: 'active' | 'warning' | 'exhausted';
  customApiKey?: string;
}

export interface AppSettings {
  theme: 'dark' | 'midnight' | 'matrix';
  autoRetryCompilerErrors: boolean;
  defaultShell: ShellType;
  companionPort: number;
  companionAutoConnect: boolean;
  preferredModel: string;
  desktopNotifications: boolean;
  // Toolchain paths
  mamePath: string;
  ghidraPath: string;
  mingwPath: string;
  gitPath: string;
  mips64Path: string;
  splatPath: string;
  // KI N64 Settings
  chdPath: string;
  bootRomPath: string;
  n64OutputPath: string;
  n64RomFormat: 'z64' | 'n64';
}

export interface KiDecompStage {
  id: string;
  title: string;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  command: string;
  description: string;
  output?: string;
  duration?: string;
}

export interface N64RomInfo {
  title: string;
  gameCode: string;
  destinationCode: string;
  version: string;
  clockRate: string;
  entryPoint: string;
  crc1: string;
  crc2: string;
  format: 'z64 (Big Endian)' | 'n64 (Little Endian)' | 'v64 (Byte Swapped)';
  sizeBytes: number;
  sizeMB: number;
  validCrc: boolean;
  headerMagic: string;
  generatedAt: string;
}

