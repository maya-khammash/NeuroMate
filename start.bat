@echo off
REM NeuroMate Start Script (Batch wrapper)
REM Runs the PowerShell start script

echo ========================================
echo    Starting NeuroMate Application
echo ========================================

powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"
