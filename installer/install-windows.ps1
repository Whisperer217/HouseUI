# Guardian AI - Windows Installer
# One-click installation script for Windows

param(
    [string]$InstallPath = "$env:LOCALAPPDATA\GuardianAI"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Guardian AI - Windows Installer" -ForegroundColor Cyan
Write-Host "   Your Family's AI Assistant" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This installer needs to run as Administrator" -ForegroundColor Yellow
    Write-Host "   Please right-click and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Step 1: Check Node.js
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Cyan
$nodeVersion = $null
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
}

if (-not $nodeVersion) {
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    
    # Download Node.js installer
    $nodeUrl = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    Write-Host "  Downloading Node.js..."
    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
    
    Write-Host "  Installing Node.js..."
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeInstaller`" /quiet /norestart"
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ Node.js installed successfully" -ForegroundColor Green
}

Write-Host ""

# Step 2: Check Ollama
Write-Host "[2/6] Checking Ollama..." -ForegroundColor Cyan
$ollamaVersion = $null
try {
    $ollamaVersion = ollama --version 2>$null
    if ($ollamaVersion) {
        Write-Host "✓ Ollama found: $ollamaVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Ollama not found" -ForegroundColor Red
}

if (-not $ollamaVersion) {
    Write-Host "Installing Ollama..." -ForegroundColor Yellow
    
    # Download Ollama installer
    $ollamaUrl = "https://ollama.ai/download/OllamaSetup.exe"
    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    
    Write-Host "  Downloading Ollama..."
    Invoke-WebRequest -Uri $ollamaUrl -OutFile $ollamaInstaller
    
    Write-Host "  Installing Ollama..."
    Start-Process -FilePath $ollamaInstaller -Wait -ArgumentList "/S"
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✓ Ollama installed successfully" -ForegroundColor Green
}

Write-Host ""

# Step 3: Download DeepSeek R1 Model
Write-Host "[3/6] Checking DeepSeek R1 model..." -ForegroundColor Cyan

$ollamaModels = ollama list 2>$null | Select-String "deepseek-r1:8b"
if ($ollamaModels) {
    Write-Host "✓ DeepSeek R1 8B model already installed" -ForegroundColor Green
} else {
    Write-Host "Downloading DeepSeek R1 8B model (this may take a while)..." -ForegroundColor Yellow
    ollama pull deepseek-r1:8b
    Write-Host "✓ DeepSeek R1 8B model downloaded" -ForegroundColor Green
}

Write-Host ""

# Step 4: Create Installation Directory
Write-Host "[4/6] Creating installation directory..." -ForegroundColor Cyan

if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Host "✓ Created: $InstallPath" -ForegroundColor Green
} else {
    Write-Host "✓ Directory exists: $InstallPath" -ForegroundColor Green
}

Write-Host ""

# Step 5: Install Guardian AI
Write-Host "[5/6] Installing Guardian AI..." -ForegroundColor Cyan

# Download Guardian AI package (in production, this would be from a release URL)
$guardianUrl = "https://github.com/Whisperer217/HouseUI/archive/refs/heads/main.zip"
$guardianZip = "$env:TEMP\guardian-ai.zip"

Write-Host "  Downloading Guardian AI..."
Invoke-WebRequest -Uri $guardianUrl -OutFile $guardianZip

Write-Host "  Extracting files..."
Expand-Archive -Path $guardianZip -DestinationPath $InstallPath -Force

# Move files from subdirectory to install path
$subDir = Get-ChildItem -Path $InstallPath -Directory | Select-Object -First 1
if ($subDir) {
    Get-ChildItem -Path $subDir.FullName -Recurse | Move-Item -Destination $InstallPath -Force
    Remove-Item -Path $subDir.FullName -Recurse -Force
}

Write-Host "  Installing dependencies..."
Set-Location $InstallPath
npm install --silent

Write-Host "  Installing backend dependencies..."
Set-Location "$InstallPath\backend"
npm install --silent

Write-Host "✓ Guardian AI installed successfully" -ForegroundColor Green
Write-Host ""

# Step 6: Create Desktop Shortcut
Write-Host "[6/6] Creating shortcuts..." -ForegroundColor Cyan

# Create start script
$startScript = @"
@echo off
title Guardian AI
echo Starting Guardian AI...
echo.

REM Start Ollama service
start /B ollama serve

REM Wait for Ollama to start
timeout /t 3 /nobreak >nul

REM Start backend
cd /d "$InstallPath\backend"
start "Guardian AI Backend" cmd /k "npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
cd /d "$InstallPath"
start "Guardian AI" cmd /k "npm run dev"

echo.
echo Guardian AI is starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open Guardian AI in your browser...
pause >nul

start http://localhost:5173

exit
"@

$startScriptPath = "$InstallPath\start-guardian-ai.bat"
$startScript | Out-File -FilePath $startScriptPath -Encoding ASCII

# Create desktop shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Guardian AI.lnk")
$Shortcut.TargetPath = $startScriptPath
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.IconLocation = "$InstallPath\public\favicon.ico"
$Shortcut.Description = "Guardian AI - Your Family's AI Assistant"
$Shortcut.Save()

Write-Host "✓ Desktop shortcut created" -ForegroundColor Green
Write-Host ""

# Installation Complete
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Guardian AI has been installed to:" -ForegroundColor Cyan
Write-Host "  $InstallPath" -ForegroundColor White
Write-Host ""
Write-Host "To start Guardian AI:" -ForegroundColor Cyan
Write-Host "  1. Double-click 'Guardian AI' on your desktop" -ForegroundColor White
Write-Host "  2. Or run: $startScriptPath" -ForegroundColor White
Write-Host ""
Write-Host "First-time setup:" -ForegroundColor Cyan
Write-Host "  1. Enter your license key (or start a free trial)" -ForegroundColor White
Write-Host "  2. Wait for the AI model to load (first time only)" -ForegroundColor White
Write-Host "  3. Start chatting with your AI assistant!" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Visit: https://guardian-ai.com/support" -ForegroundColor Cyan
Write-Host ""

# Ask to start now
$start = Read-Host "Would you like to start Guardian AI now? (Y/N)"
if ($start -eq "Y" -or $start -eq "y") {
    Write-Host ""
    Write-Host "Starting Guardian AI..." -ForegroundColor Cyan
    Start-Process -FilePath $startScriptPath
} else {
    Write-Host ""
    Write-Host "You can start Guardian AI anytime from your desktop shortcut." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Thank you for choosing Guardian AI!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit installer"

