@echo off
REM ============================================================
REM Databuddy - Complete Development Script
REM ============================================================
REM Options:
REM   1. Full Restart (kill, install, verify, start)
REM   2. Kill All Processes
REM   3. Install Dependencies
REM   4. Verify Code (lint, types, tests)
REM   5. Start Dev Server
REM   6. Run Tests Only
REM ============================================================

setlocal enabledelayedexpansion

set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

:MENU
cls
echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%           DATABUDDY - DEVELOPMENT SCRIPT                   %RESET%
echo %CYAN%============================================================%RESET%
echo.
echo   %GREEN%1%RESET% - Full Restart (kill, install, verify, start)
echo   %GREEN%2%RESET% - Kill All Processes
echo   %GREEN%3%RESET% - Install Dependencies
echo   %GREEN%4%RESET% - Verify Code (lint, types, tests)
echo   %GREEN%5%RESET% - Start Dev Server
echo   %GREEN%6%RESET% - Run Tests Only
echo   %GREEN%7%RESET% - Force Reinstall Dependencies (Fixes corruption)
echo   %GREEN%8%RESET% - Update Database (db:push)
echo   %GREEN%0%RESET% - Exit
echo.
echo %CYAN%============================================================%RESET%
echo.

set /p CHOICE="Select option [1-8, 0 to exit]: "

if "%CHOICE%"=="1" goto FULL_RESTART
if "%CHOICE%"=="2" goto KILL_ALL
if "%CHOICE%"=="3" goto INSTALL
if "%CHOICE%"=="4" goto VERIFY
if "%CHOICE%"=="5" goto START_DEV
if "%CHOICE%"=="6" goto RUN_TESTS
if "%CHOICE%"=="7" goto FORCE_INSTALL
if "%CHOICE%"=="8" goto UPDATE_DB
if "%CHOICE%"=="0" goto EXIT

echo %RED%Invalid option!%RESET%
timeout /t 2 >nul
goto MENU

REM ============================================================
REM KILL ALL PROCESSES
REM ============================================================
:KILL_ALL
echo.
echo %YELLOW%Killing all development processes...%RESET%
echo.

echo   Killing Node.js processes...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   %GREEN%Node.js killed%RESET%
) else (
    echo   No Node.js processes
)

echo   Killing Bun processes...
taskkill /F /IM bun.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo   %GREEN%Bun killed%RESET%
) else (
    echo   No Bun processes
)

echo.
echo   Freeing development ports...
for %%p in (3000 3001 4000 5173 8080) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        taskkill /F /PID %%a 2>nul
        if !ERRORLEVEL! EQU 0 (
            echo   %GREEN%Freed port %%p (PID %%a)%RESET%
        )
    )
)

echo.
echo %GREEN%Done!%RESET%
echo.
pause
goto MENU

REM ============================================================
REM CHECK BUN INSTALLATION
REM ============================================================
:CHECK_BUN
where bun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%Bun not found. Installing...%RESET%
    powershell -Command "irm bun.sh/install.ps1 | iex"
    
    REM Check if installed manually because errorlevel might be unreliable
    if exist "%USERPROFILE%\.bun\bin\bun.exe" (
        set "PATH=%USERPROFILE%\.bun\bin;%PATH%"
        echo %GREEN%Bun installed and added to PATH!%RESET%
    ) else (
        echo %RED%Failed to verify Bun installation!%RESET%
        echo Visit: https://bun.sh/docs/installation
        pause
        goto MENU
    )
)
exit /b 0

REM ============================================================
REM INSTALL DEPENDENCIES
REM ============================================================
:INSTALL
echo.
echo %YELLOW%Installing dependencies...%RESET%
echo.

call :CHECK_BUN

call bun install
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Installation failed!%RESET%
    echo Cleaning and retrying...
    if exist node_modules rmdir /s /q node_modules 2>nul
    call bun install
)

echo.
echo %GREEN%Dependencies installed!%RESET%
echo.
pause
goto MENU

REM ============================================================
REM FORCE REINSTALL DEPENDENCIES
REM ============================================================
:FORCE_INSTALL
echo.
echo %YELLOW%Force reinstalling dependencies...%RESET%
echo %YELLOW%This fixes 'corrupted node_modules' errors.%RESET%
echo.

call :CHECK_BUN

echo   Cleaning main node_modules...
if exist node_modules rmdir /s /q node_modules 2>nul
echo   Cleaning lockfile...
if exist bun.lockb del /f /q bun.lockb 2>nul
if exist bun.lock del /f /q bun.lock 2>nul

echo.
echo   Running bun install --force...
call bun install --force

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo %RED%Force install failed!%RESET%
) else (
    echo.
    echo %GREEN%Dependencies reinstalled successfully!%RESET%
)
echo.
pause
goto MENU

REM ============================================================
REM UPDATE DATABASE
REM ============================================================
:UPDATE_DB
echo.
echo %YELLOW%Updating database schema...%RESET%
echo.

call :CHECK_BUN

call bun run db:push

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo %RED%Database update failed!%RESET%
) else (
    echo.
    echo %GREEN%Database updated successfully!%RESET%
)
echo.
pause
goto MENU

REM ============================================================
REM VERIFY CODE
REM ============================================================
:VERIFY
echo.
echo %YELLOW%Running verification checks...%RESET%
echo.

call :CHECK_BUN

set ERRORS=0

echo %CYAN%[1/3] Lint check...%RESET%
call bun run lint
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Lint FAILED%RESET%
    set /a ERRORS+=1
) else (
    echo %GREEN%Lint PASSED%RESET%
)

echo.
echo %CYAN%[2/3] Type check...%RESET%
call bun run check-types
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Types FAILED%RESET%
    set /a ERRORS+=1
) else (
    echo %GREEN%Types PASSED%RESET%
)

echo.
echo %CYAN%[3/3] Unit tests...%RESET%
call bun test apps/uptime/src/alarm-trigger.test.ts
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Tests FAILED%RESET%
    set /a ERRORS+=1
) else (
    echo %GREEN%Tests PASSED%RESET%
)

echo.
echo %CYAN%============================================================%RESET%
if %ERRORS% EQU 0 (
    echo %GREEN%All checks passed! Ready for PR.%RESET%
) else (
    echo %RED%%ERRORS% check(s) failed.%RESET%
)
echo %CYAN%============================================================%RESET%
echo.
pause
goto MENU

REM ============================================================
REM RUN TESTS ONLY
REM ============================================================
:RUN_TESTS
echo.
echo %YELLOW%Running unit tests...%RESET%
echo.

call :CHECK_BUN

call bun test apps/uptime/src/alarm-trigger.test.ts

echo.
pause
goto MENU

REM ============================================================
REM START DEV SERVER
REM ============================================================
:START_DEV
echo.
echo %YELLOW%Starting development server...%RESET%
echo %CYAN%Press Ctrl+C to stop%RESET%
echo.

call :CHECK_BUN

call bun run dev

echo.
echo %YELLOW%Server stopped.%RESET%
pause
goto MENU

REM ============================================================
REM FULL RESTART
REM ============================================================
:FULL_RESTART
echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%           FULL RESTART                                     %RESET%
echo %CYAN%============================================================%RESET%
echo.

echo %YELLOW%[1/5] Killing processes...%RESET%
taskkill /F /IM node.exe 2>nul
taskkill /F /IM bun.exe 2>nul
for %%p in (3000 3001 4000 5173 8080) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        taskkill /F /PID %%a 2>nul
    )
)
echo %GREEN%Done%RESET%

echo.
echo %YELLOW%[2/5] Checking Bun...%RESET%
call :CHECK_BUN
echo %GREEN%Done%RESET%

echo.
echo %YELLOW%[3/5] Installing dependencies...%RESET%
call bun install
if %ERRORLEVEL% NEQ 0 (
    echo %RED%Failed! Cleaning...%RESET%
    if exist node_modules rmdir /s /q node_modules 2>nul
    call bun install
)
echo %GREEN%Done%RESET%

echo.
echo %YELLOW%[4/5] Running lint...%RESET%
call bun run lint
echo %GREEN%Done%RESET%

echo.
echo %YELLOW%[5/5] Running type check...%RESET%
call bun run check-types
echo %GREEN%Done%RESET%

echo.
echo %CYAN%============================================================%RESET%
echo %GREEN%Starting development server...%RESET%
echo %CYAN%Press Ctrl+C to stop%RESET%
echo %CYAN%============================================================%RESET%
echo.

call bun run dev

echo.
echo %YELLOW%Server stopped.%RESET%
pause
goto MENU

REM ============================================================
REM EXIT
REM ============================================================
:EXIT
echo.
echo %GREEN%Goodbye!%RESET%
echo.
exit /b 0
