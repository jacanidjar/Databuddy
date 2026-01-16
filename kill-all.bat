@echo off
REM ============================================================
REM Databuddy - Kill All Processes
REM ============================================================
REM Kills all Node/Bun processes and frees up common dev ports
REM ============================================================

setlocal enabledelayedexpansion

set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%           DATABUDDY - KILL ALL PROCESSES                   %RESET%
echo %CYAN%============================================================%RESET%
echo.

echo %YELLOW%Killing Node.js processes...%RESET%
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   %GREEN%Done!%RESET%
) else (
    echo   No Node.js processes found
)

echo %YELLOW%Killing Bun processes...%RESET%
taskkill /F /IM bun.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   %GREEN%Done!%RESET%
) else (
    echo   No Bun processes found
)

echo.
echo %YELLOW%Checking common development ports...%RESET%

REM Common ports: 3000 (Next.js), 3001 (API), 4000 (Uptime), 5173 (Vite), 8080 (general)
for %%p in (3000 3001 4000 5173 8080) do (
    echo   Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        echo     %YELLOW%Killing PID %%a on port %%p%RESET%
        taskkill /F /PID %%a 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo     %GREEN%Killed!%RESET%
        )
    )
)

echo.
echo %GREEN%All processes killed.%RESET%
echo.
pause
