@echo off
echo ===== HETICVerse Git Cleanup Script =====
echo.

echo Step 1: Removing Claude application files from project directory...
mkdir ..\ClaudeAppFiles 2>nul
move claude.exe ..\ClaudeAppFiles\ 2>nul
move *.dll ..\ClaudeAppFiles\ 2>nul
move *.pak ..\ClaudeAppFiles\ 2>nul
move *.dat ..\ClaudeAppFiles\ 2>nul
move *.bin ..\ClaudeAppFiles\ 2>nul
move *.json ..\ClaudeAppFiles\ 2>nul
move resources ..\ClaudeAppFiles\ 2>nul
move locales ..\ClaudeAppFiles\ 2>nul
move squirrel.exe ..\ClaudeAppFiles\ 2>nul
move Squirrel-UpdateSelf.log ..\ClaudeAppFiles\ 2>nul
echo Done!
echo.

echo Step 2: Cleaning up temporary directories...
if exist HETICVerse_fresh\ (
  echo Moving HETICVerse_fresh directory out of the repository...
  mkdir ..\HETICVerse_fresh 2>nul
  xcopy /E /I /Y HETICVerse_fresh\* ..\HETICVerse_fresh\ 2>nul
  rmdir /S /Q HETICVerse_fresh 2>nul
)

if exist HETICVerse_new\ (
  echo Moving HETICVerse_new directory out of the repository...
  mkdir ..\HETICVerse_new 2>nul
  xcopy /E /I /Y HETICVerse_new\* ..\HETICVerse_new\ 2>nul
  rmdir /S /Q HETICVerse_new 2>nul
)

if exist temp_repo\ (
  echo Moving temp_repo directory out of the repository...
  mkdir ..\temp_repo 2>nul
  xcopy /E /I /Y temp_repo\* ..\temp_repo\ 2>nul
  rmdir /S /Q temp_repo 2>nul
)
echo Done!
echo.

echo Step 3: Updating .gitignore file...
type .gitignore
echo.

echo Step 4: Checking git status...
git status
echo.

echo ===== Cleanup Complete =====
echo.
echo Please check the status above to ensure all unwanted files are gone.
echo If the status shows clean, your git issues should be resolved!
echo.
pause
