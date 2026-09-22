const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function pushAndRelease() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN not found in environment');
  }

  const owner = 'retrorepair';
  const repo = 'omnicode';

  console.log(`[1/4] Creating repository https://github.com/${owner}/${repo}...`);
  const createRes = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OmniCode-Publisher',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repo,
      description: 'OmniCode: Autonomous Reverse Engineering, MAME Emulation & Killer Instinct N64 Decompilation Studio',
      private: false,
      has_issues: true,
      has_wiki: true,
    }),
  });

  const createStatus = createRes.status;
  const createData = await createRes.json();
  if (createStatus === 201) {
    console.log(`Repository created successfully: ${createData.html_url}`);
  } else if (createStatus === 422) {
    console.log('Repository already exists on GitHub, continuing...');
  } else {
    console.log(`Repository creation returned status ${createStatus}:`, createData);
  }

  console.log('[2/4] Configuring git remote and pushing branch main...');
  try {
    execSync('git remote remove origin 2>/dev/null || true');
    execSync(`git remote add origin https://x-access-token:${token}@github.com/${owner}/${repo}.git`);
    execSync('git branch -M main');
    const pushOutput = execSync('git push -u origin main --force', { encoding: 'utf8' });
    console.log('Git push output:', pushOutput.trim() || 'Pushed successfully');
  } catch (err) {
    console.error('Git push error:', err.message);
    if (err.stdout) console.log('stdout:', err.stdout.toString());
    if (err.stderr) console.error('stderr:', err.stderr.toString());
    throw err;
  }

  console.log('[3/4] Creating Release v1.0.0 on GitHub...');
  const releaseBody = [
    '# OmniCode v1.0.0 - Autonomous Reverse Engineering & KI N64 Decompilation Studio',
    '',
    '### Highlights & Capabilities',
    '- **Direct Multi-Directory Host Operations**: Full Claude Code-level versatility across local folders, ROM repositories, and toolchains.',
    '- **Autonomous Tool Resolution**: Automatically provisions and executes tools (Splat, MIPS64 GCC, CHDMAN, Git, MinGW, Ghidra, Python, MAME) on-the-fly without requiring manual button clicks.',
    '- **Arcade Asset Extractor & MIPS Disassembler**: Extracts Midway Ultra 64 CHD disk images (kinst.chd) and boot EPROMs (u98-l10.bin), runs Splat MIPS R4600 disassembly, and decompiles fighter state machines into readable C.',
    '- **N64 Reality Coprocessor HAL**: Microcode mapping Midway blitter registers to N64 Reality Display Processor (RDP) sprites, building a valid bootable N64 ROM (.z64).',
    '- **Autonomous MAME Emulation**: Headless execution with Lua automation scripts, coin/input hooks, and memory dumping.',
    '- **Native Windows x64 Installer**: Includes standalone setup package.',
    '',
    '### Downloads',
    'Download the native Windows x64 installer below.',
  ].join('\n');

  const releaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'OmniCode-Publisher',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: 'v1.0.0',
      target_commitish: 'main',
      name: 'OmniCode v1.0.0 - Native Windows x64 Release',
      body: releaseBody,
      draft: false,
      prerelease: false,
    }),
  });

  const releaseData = await releaseRes.json();
  console.log(`Release status: ${releaseRes.status} | URL: ${releaseData.html_url || releaseData.message}`);

  if (releaseData.upload_url) {
    console.log('[4/4] Uploading installer asset OmniCode-Setup-1.0.0-x64.exe...');
    const installerFile = path.join(process.cwd(), 'dist-installer', 'OmniCode-Setup-1.0.0-x64.exe');
    if (fs.existsSync(installerFile)) {
      const fileBuffer = fs.readFileSync(installerFile);
      const cleanUrl = releaseData.upload_url.replace(/\{[^}]+\}/g, '') + '?name=OmniCode-Setup-1.0.0-x64.exe';
      const uploadRes = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'User-Agent': 'OmniCode-Publisher',
          'Content-Length': fileBuffer.length.toString(),
        },
        body: fileBuffer,
      });
      const uploadData = await uploadRes.json();
      console.log(`Asset upload status: ${uploadRes.status} | Asset URL: ${uploadData.browser_download_url || uploadData.message}`);
    } else {
      console.log(`Notice: ${installerFile} not found for asset upload`);
    }
  }

  console.log(`\n🎉 SUCCESS! Repository pushed and release published: https://github.com/${owner}/${repo}/releases/tag/v1.0.0`);
}

pushAndRelease().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
