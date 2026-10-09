@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0"
title Veil Client - Fresh vanilla test
echo Veil Client development test - Minecraft 1.21.1 DEMO
echo Fresh profile: no mods, shaders, or resource packs.
echo First run downloads official Minecraft files and may take several minutes.
echo Data and test worlds stay in the data folder beside this starter.
echo.
if not exist "%~dp0veil.exe" (
    echo Missing veil.exe. Extract the complete development bundle first.
    goto failed
)
if not defined VEIL_JAVA set "VEIL_JAVA=%APPDATA%\.minecraft\runtime\java-runtime-delta\windows-x64\bin\java.exe"
if not exist "%VEIL_JAVA%" (
    echo Java 21 was not found in the Minecraft Launcher runtime folder.
    echo Set VEIL_JAVA to the full path of a trusted Java 21 java.exe and retry.
    goto failed
)
"%~dp0veil.exe" java "%VEIL_JAVA%"
if errorlevel 1 goto failed
echo.
echo Press a key to prepare and launch the fresh demo profile, or close this window to cancel.
pause >nul
if not exist "%~dp0data\instances\vanilla-demo\instance.json" (
    "%~dp0veil.exe" init "%~dp0data" vanilla-demo 1.21.1
    if errorlevel 1 goto failed
)
"%~dp0veil.exe" demo "%~dp0data" vanilla-demo --java "%VEIL_JAVA%"
if errorlevel 1 goto failed
echo.
echo Minecraft closed. Tell Codex whether the title screen and demo world opened.
echo Local game logs: "%~dp0data\instances\vanilla-demo\logs"
pause
exit /b 0

:failed
echo.
echo The test could not finish. Keep this window open and tell Codex the error above.
echo Do not disable Windows security or antivirus to run this development build.
pause
exit /b 1
