#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int FileExists(const char *path) {
    DWORD dwAttrib = GetFileAttributesA(path);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

static int DirExists(const char *path) {
    DWORD dwAttrib = GetFileAttributesA(path);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    char appDir[MAX_PATH];
    GetModuleFileNameA(NULL, appDir, MAX_PATH);
    char *lastBackslash = strrchr(appDir, '\\');
    if (lastBackslash) {
        *lastBackslash = '\0';
    }

    SetCurrentDirectoryA(appDir);

    // Check if Node.js is available on PATH
    char checkNodeCmd[MAX_PATH];
    DWORD exitCode = 1;
    HANDLE hOutRead, hOutWrite;
    SECURITY_ATTRIBUTES sa;
    sa.nLength = sizeof(SECURITY_ATTRIBUTES);
    sa.bInheritHandle = TRUE;
    sa.lpSecurityDescriptor = NULL;

    STARTUPINFOA si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags |= STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;
    ZeroMemory(&pi, sizeof(pi));

    // Test running "node --version"
    char testCmd[] = "cmd.exe /c node --version";
    if (CreateProcessA(NULL, testCmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, appDir, &si, &pi)) {
        WaitForSingleObject(pi.hProcess, 3000);
        GetExitCodeProcess(pi.hProcess, &exitCode);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    }

    if (exitCode != 0) {
        int choice = MessageBoxA(
            NULL,
            "Node.js (LTS) is required to run OmniCode Desktop Agent, but was not detected on your system.\n\n"
            "Would you like OmniCode to open the official Node.js installer download page?",
            "OmniCode - Node.js Required",
            MB_YESNO | MB_ICONINFORMATION
        );
        if (choice == IDYES) {
            ShellExecuteA(NULL, "open", "https://nodejs.org/en/download", NULL, NULL, SW_SHOWNORMAL);
        }
        return 1;
    }

    // Check if node_modules exists; if not, run npm install --omit=dev
    char nodeModulesPath[MAX_PATH];
    snprintf(nodeModulesPath, MAX_PATH, "%s\\node_modules", appDir);
    if (!DirExists(nodeModulesPath)) {
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&pi, sizeof(pi));
        char installCmd[] = "cmd.exe /c npm install --omit=dev";
        if (CreateProcessA(NULL, installCmd, NULL, NULL, FALSE, 0, NULL, appDir, &si, &pi)) {
            WaitForSingleObject(pi.hProcess, 60000);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
        }
    }

    // Launch server in background
    char startServerCmd[MAX_PATH * 2];
    if (FileExists("dist\\server.cjs")) {
        snprintf(startServerCmd, sizeof(startServerCmd), "cmd.exe /c set NODE_ENV=production&& node dist\\server.cjs");
    } else if (FileExists("server.cjs")) {
        snprintf(startServerCmd, sizeof(startServerCmd), "cmd.exe /c set NODE_ENV=production&& node server.cjs");
    } else {
        snprintf(startServerCmd, sizeof(startServerCmd), "cmd.exe /c npm start");
    }

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags |= STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;
    ZeroMemory(&pi, sizeof(pi));

    if (!CreateProcessA(NULL, startServerCmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, appDir, &si, &pi)) {
        MessageBoxA(NULL, "Failed to launch OmniCode server process.", "OmniCode Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    // Wait 1.5 seconds for port 3000 to listen, then open default web browser
    Sleep(1500);
    ShellExecuteA(NULL, "open", "http://localhost:3000", NULL, NULL, SW_SHOWNORMAL);

    return 0;
}
