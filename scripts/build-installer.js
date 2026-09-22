// Windows x64 Native Installer & Launcher Generator
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('[OmniCode Installer] Initializing Native Windows x64 Installer Build...');

const distDir = path.join(rootDir, 'dist');
const distInstallerDir = path.join(rootDir, 'dist-installer');
const srcNativeDir = path.join(rootDir, 'src-native');

if (!fs.existsSync(distInstallerDir)) {
  fs.mkdirSync(distInstallerDir, { recursive: true });
}

// 1. Check build artifacts
const indexHtml = path.join(distDir, 'index.html');
const serverCjs = path.join(distDir, 'server.cjs');

if (!fs.existsSync(indexHtml) || !fs.existsSync(serverCjs)) {
  console.error('[Error] dist/index.html or dist/server.cjs is missing. Run `npm run build` first.');
  process.exit(1);
}

// 2. Compile native Windows x64 launcher OmniCode.exe
const launcherSrc = path.join(srcNativeDir, 'launcher.c');
const launcherExe = path.join(distInstallerDir, 'OmniCode.exe');

console.log('[1/4] Compiling native Windows x64 launcher (OmniCode.exe) via x86_64-w64-mingw32-gcc...');
try {
  execSync(`x86_64-w64-mingw32-gcc -O2 -mwindows "${launcherSrc}" -o "${launcherExe}"`, { stdio: 'inherit' });
  console.log(`[OK] Compiled OmniCode.exe (${(fs.statSync(launcherExe).size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('[Error] Failed to compile native launcher:', err);
  process.exit(1);
}

// 3. Prepare batch scripts and manifest
const installerManifest = {
  appName: 'OmniCode Desktop Agent',
  version: '1.0.0',
  architecture: 'x64 (AMD64)',
  targetPlatform: 'Windows 10 / 11 (64-bit)',
  generatedAt: new Date().toISOString(),
  targetPackage: 'OmniCode-Setup-1.0.0-x64.exe',
  components: [
    'OmniCode Native Windows x64 Launcher (OmniCode.exe)',
    'Universal Autonomous Coding Agent & Claude Code Alternative',
    'Multi-Directory Host Workspace & Terminal Integration',
    'Autonomous Toolchain & Dependency Provisioning (winget / pip / npm)',
    'Emulation & Decompilation Pipelines (MAME / Ghidra / N64)',
    'Interactive React / Vite Workstation UI & Embedded Server',
  ],
};

fs.writeFileSync(
  path.join(distInstallerDir, 'installer-manifest.json'),
  JSON.stringify(installerManifest, null, 2)
);

// 4. Compile NSIS Setup Executable OmniCode-Setup-1.0.0-x64.exe
console.log('[2/4] Compiling NSIS Windows Installer (OmniCode-Setup-1.0.0-x64.exe) via makensis...');
const nsisScript = path.join(rootDir, 'installer.nsi');
const setupExe = path.join(distInstallerDir, 'OmniCode-Setup-1.0.0-x64.exe');

try {
  execSync(`makensis "${nsisScript}"`, { cwd: rootDir, stdio: 'inherit' });
  console.log(`[OK] Compiled NSIS Installer: ${setupExe} (${(fs.statSync(setupExe).size / (1024 * 1024)).toFixed(2)} MB)`);
} catch (err) {
  console.error('[Error] makensis compilation failed:', err);
  process.exit(1);
}

// 5. Create Standalone Portable Zip Archive
console.log('[3/4] Creating portable distribution zip (OmniCode-v1.0.0-windows-x64.zip)...');
const zipFile = path.join(distInstallerDir, 'OmniCode-v1.0.0-windows-x64.zip');
try {
  const tempZipDir = path.join(rootDir, 'tmp-portable');
  if (fs.existsSync(tempZipDir)) {
    fs.rmSync(tempZipDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempZipDir, { recursive: true });

  // Copy app files
  fs.copyFileSync(launcherExe, path.join(tempZipDir, 'OmniCode.exe'));
  fs.copyFileSync(path.join(distInstallerDir, 'run-omnicode.bat'), path.join(tempZipDir, 'run-omnicode.bat'));
  fs.copyFileSync(path.join(distInstallerDir, 'install-omnicode.cmd'), path.join(tempZipDir, 'install-omnicode.cmd'));
  fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(tempZipDir, 'package.json'));
  fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(tempZipDir, 'README.md'));

  // Copy dist
  execSync(`cp -r "${distDir}" "${path.join(tempZipDir, 'dist')}"`);

  // Zip
  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }
  execSync(`cd "${tempZipDir}" && zip -r "${zipFile}" .`, { stdio: 'pipe' });
  fs.rmSync(tempZipDir, { recursive: true, force: true });
  console.log(`[OK] Created Portable Zip: ${zipFile} (${(fs.statSync(zipFile).size / (1024 * 1024)).toFixed(2)} MB)`);
} catch (err) {
  console.warn('[Warning] Could not create zip archive:', err.message);
}

console.log('\n[4/4] All Windows x64 release artifacts ready:');
console.log(`  -> Installer: ${setupExe}`);
console.log(`  -> Launcher:  ${launcherExe}`);
console.log(`  -> Portable:  ${zipFile}`);
