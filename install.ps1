# Night Circuit - install for Claude on Windows.
# Points Claude Code at this folder so every session loads the theme.
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File install.ps1
$ErrorActionPreference = 'Stop'

$modDir   = $PSScriptRoot
$claude   = Join-Path $env:USERPROFILE '.claude'
$settings = Join-Path $claude 'settings.json'

if (-not (Test-Path (Join-Path $modDir '.claude-plugin\plugin.json'))) {
    throw "This script must stay inside the night-circuit folder (no .claude-plugin\plugin.json next to it)."
}

New-Item -ItemType Directory -Force -Path $claude | Out-Null

if (Test-Path $settings) {
    $backup = "$settings.bak-before-night-circuit"
    if (-not (Test-Path $backup)) { Copy-Item $settings $backup }
    $raw = Get-Content -Raw -Path $settings
    if ([string]::IsNullOrWhiteSpace($raw)) { $data = New-Object PSObject } else { $data = $raw | ConvertFrom-Json }
} else {
    $data = New-Object PSObject
}

if (-not ($data.PSObject.Properties.Name -contains 'env') -or $null -eq $data.env) {
    $data | Add-Member -NotePropertyName env -NotePropertyValue (New-Object PSObject) -Force
}

# Keep any plugin folders already listed; add this one once.
$dirs = @()
if ($data.env.PSObject.Properties.Name -contains 'CLAUDE_CODE_PLUGIN_DIRS') {
    $dirs = @($data.env.CLAUDE_CODE_PLUGIN_DIRS -split ';' | Where-Object { $_ -ne '' })
}
if ($dirs -notcontains $modDir) { $dirs += $modDir }

$data.env | Add-Member -NotePropertyName CLAUDE_CODE_PLUGIN_DIRS -NotePropertyValue ($dirs -join ';') -Force
$data.env | Add-Member -NotePropertyName CLAUDE_CODE_PLUGIN_DIR_WATCH -NotePropertyValue '1' -Force

# Write UTF-8 without a byte-order mark; Claude Code refuses JSON that starts with one.
$json = $data | ConvertTo-Json -Depth 32
[System.IO.File]::WriteAllText($settings, $json + "`n", (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Night Circuit installed."
Write-Host "  Theme folder : $modDir"
Write-Host "  Settings file: $settings"
Write-Host "Quit Claude completely and open it again to see the theme."
