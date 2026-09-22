import { MamePreset, GhidraArch, ToolchainStatus } from '../types';

export const MAME_PRESETS: MamePreset[] = [
  {
    id: 'pacman',
    name: 'Pac-Man (Midway / Namco)',
    romName: 'pacman',
    year: 1980,
    cpu: 'Zilog Z80 @ 3.072 MHz',
    defaultLuaScript: 'pacman/mame_autoboot.lua',
    description: 'Classic maze arcade game. Automated RAM monitoring for score address 0x4E80 and lives at 0x4E14.',
  },
  {
    id: 'galaga',
    name: 'Galaga (Namco)',
    romName: 'galaga',
    year: 1981,
    cpu: '3x Zilog Z80 @ 3.125 MHz',
    defaultLuaScript: 'scripts/galaga_autostart.lua',
    description: 'Fixed-shooter space arcade game. Multi-CPU bus with shared memory and sub-CPU sound generator.',
  },
  {
    id: 'sf2',
    name: 'Street Fighter II: The World Warrior (Capcom CPS-1)',
    romName: 'sf2',
    year: 1991,
    cpu: 'Motorola 68000 @ 10 MHz + Z80 Sound',
    defaultLuaScript: 'scripts/sf2_combo_bot.lua',
    description: 'CPS-1 arcade fighting hardware. Autonomous input state machine for frame-perfect special moves.',
  },
  {
    id: 'neogeo',
    name: 'Neo Geo MVS Bios & Metal Slug',
    romName: 'mslug',
    year: 1996,
    cpu: 'Motorola 68000 @ 12 MHz + Z80 @ 4 MHz',
    defaultLuaScript: 'scripts/neogeo_bios_hook.lua',
    description: 'SNK Neo Geo Multi Video System. Bios call interceptor, sprite buffer inspector, and credit auto-insert.',
  },
];

export const GHIDRA_ARCHITECTURES: GhidraArch[] = [
  { id: 'Z80:LE:16:default', name: 'Zilog Z80 (16-bit Little Endian)', description: 'Pac-Man, Galaga, Space Invaders audio, Neo Geo sound', endianness: 'LE', bits: 16 },
  { id: '68000:BE:32:default', name: 'Motorola 68000 (32-bit Big Endian)', description: 'Capcom CPS-1/CPS-2, Neo Geo, Sega Genesis / System 16', endianness: 'BE', bits: 32 },
  { id: '6502:LE:16:default', name: 'MOS 6502 (16-bit Little Endian)', description: 'Atari Arcade, Donkey Kong sound, Commodore, Apple II', endianness: 'LE', bits: 16 },
  { id: 'ARM:LE:32:v7', name: 'ARM Cortex / v7 (32-bit Little Endian)', description: 'Modern arcade platforms, GBA, embedded emulator target', endianness: 'LE', bits: 32 },
  { id: 'x86:LE:32:default', name: 'x86 (32-bit Little Endian)', description: 'MinGW DLL hooks, PC-based arcade boards (Taito Type X)', endianness: 'LE', bits: 32 },
];

export const DEFAULT_TOOLCHAINS: ToolchainStatus[] = [
  {
    name: 'Git for Windows',
    category: 'Version Control',
    version: '2.44.0',
    status: 'installed',
    path: 'C:\\Program Files\\Git\\bin\\git.exe',
    description: 'Local repository management, automated branch synchronization, and GitHub commits/pushes.',
  },
  {
    name: 'MinGW-w64 (GCC/Make)',
    category: 'Compiler Toolchain',
    version: '13.2.0 (UCRT)',
    status: 'installed',
    path: 'C:\\tools\\mingw64\\bin\\gcc.exe',
    description: 'C/C++ native compiler for driver hooks, ROM binary patchers, and custom MAME plugins.',
  },
  {
    name: 'MAME (Multiple Arcade Machine Emulator)',
    category: 'Emulation Core',
    version: '0.262',
    status: 'installed',
    path: 'C:\\tools\\mame\\mame.exe',
    description: 'Autonomous ROM execution engine with integrated Lua scripting and memory inspection hooks.',
  },
  {
    name: 'Ghidra Headless Analyzer',
    category: 'Reverse Engineering',
    version: '11.0.3 (NSA)',
    status: 'installed',
    path: 'C:\\tools\\ghidra\\support\\analyzeHeadless.bat',
    description: 'Automated disassembly, decompilation into C pseudocode, and symbol recovery for ROMs.',
  },
  {
    name: 'Python 3.11 Runtime',
    category: 'Automation Scripting',
    version: '3.11.8',
    status: 'installed',
    path: 'C:\\Python311\\python.exe',
    description: 'PyWinAuto / PyAutoGUI desktop GUI navigation, binary parsing, and Ghidra bridge.',
  },
];
