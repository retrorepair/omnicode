#!/usr/bin/env node
/**
 * OmniCode Native CLI & Host Daemon Bridge (Claude Code Architecture)
 * 
 * Usage:
 *   node omnicode-cli.mjs [working_directory] [options]
 * 
 * Examples:
 *   node omnicode-cli.mjs "C:\dev\mame-arcade" --roms "D:\arcade\roms" --port 4040
 *   npx omnicode .
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import os from 'os';

const args = process.argv.slice(2);
let workingDir = process.cwd();
let port = 4040;
const mountedFolders = new Map();

// Parse CLI arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = parseInt(args[++i], 10);
  } else if (args[i] === '--roms' && args[i + 1]) {
    mountedFolders.set('roms', path.resolve(args[++i]));
  } else if (args[i] === '--ghidra' && args[i + 1]) {
    mountedFolders.set('ghidra', path.resolve(args[++i]));
  } else if (args[i] === '--folder' && args[i + 1]) {
    const pair = args[++i].split('=');
    if (pair.length === 2) {
      mountedFolders.set(pair[0], path.resolve(pair[1]));
    } else {
      mountedFolders.set(`folder_${mountedFolders.size + 1}`, path.resolve(args[i]));
    }
  } else if (!args[i].startsWith('-')) {
    workingDir = path.resolve(args[i]);
  }
}

mountedFolders.set('working_dir', workingDir);

console.log('\x1b[36m========================================================\x1b[0m');
console.log('\x1b[33m  OmniCode Native Desktop Host Daemon (Claude Code Parity)\x1b[0m');
console.log(`\x1b[32m  Primary Working Dir:\x1b[0m ${workingDir}`);
console.log('\x1b[32m  Mounted Directories:\x1b[0m');
for (const [alias, folderPath] of mountedFolders.entries()) {
  console.log(`    - [${alias}]: ${folderPath}`);
}
console.log(`\x1b[32m  Bridge URL:\x1b[0m          http://localhost:${port}`);
console.log('\x1b[36m========================================================\x1b[0m\n');

// Ensure working dir exists
if (!fs.existsSync(workingDir)) {
  fs.mkdirSync(workingDir, { recursive: true });
}

// HTTP Host Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${port}`);

  // Route: Status & System Diagnostics
  if (req.method === 'GET' && url.pathname === '/status') {
    const responseData = {
      status: 'online',
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      workingDir,
      mountedFolders: Object.fromEntries(mountedFolders),
      uptime: process.uptime(),
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
    return;
  }

  // Parse JSON Body Helper
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload = {};
    if (body) {
      try {
        payload = JSON.parse(body);
      } catch (e) {
        // ignore
      }
    }

    // Route: Execute Command in local shell
    if (req.method === 'POST' && url.pathname === '/exec') {
      const { command, cwd = workingDir, shell } = payload;
      if (!command) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Command is required' }));
        return;
      }

      console.log(`\x1b[35m[EXEC in ${cwd}]\x1b[0m: ${command}`);

      const execOptions = {
        cwd: fs.existsSync(cwd) ? cwd : workingDir,
        maxBuffer: 10 * 1024 * 1024,
      };

      if (os.platform() === 'win32' && shell === 'powershell') {
        execOptions.shell = 'powershell.exe';
      }

      exec(command, execOptions, (error, stdout, stderr) => {
        const output = (stdout || '') + (stderr ? `\nSTDERR:\n${stderr}` : '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          exitCode: error ? error.code || 1 : 0,
          output: output.trim(),
          error: error ? error.message : null,
        }));
      });
      return;
    }

    // Route: Read Local File
    if (req.method === 'POST' && url.pathname === '/fs/read') {
      let targetPath = payload.path;
      if (!path.isAbsolute(targetPath)) {
        targetPath = path.join(workingDir, targetPath);
      }

      if (!fs.existsSync(targetPath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `File not found: ${targetPath}` }));
        return;
      }

      try {
        const content = fs.readFileSync(targetPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ path: targetPath, content }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Route: Write Local File
    if (req.method === 'POST' && url.pathname === '/fs/write') {
      let targetPath = payload.path;
      if (!path.isAbsolute(targetPath)) {
        targetPath = path.join(workingDir, targetPath);
      }

      try {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, payload.content || '', 'utf8');
        console.log(`\x1b[32m[WRITE]\x1b[0m Saved ${targetPath}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, path: targetPath }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Route: List Local Directory
    if (req.method === 'POST' && url.pathname === '/fs/list') {
      let targetDir = payload.directory || workingDir;
      if (!path.isAbsolute(targetDir)) {
        targetDir = path.join(workingDir, targetDir);
      }

      if (!fs.existsSync(targetDir)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Directory not found: ${targetDir}` }));
        return;
      }

      try {
        const entries = fs.readdirSync(targetDir, { withFileTypes: true });
        const files = entries.map(e => ({
          name: e.name,
          path: path.join(targetDir, e.name),
          isDirectory: e.isDirectory(),
          isFile: e.isFile(),
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ directory: targetDir, files }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Route: Mount Additional Folder
    if (req.method === 'POST' && url.pathname === '/fs/mount') {
      const { alias, folderPath } = payload;
      if (!alias || !folderPath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'alias and folderPath required' }));
        return;
      }
      const resolved = path.resolve(folderPath);
      mountedFolders.set(alias, resolved);
      console.log(`\x1b[32m[MOUNT]\x1b[0m Added folder alias [${alias}] -> ${resolved}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, mountedFolders: Object.fromEntries(mountedFolders) }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[OK] OmniCode Host Daemon running at http://localhost:${port}`);
  console.log('Ready to execute commands and manage local directories.\n');
});
