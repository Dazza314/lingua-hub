# Looks up the WSL2 IP, sets up port forwarding, and starts the emulator.
# Run from PowerShell as Administrator.

$wslIp = wsl hostname -I | ForEach-Object { $_.Trim() }

Write-Host "WSL2 IP: $wslIp"
Write-Host "Setting up port proxy..."

netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=127.0.0.1 2>$null
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=127.0.0.1 connectport=3000 connectaddress=$wslIp

Write-Host "Starting emulator..."
emulator -avd pixel -gpu swiftshader_indirect
