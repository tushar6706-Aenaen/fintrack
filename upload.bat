@echo off
setlocal enabledelayedexpansion
echo ^> Fixing GitHub Contributions...

REM Show current config
echo    -^> Current Git Configuration:
echo       Name: 
git config user.name
echo       Email: 
git config user.email
echo.

REM Email
set /p github_email="Enter your GitHub email (or press Enter to skip): "
IF NOT "%github_email%"=="" (
    git config --global user.email "%github_email%"
    echo    -^> Updated email to: %github_email%
)

REM Username
set /p github_name="Enter your GitHub username (or press Enter to skip): "
IF NOT "%github_name%"=="" (
    git config --global user.name "%github_name%"
    echo    -^> Updated name to: %github_name%
)

echo.
echo    -^> Checking repository status...
git remote -v
IF %ERRORLEVEL% NEQ 0 (
    echo    -^> No remote repository found!
    set /p repo_url="Enter your GitHub repository URL: "
    git remote add origin %repo_url%
)

REM Branch
FOR /F "tokens=*" %%i IN ('git branch --show-current') DO SET current_branch=%%i
IF "%current_branch%"=="" (
    echo    -^> No branch detected, switching to main...
    git checkout -b main 2>nul || git checkout main
) ELSE (
    echo    -^> Current branch: %current_branch%
    IF NOT "%current_branch%"=="main" (
        echo    -^> Switching to main branch...
        git checkout -b main 2>nul || git checkout main
    )
)

REM Commit if changes
git status --porcelain | findstr /r /c:"." >nul
IF %ERRORLEVEL% EQU 0 (
    echo    -^> You have uncommitted changes. Committing them now...
    git add .
    git commit -m "Fix: Update repository structure and configurations"
)

REM Push
echo    -^> Pushing to main branch...
git push -u origin main