# Clean .next and start dev server so the browser gets fresh chunks.
# Run from repo root: .\scripts\dev-clean.ps1
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Starting Next.js dev server... Open http://localhost:3000 in a NEW tab (or hard refresh Ctrl+Shift+R)"
npm run dev
