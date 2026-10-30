# NeuroMate Stop Script
# Stops both frontend and backend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Stopping NeuroMate Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Stop Backend (uvicorn processes)
Write-Host "`n[1/2] Stopping Backend Server..." -ForegroundColor Yellow
$uvicornProcesses = Get-Process -Name "uvicorn" -ErrorAction SilentlyContinue
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*uvicorn*" -or $_.MainWindowTitle -like "*uvicorn*"
}

if ($uvicornProcesses) {
    Stop-Process -Name "uvicorn" -Force -ErrorAction SilentlyContinue
    Write-Host "   Uvicorn processes stopped" -ForegroundColor Green
}

# Stop any Python processes running uvicorn on port 8000
$netstatOutput = netstat -ano | Select-String ":8000" | Select-String "LISTENING"
if ($netstatOutput) {
    foreach ($line in $netstatOutput) {
        $parts = $line -split '\s+'
        $processId = $parts[-1]
        if ($processId -match '^\d+$') {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "   Stopped process on port 8000 (PID: $processId)" -ForegroundColor Green
            } catch {
                Write-Host "   Could not stop process $processId" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "   No backend process found on port 8000" -ForegroundColor Gray
}

# Stop Frontend (node/vite processes on port 5173)
Write-Host "`n[2/2] Stopping Frontend Server..." -ForegroundColor Yellow
$netstatOutput = netstat -ano | Select-String ":5173" | Select-String "LISTENING"
if ($netstatOutput) {
    foreach ($line in $netstatOutput) {
        $parts = $line -split '\s+'
        $processId = $parts[-1]
        if ($processId -match '^\d+$') {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "   Stopped process on port 5173 (PID: $processId)" -ForegroundColor Green
            } catch {
                Write-Host "   Could not stop process $processId" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "   No frontend process found on port 5173" -ForegroundColor Gray
}

# Also try to stop node processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Stopping Node.js processes..." -ForegroundColor Yellow
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "   Node.js processes stopped" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   NeuroMate servers stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
