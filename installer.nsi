; OmniCode Professional NSIS Installer Script
; Target: Native Windows x64 (Windows 10 / 11 / 8.1)

Unicode true
!define PRODUCT_NAME "OmniCode Desktop Agent"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "retrorepair"
!define PRODUCT_WEB_SITE "https://github.com/retrorepair/omnicode"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\OmniCode.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKCU"

SetCompressor /SOLID lzma

; Request user-level execution so it runs immediately without UAC elevation
RequestExecutionLevel user

; Setup Modern UI
!include "MUI2.nsh"

!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Installer Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page with option to run OmniCode immediately
!define MUI_FINISHPAGE_RUN "$INSTDIR\OmniCode.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch OmniCode Desktop Agent"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Language
!insertmacro MUI_LANGUAGE "English"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "dist-installer\OmniCode-Setup-1.0.0-x64.exe"
InstallDir "$LOCALAPPDATA\Programs\OmniCode"
InstallDirRegKey HKCU "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    SetOverwrite on

    ; Application Executable
    File "dist-installer\OmniCode.exe"
    File "dist-installer\run-omnicode.bat"
    File "dist-installer\install-omnicode.cmd"
    File "package.json"

    ; Dist folder (web app bundle + server)
    SetOutPath "$INSTDIR\dist"
    File /r "dist\*.*"

    ; Shortcuts
    SetOutPath "$INSTDIR"
    CreateDirectory "$SMPROGRAMS\OmniCode"
    CreateShortCut "$SMPROGRAMS\OmniCode\OmniCode.lnk" "$INSTDIR\OmniCode.exe" "" "$INSTDIR\OmniCode.exe" 0
    CreateShortCut "$SMPROGRAMS\OmniCode\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
    CreateShortCut "$DESKTOP\OmniCode.lnk" "$INSTDIR\OmniCode.exe" "" "$INSTDIR\OmniCode.exe" 0
SectionEnd

Section -AdditionalIcons
    WriteIniStr "$INSTDIR\${PRODUCT_NAME}.url" "InternetShortcut" "URL" "${PRODUCT_WEB_SITE}"
    CreateShortCut "$SMPROGRAMS\OmniCode\GitHub Repository.lnk" "$INSTDIR\${PRODUCT_NAME}.url"
SectionEnd

Section -Post
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    WriteRegStr HKCU "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\OmniCode.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\Uninstall.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\OmniCode.exe"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
    WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

Function un.onUninstSuccess
    HideWindow
    MessageBox MB_ICONINFORMATION|MB_OK "$(^Name) was successfully removed from your computer."
FunctionEnd

Function un.onInit
    MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "Are you sure you want to completely remove $(^Name) and all of its components?" IDYES +2
    Abort
FunctionEnd

Section Uninstall
    Delete "$DESKTOP\OmniCode.lnk"
    Delete "$SMPROGRAMS\OmniCode\OmniCode.lnk"
    Delete "$SMPROGRAMS\OmniCode\Uninstall.lnk"
    Delete "$SMPROGRAMS\OmniCode\GitHub Repository.lnk"
    RMDir "$SMPROGRAMS\OmniCode"

    RMDir /r "$INSTDIR\dist"
    RMDir /r "$INSTDIR\node_modules"
    Delete "$INSTDIR\OmniCode.exe"
    Delete "$INSTDIR\run-omnicode.bat"
    Delete "$INSTDIR\install-omnicode.cmd"
    Delete "$INSTDIR\package.json"
    Delete "$INSTDIR\${PRODUCT_NAME}.url"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"

    DeleteRegKey HKCU "${PRODUCT_DIR_REGKEY}"
    DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
    SetAutoClose true
SectionEnd
