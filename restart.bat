@echo off
REM ============================================================
REM Databuddy - Complete Restart Script
REM ============================================================
REM This script will:
REM   1. Kill any running Node/Bun processes
REM   2. Clean node_modules caches if needed
REM   3. Install dependencies with Bun
REM   4. Run lint and type checks
REM   5. Start the development server
REM ============================================================

setlocal enabledelayedexpansion

REM Colors for output (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%           DATABUDDY - COMPLETE RESTART SCRIPT              %RESET%
echo %CYAN%============================================================%RESET%
echo.

REM ============================================================
REM Step 1: Kill running processes
REM ============================================================
echo %YELLOW%[1/6] Killing running processes...%RESET%

REM Kill Node.js processes
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo       %GREEN%Node.js processes killed%RESET%
) else (
    echo       No Node.js processes running
)

REM Kill Bun processes
taskkill /F /IM bun.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo       %GREEN%Bun processes killed%RESET%
) else (
    echo       No Bun processes running
)

REM Kill any process on common dev ports
for %%p in (3000 3001 4000 5173 8080) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        taskkill /F /PID %%a 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo       %GREEN%Killed process on port %%p (PID: %%a)%RESET%
        )
    )
)

echo.

REM ============================================================
REM Step 2: Check if Bun is installed
REM ============================================================
echo %YELLOW%[2/6] Checking Bun installation...%RESET%

where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo       %RED%Bun is not installed!%RESET%
    echo.
    echo       %YELLOW%Installing Bun...%RESET%
    powershell -Command "irm bun.sh/install.ps1 | iex"
    
    if exist "%USERPROFILE%\.bun\bin\bun.exe" (
        set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
        echo       %GREEN%Bun installed and added to PATH!%RESET%
    ) else (
        echo       %RED%Failed to install Bun. Please install manually:%RESET%
        echo       https://bun.sh/docs/installation
        echo.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%v in ('bun --version 2^>nul') do (
        echo       %GREEN%Bun v%%v found%RESET%
    )
)

echo.

REM ============================================================
REM Step 3: Install dependencies
REM ============================================================
echo %YELLOW%[3/6] Installing dependencies...%RESET%

call bun install
if %ERRORLEVEL% NEQ 0 (
    echo       %RED%Failed to install dependencies!%RESET%
    echo       Trying to clean and reinstall...
    
    REM Clean bun lockfile cache
    if exist bun.lockb del bun.lockb
    if exist node_modules rmdir /s /q node_modules 2>nul
    
    call bun install
    if %ERRORLEVEL% NEQ 0 (
        echo       %RED%Installation failed. Check for errors above.%RESET%
        pause
        exit /b 1
    )
)
echo       %GREEN%Dependencies installed successfully!%RESET%

echo.

REM ============================================================
REM Step 4: Run lint check
REM ============================================================
echo %YELLOW%[4/6] Running lint check...%RESET%

call bun run lint
if %ERRORLEVEL% NEQ 0 (
    echo       %YELLOW%Lint warnings/errors found. Check output above.%RESET%
    echo       %YELLOW%Continuing anyway...%RESET%
) else (
    echo       %GREEN%Lint check passed!%RESET%
)

echo.

REM ============================================================
REM Step 5: Run type check
REM ============================================================
echo %YELLOW%[5/6] Running type check...%RESET%

call bun run check-types
if %ERRORLEVEL% NEQ 0 (
    echo       %YELLOW%Type errors found. Check output above.%RESET%
    echo       %YELLOW%Continuing anyway...%RESET%
) else (
    echo       %GREEN%Type check passed!%RESET%
)

echo.


echo.
echo %GREEN%Restart complete!%RESET%
echo %YELLOW%You can now run 'bun run dev' to start the server.%RESET%
echo.
pause

