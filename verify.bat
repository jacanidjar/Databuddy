@echo off
REM ============================================================
REM Databuddy - Verify Script (Lint, Types, Tests)
REM ============================================================
REM Use this script to verify code before submitting a PR
REM ============================================================

setlocal enabledelayedexpansion

set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%           DATABUDDY - VERIFICATION SCRIPT                  %RESET%
echo %CYAN%============================================================%RESET%
echo.

set ERRORS=0

REM ============================================================
REM Step 1: Lint Check
REM ============================================================
echo %YELLOW%[1/3] Running lint check...%RESET%

call bun run lint
if %ERRORLEVEL% NEQ 0 (
    echo       %RED%Lint check FAILED%RESET%
    set /a ERRORS+=1
) else (
    echo       %GREEN%Lint check PASSED%RESET%
)

echo.

REM ============================================================
REM Step 2: Type Check
REM ============================================================
echo %YELLOW%[2/3] Running type check...%RESET%

call bun run check-types
if %ERRORLEVEL% NEQ 0 (
    echo       %RED%Type check FAILED%RESET%
    set /a ERRORS+=1
) else (
    echo       %GREEN%Type check PASSED%RESET%
)

echo.

REM ============================================================
REM Step 3: Unit Tests
REM ============================================================
echo %YELLOW%[3/3] Running unit tests...%RESET%

call bun test apps/uptime/src/alarm-trigger.test.ts
if %ERRORLEVEL% NEQ 0 (
    echo       %RED%Tests FAILED%RESET%
    set /a ERRORS+=1
) else (
    echo       %GREEN%Tests PASSED%RESET%
)

echo.
echo %CYAN%============================================================%RESET%

if %ERRORS% EQU 0 (
    echo %GREEN%All checks passed! Ready to submit PR.%RESET%
) else (
    echo %RED%!ERRORS! check(s) failed. Fix issues before submitting.%RESET%
)

echo %CYAN%============================================================%RESET%
echo.

pause
