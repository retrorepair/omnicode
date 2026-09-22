# OmniCode: Autonomous Desktop Coding Agent & Claude Code Alternative

**OmniCode** is an autonomous desktop software engineering agent designed as a broad, complete replacement for the Claude Code desktop application. It pairs high-speed AI reasoning with direct host system access, multi-directory workspace mounting, native terminal execution, and zero-friction autonomous toolchain management.

Whether you're developing modern full-stack web apps, writing high-performance systems code in Rust or C++, orchestrating Python AI pipelines, or decompiling low-level legacy arcade ROMs, OmniCode executes complete development workflows autonomously on your PC.

---

## Key Capabilities

### 1. Broad Desktop Replacement for Claude Code
- **Universal Language & Stack Support**: TypeScript, JavaScript, Python, Rust, Go, C/C++, C#, Java, Shell, PowerShell, and SQL.
- **Full Software Lifecycle**: Scaffolding new projects, surgical multi-file refactoring, writing comprehensive test suites, debugging runtime exceptions, and optimizing performance.
- **Arbitrary Host Operations**: Direct access to your host machine's drives and folders (`C:\`, `D:\`, network drives, WSL paths).

### 2. Multi-Directory Workspace Integration
- Mount and navigate multiple directories simultaneously (e.g., active project, shared component libraries, asset repositories, compiler toolchains).
- Point OmniCode to any folder on your machine or switch working contexts instantaneously.

### 3. Zero-Friction Autonomous Toolchain & Execution
- **Claude-Level Autonomous Permissions**: OmniCode has pre-granted authority to download, install, configure, and run any missing CLI utilities, package managers, compilers, or libraries on-the-fly via `winget`, `pip`, `npm`, or portable extraction.
- **No Nagging Prompts**: Eliminates manual "Install Missing Tools" buttons—builds, extractions, and tests execute end-to-end without interruption.

### 4. Interactive IDE & Developer Experience
- **File Explorer & Editor**: Full syntax-highlighted code editor with multi-file tabs.
- **Integrated Terminal**: Live PowerShell / Command Prompt / Bash execution with output streaming.
- **Autonomous Agent Chat**: Real-time conversation with collapsible tool execution telemetry, diff inspectors, and error self-correction loops.
- **Git Version Control Studio**: Built-in visual branch management, staging, committing, and one-click GitHub push/release pipeline.

### 5. Advanced Systems & Emulation Pipelines (Specialized Profiles)
- **MAME Arcade Automation**: Headless emulation execution, Lua script injection, RAM dumping, and frame capture.
- **Ghidra Headless Analysis**: Automated binary disassembly, symbol extraction, and C pseudocode generation.
- **Midway Ultra 64 → Nintendo 64 Decompilation Studio**: Automated arcade CHD extraction (`chdman`), Splat MIPS R4600 disassembly, state-machine C decompilation (`mips_to_c`), and native Nintendo 64 cross-compilation (`mips64-elf-gcc` + N64 Reality Coprocessor HAL) into playable `.z64` ROMs.

---

## Quick Start

### Installation (Windows x64)

Download the latest installer from the [Releases](https://github.com/retrorepair/omnicode/releases) tab:

1. Download `OmniCode-Setup-1.0.0-x64.exe`
2. Run the installer or execute `install-omnicode.cmd`
3. Launch OmniCode from your Start Menu or desktop shortcut

### Running from Source

```bash
# Clone the repository
git clone https://github.com/retrorepair/omnicode.git
cd omnicode

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Visit `http://localhost:3000` to open the OmniCode workstation.

---

## Architecture & Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend Orchestrator**: Node.js & Express (TypeScript)
- **System Bridge**: Direct child-process execution (PowerShell / cmd / bash) with custom working directory (`cwd`) targeting
- **Agent Intelligence**: Google Gemini models via `@google/genai` with streaming tool-use orchestration

---

## License

MIT License. Created by [retrorepair](https://github.com/retrorepair).
