# ============================================
# INICIAR TODOS OS SERVIÇOS
# ============================================
# Este script apenas inicia os serviços:
# - PostgreSQL e Redis (Docker)
# - Backend (API Gateway)
# - Frontend (Admin Panel + Extensão)
# ============================================

param(
    [int]$AdminPort = 3001,
    [int]$ApiGatewayPort = 3000,
    [int]$PolicyServicePort = 3002
)

$ErrorActionPreference = "Stop"
$scriptRoot = $PSScriptRoot
if (-not $scriptRoot) { $scriptRoot = Get-Location }

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "|     INTERMEDIUS COACH - INICIAR SERVICOS                  |" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. INICIAR DOCKER (PostgreSQL e Redis)
# ============================================

Write-Host "[DOCKER] Iniciando PostgreSQL e Redis..." -ForegroundColor Yellow

# Verificar se Docker está rodando
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRO] Docker nao esta rodando. Inicie o Docker Desktop primeiro." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERRO] Docker nao encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se docker-compose.yml existe e não está vazio
$dockerComposePath = Join-Path $scriptRoot "docker-compose.yml"
$needsCreate = $false

if (-not (Test-Path $dockerComposePath)) {
    $needsCreate = $true
    Write-Host "[AVISO] docker-compose.yml nao encontrado. Criando arquivo basico..." -ForegroundColor Yellow
} else {
    $fileContent = Get-Content $dockerComposePath -Raw
    if ([string]::IsNullOrWhiteSpace($fileContent)) {
        $needsCreate = $true
        Write-Host "[AVISO] docker-compose.yml esta vazio. Recriando arquivo..." -ForegroundColor Yellow
    }
}

if ($needsCreate) {
    $dockerComposeContent = @"
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: intermedius-postgres
    environment:
      POSTGRES_USER: intermedius
      POSTGRES_PASSWORD: intermedius
      POSTGRES_DB: intermedius
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U intermedius"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: intermedius-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
"@
    $dockerComposeContent | Out-File -FilePath $dockerComposePath -Encoding UTF8 -NoNewline
    Write-Host "   [OK] docker-compose.yml criado" -ForegroundColor Green
}

# Iniciar containers Docker
Write-Host "   Iniciando containers Docker..." -ForegroundColor Gray
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
    docker compose up -d
} else {
    try {
        docker-compose up -d
    } catch {
        Write-Host "   [ERRO] docker-compose nao encontrado" -ForegroundColor Red
        Write-Host "   Certifique-se de que Docker esta instalado e no PATH" -ForegroundColor Yellow
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] Docker containers iniciados" -ForegroundColor Green
    Start-Sleep -Seconds 3
} else {
    Write-Host "   [ERRO] Falha ao iniciar containers Docker" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# 2. INICIAR BACKEND (API Gateway)
# ============================================

Write-Host "[BACKEND] Iniciando API Gateway (porta $ApiGatewayPort)..." -ForegroundColor Yellow

try {
    # Abrir em nova janela CMD visível
    $backendTitle = "Backend - API Gateway"
    $backendCmd = "cd /d `"$scriptRoot`" && title $backendTitle && pnpm dev:server"
    Start-Process cmd.exe -ArgumentList "/k", $backendCmd
    Write-Host "   [OK] Backend iniciando em nova janela CMD" -ForegroundColor Green
    Write-Host "   Aguarde alguns segundos para o servico iniciar..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
} catch {
    Write-Host "   [ERRO] Falha ao iniciar backend: $_" -ForegroundColor Red
    Write-Host "   Certifique-se de que pnpm esta instalado e as dependencias estao instaladas." -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 3. INICIAR FRONTEND (Admin Panel + Extensão)
# ============================================

Write-Host "[FRONTEND] Iniciando Admin Panel (porta $AdminPort)..." -ForegroundColor Yellow

try {
    # Abrir em nova janela CMD visível
    $frontendTitle = "Frontend - Admin Panel"
    $frontendCmd = "cd /d `"$scriptRoot`" && title $frontendTitle && pnpm dev:admin"
    Start-Process cmd.exe -ArgumentList "/k", $frontendCmd
    Write-Host "   [OK] Frontend iniciando em nova janela CMD" -ForegroundColor Green
    Write-Host "   Aguarde alguns segundos para o servico iniciar..." -ForegroundColor Gray
    Start-Sleep -Seconds 8
} catch {
    Write-Host "   [ERRO] Falha ao iniciar frontend: $_" -ForegroundColor Red
    Write-Host "   Certifique-se de que pnpm esta instalado e as dependencias estao instaladas." -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# 4. RESUMO
# ============================================

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "|                    SERVICOS INICIADOS                      |" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[SERVICO] PostgreSQL" -ForegroundColor White
Write-Host "   Porta: 5432" -ForegroundColor Gray
Write-Host "   Container: intermedius-postgres" -ForegroundColor Gray
Write-Host ""

Write-Host "[SERVICO] Redis" -ForegroundColor White
Write-Host "   Porta: 6379" -ForegroundColor Gray
Write-Host "   Container: intermedius-redis" -ForegroundColor Gray
Write-Host ""

Write-Host "[SERVICO] API Gateway" -ForegroundColor White
Write-Host "   URL: http://localhost:$ApiGatewayPort" -ForegroundColor Gray
Write-Host "   Porta: $ApiGatewayPort" -ForegroundColor Gray
Write-Host ""

Write-Host "[SERVICO] Admin Panel" -ForegroundColor White
Write-Host "   URL: http://localhost:$AdminPort" -ForegroundColor Gray
Write-Host "   Porta: $AdminPort" -ForegroundColor Gray
Write-Host ""

Write-Host "[DICA] Os servicos estao rodando em janelas CMD separadas" -ForegroundColor Cyan
Write-Host "   Verifique as janelas CMD para ver os logs" -ForegroundColor Cyan
Write-Host "   Para parar, execute: .\stop-all.ps1" -ForegroundColor Cyan
Write-Host "   Ou feche as janelas CMD manualmente" -ForegroundColor Cyan
Write-Host ""

Write-Host "[OK] Todos os servicos iniciados" -ForegroundColor Green
Write-Host ""

