@echo off
setlocal

echo ==================================================
echo    USM Evently - launching development server
echo ==================================================
echo.

REM 1. Install dependencies on first run
if not exist "node_modules\" (
    echo Installing dependencies ^(first run^)...
    call npm install
    if errorlevel 1 goto :error
)

REM 2. Make sure environment variables are configured
if not exist ".env" (
    echo.
    echo [!] No .env file found - creating one from .env.example
    copy ".env.example" ".env" >nul
    echo [!] Open .env and set DATABASE_URL and NEXTAUTH_SECRET, then run start.bat again.
    echo.
    pause
    exit /b 1
)

REM 3. Generate the Prisma client
echo Generating Prisma client...
call npx prisma generate
if errorlevel 1 goto :error

REM 4. Start the Next.js dev server (http://localhost:3000)
echo.
echo Starting USM Evently at http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm run dev
goto :eof

:error
echo.
echo [X] Something went wrong - check the messages above.
pause
exit /b 1
