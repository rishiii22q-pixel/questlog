@echo off
echo ============================
echo  Starting QuestLog Frontend
echo ============================
echo.
echo Frontend will run on: http://localhost:5173
echo.
cd /d "%~dp0frontend"
call npm run dev
pause
