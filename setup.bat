@echo off
title Installing UGL-OPE Platform...
echo ========================================================
echo         URBAN GAZ LIMITED - OPE PLATFORM SETUP          
echo ========================================================
echo Installing desktop software to your PC...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$appDir = '$env:LOCALAPPDATA\UGL-OPE'; New-Item -ItemType Directory -Force -Path $appDir | Out-Null; $srcExe = Join-Path '%~dp0' 'UGL-OPE.exe'; $destExe = Join-Path $appDir 'UGL-OPE.exe'; if (Test-Path $srcExe) { Copy-Item -Path $srcExe -Destination $destExe -Force }; $desktop = [Environment]::GetFolderPath('Desktop'); $shortcutPath = Join-Path $desktop 'UGL-OPE.lnk'; $ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut($shortcutPath); $sc.TargetPath = $destExe; $sc.WorkingDirectory = $appDir; $sc.Save(); Write-Host 'Installation Complete! Desktop shortcut created successfully.' -ForegroundColor Green;"

echo.
echo Launching UGL-OPE Desktop Software...
start "" "%LOCALAPPDATA%\UGL-OPE\UGL-OPE.exe"
timeout /t 3
