@echo off
echo ==========================================
echo      GigaPrice Deployment Recovery
echo ==========================================

REM Attempt to find git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git command not found in PATH.
    echo Searching for Git...
    if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files\Git\cmd"
    if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd\git.exe" set "PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Git\cmd"
    if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "PATH=%PATH%;C:\Program Files (x86)\Git\cmd"
)

git --version >nul 2>nul
if %errorlevel% neq 0 (
    echo [FATAL] Git is definitely not found. Please install Git for Windows.
    pause
    exit /b 1
)

echo [INFO] Git found. Proceeding with deployment.

if not exist .git (
    echo [INFO] Initializing .git...
    git init
    git checkout -b main
    git remote add origin https://github.com/matteohrq3842-stack/GigaPricevmax
)

echo [INFO] Adding files...
git add .
echo [INFO] Committing...
git commit -m "chore: V3 Update (Docs + Admin Refactor)"
echo [INFO] Pushing...
git push -f origin main

echo [SUCCESS] Done.
pause
