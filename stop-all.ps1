# ============================================
# PARAR TODOS OS SERVIÇOS
# ============================================

Write-Host ""
Write-Host "[PARAR] Parando todos os servicos..." -ForegroundColor Yellow
Write-Host ""

$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = Get-Location }

# Parar containers Docker
Write-Host "[DOCKER] Parando containers Docker..." -ForegroundColor Yellow
Set-Location $scriptRoot

# Tentar docker compose (versão mais recente) primeiro, depois docker-compose
$useDockerCompose = $false
try {
    $result = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $useDockerCompose = $true
    }
} catch {
    $useDockerCompose = $false
}

if ($useDockerCompose) {
    docker compose down
} else {
    docker-compose down
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Containers Docker parados" -ForegroundColor Green
} else {
    Write-Host "   [AVISO] Erro ao parar containers Docker" -ForegroundColor Yellow
}

Write-Host ""

# Parar processos Node.js
Write-Host "[NODE] Parando processos Node.js..." -ForegroundColor Yellow

$nodeProcesses = Get-Process | Where-Object {
    $_.ProcessName -eq "node" -or 
    $_.ProcessName -eq "tsx" -or
    $_.ProcessName -eq "next"
} -ErrorAction SilentlyContinue

if ($nodeProcesses.Count -gt 0) {
    Write-Host "   Encontrados $($nodeProcesses.Count) processo(s) Node.js" -ForegroundColor Gray
    
    foreach ($proc in $nodeProcesses) {
        try {
            Write-Host "   Parando: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "   [AVISO] Erro ao parar processo $($proc.Id): $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host "   [OK] Processos Node.js parados" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

Write-Host ""

# Verificar portas
Write-Host "[PORTAS] Verificando portas..." -ForegroundColor Yellow

function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

$ports = @(3000, 3001, 3002, 5432, 6379)
$portsInUse = @()

foreach ($port in $ports) {
    if (Test-Port -Port $port) {
        $portsInUse += $port
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host "   [AVISO] Portas ainda em uso: $($portsInUse -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "   [OK] Todas as portas estao livres" -ForegroundColor Green
}

Write-Host ""
Write-Host "[OK] Servicos parados" -ForegroundColor Green
Write-Host ""

