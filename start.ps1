# NeuroMate Start Script
# Starts both frontend and backend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting NeuroMate Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "`n[1/2] Starting Backend Server..." -ForegroundColor Yellow
$BackendDir = Join-Path $ScriptDir "backend"

# Use system Python with uvicorn module
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -WindowStyle Normal
Write-Host "   Backend started at http://127.0.0.1:8000" -ForegroundColor Green

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n[2/2] Starting Frontend Server..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ScriptDir "frontend"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm run dev" -WindowStyle Normal
Write-Host "   Frontend started at http://localhost:5173" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   NeuroMate is now running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nBackend API: http://127.0.0.1:8000"
Write-Host "Frontend UI: http://localhost:5173"
Write-Host "`nTo stop the servers, run: .\stop.ps1" -ForegroundColor Yellow
