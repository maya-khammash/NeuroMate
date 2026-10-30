@echo off
REM NeuroMate Stop Script (Batch wrapper)
REM Runs the PowerShell stop script

echo ========================================
echo    Stopping NeuroMate Application
echo ========================================

powershell -ExecutionPolicy Bypass -File "%~dp0stop.ps1"
