$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $PSScriptRoot "..\\backups"
$resolvedBackupDir = Resolve-Path $backupDir -ErrorAction SilentlyContinue

if (-not $resolvedBackupDir) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    $resolvedBackupDir = Resolve-Path $backupDir
}

$pgDump = $env:PG_DUMP_PATH
if (-not $pgDump) {
    $pgDump = "pg_dump"
}

$database = if ($env:VOLTMART_DB_NAME) { $env:VOLTMART_DB_NAME } else { "voltmart" }
$user = if ($env:VOLTMART_DB_USER) { $env:VOLTMART_DB_USER } else { "postgres" }
$host = if ($env:VOLTMART_DB_HOST) { $env:VOLTMART_DB_HOST } else { "localhost" }
$port = if ($env:VOLTMART_DB_PORT) { $env:VOLTMART_DB_PORT } else { "5433" }
$outputFile = Join-Path $resolvedBackupDir "voltmart-$timestamp.sql"

Write-Host "Creating PostgreSQL backup at $outputFile"
& $pgDump "-h" $host "-p" $port "-U" $user "-d" $database "-f" $outputFile

if ($LASTEXITCODE -ne 0) {
    throw "Backup failed with exit code $LASTEXITCODE"
}

Write-Host "Backup completed successfully."
