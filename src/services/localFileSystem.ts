/**
 * Local File System Access API Service
 * Enables direct native read/write access to folders on the user's computer via browser
 */

import { WorkspaceFile } from '../types';

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function pickLocalDirectory(): Promise<{
  handle: any;
  name: string;
} | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error(
      'File System Access API is not supported in this browser. Please use Chrome, Edge, or Brave, or use the OmniCode Local Companion daemon.'
    );
  }

  try {
    const handle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });
    return { handle, name: handle.name };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null;
    }
    throw err;
  }
}

export async function scanDirectoryHandle(
  dirHandle: any,
  prefix: string = ''
): Promise<WorkspaceFile[]> {
  const files: WorkspaceFile[] = [];

  for await (const [name, entry] of dirHandle.entries()) {
    // Ignore hidden or git or bulky node_modules
    if (name.startsWith('.') || name === 'node_modules' || name === 'dist' || name === 'build') {
      continue;
    }

    const relativePath = prefix ? `${prefix}/${name}` : name;

    if (entry.kind === 'file') {
      try {
        const fileObj = await entry.getFile();
        let content: string | undefined = undefined;

        // Read text content for code/script/text files under 1MB
        const isText =
          name.endsWith('.lua') ||
          name.endsWith('.c') ||
          name.endsWith('.h') ||
          name.endsWith('.py') ||
          name.endsWith('.json') ||
          name.endsWith('.txt') ||
          name.endsWith('.md') ||
          name.endsWith('.bat') ||
          name.endsWith('.ps1') ||
          name.endsWith('.sh') ||
          name.includes('Makefile');

        if (isText && fileObj.size < 1024 * 1024) {
          content = await fileObj.text();
        }

        files.push({
          name,
          path: relativePath,
          type: 'file',
          size: fileObj.size,
          updatedAt: new Date(fileObj.lastModified).toISOString(),
          content,
          language: getLanguageFromFileName(name),
        });
      } catch (e) {
        console.warn(`Could not read file ${relativePath}:`, e);
      }
    } else if (entry.kind === 'directory') {
      const subFiles = await scanDirectoryHandle(entry, relativePath);
      files.push(...subFiles);
    }
  }

  return files;
}

export async function writeLocalFileViaHandle(
  rootHandle: any,
  filePath: string,
  content: string
): Promise<void> {
  const parts = filePath.split('/').filter(Boolean);
  let currentHandle = rootHandle;

  for (let i = 0; i < parts.length - 1; i++) {
    currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
  }

  const fileName = parts[parts.length - 1];
  const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function readLocalFileViaHandle(
  rootHandle: any,
  filePath: string
): Promise<string> {
  const parts = filePath.split('/').filter(Boolean);
  let currentHandle = rootHandle;

  for (let i = 0; i < parts.length - 1; i++) {
    currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
  }

  const fileName = parts[parts.length - 1];
  const fileHandle = await currentHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  return await file.text();
}

function getLanguageFromFileName(fileName: string): string {
  if (fileName.endsWith('.lua')) return 'lua';
  if (fileName.endsWith('.c') || fileName.endsWith('.h')) return 'c';
  if (fileName.endsWith('.py')) return 'python';
  if (fileName.endsWith('.json')) return 'json';
  if (fileName.endsWith('.md')) return 'markdown';
  if (fileName.endsWith('.ps1')) return 'powershell';
  if (fileName.endsWith('.bat')) return 'bat';
  if (fileName.endsWith('.sh') || fileName.includes('Makefile')) return 'shell';
  return 'text';
}
