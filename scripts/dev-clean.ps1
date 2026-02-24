# Clean .next, free port 3000, and start dev server.
# Run from repo root: .\scripts\dev-clean.ps1
# Then: close ALL tabs with localhost:3000, open ONE new tab to http://localhost:3000

$port = 3000
$existing = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($existing) {
  foreach ($pid in $existing) {
    Write-Host "Stopping process on port $port (PID $pid)"
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 2
}

Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Starting Next.js on http://localhost:$port - wait for 'Ready', then open a NEW tab (no cached tabs)."
npm run dev -- -p $port
