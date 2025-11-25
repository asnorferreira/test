# ============================================
# VERIFICAR STATUS DOS SERVIÇOS
# ============================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     STATUS DOS SERVIÇOS - INTERMEDIUS          " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [int]$Port,
        [string]$HealthEndpoint = ""
    )
    
    Write-Host "[TESTE] $Name" -ForegroundColor Yellow
    Write-Host "   Porta: $Port" -ForegroundColor Gray
    
    $portOpen = Test-Port -Port $Port
    
    if ($portOpen) {
        Write-Host "   Status: [OK] ONLINE" -ForegroundColor Green
        
        # Tentar fazer requisição HTTP
        try {
            $testUrl = if ($HealthEndpoint) { "$Url$HealthEndpoint" } else { $Url }
            $response = Invoke-WebRequest -Uri $testUrl -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
            Write-Host "   HTTP: [OK] $($response.StatusCode)" -ForegroundColor Green
            Write-Host "   URL: $Url" -ForegroundColor Cyan
        } catch {
            Write-Host "   HTTP: [AVISO] Nao respondeu corretamente" -ForegroundColor Yellow
            Write-Host "   URL: $Url" -ForegroundColor Cyan
        }
    } else {
        Write-Host "   Status: [ERRO] OFFLINE" -ForegroundColor Red
        Write-Host "   URL: $Url" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Verificar serviços
Test-Service -Name "API Gateway" -Url "http://localhost:3000" -Port 3000 -HealthEndpoint "/health"
Test-Service -Name "Admin Panel" -Url "http://localhost:3001" -Port 3001
Test-Service -Name "Policy Service" -Url "http://localhost:3002" -Port 3002 -HealthEndpoint "/health"
Test-Service -Name "N8N Workflow" -Url "http://localhost:5678" -Port 5678

# Verificar processos
Write-Host "[INFO] Processos Node.js ativos:" -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object { $_.ProcessName -eq "node" -or $_.ProcessName -eq "tsx" -or $_.ProcessName -eq "next" -or $_.ProcessName -eq "n8n" } | Select-Object ProcessName, Id, CPU, WorkingSet

if ($nodeProcesses.Count -gt 0) {
    $nodeProcesses | Format-Table -AutoSize
} else {
    Write-Host "   Nenhum processo Node.js encontrado" -ForegroundColor Gray
}

Write-Host ""
