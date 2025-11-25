# Script para remover arquivos rastreados que devem ser ignorados
# Execute: .\fix-gitignore.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removendo arquivos de build do índice do git..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está em um repositório git
if (-not (Test-Path .git)) {
    Write-Host "ERRO: Não é um repositório git!" -ForegroundColor Red
    exit 1
}

# Remover TODOS os arquivos .next/ do índice
Write-Host "Removendo packages/admin/.next/ ..." -ForegroundColor Cyan
git rm -r --cached packages/admin/.next/ 2>&1 | Out-Null

# Remover outras pastas de build
Write-Host "Removendo packages/admin/out/ ..." -ForegroundColor Cyan
git rm -r --cached packages/admin/out/ 2>&1 | Out-Null

Write-Host "Removendo packages/admin/.turbo/ ..." -ForegroundColor Cyan
git rm -r --cached packages/admin/.turbo/ 2>&1 | Out-Null

Write-Host "Removendo packages/server/dist/ ..." -ForegroundColor Cyan
git rm -r --cached packages/server/dist/ 2>&1 | Out-Null

Write-Host "Removendo packages/widget/dist/ ..." -ForegroundColor Cyan
git rm -r --cached packages/widget/dist/ 2>&1 | Out-Null

# Remover node_modules se estiverem rastreados
Write-Host "Removendo node_modules/ ..." -ForegroundColor Cyan
git rm -r --cached node_modules/ 2>&1 | Out-Null
git rm -r --cached packages/*/node_modules/ 2>&1 | Out-Null

# Remover arquivos *.tsbuildinfo
Write-Host "Removendo arquivos *.tsbuildinfo ..." -ForegroundColor Cyan
Get-ChildItem -Recurse -Filter "*.tsbuildinfo" -ErrorAction SilentlyContinue | ForEach-Object {
    git rm --cached $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/") 2>&1 | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Arquivos removidos do índice!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Verificando status..." -ForegroundColor Yellow
Write-Host ""

# Mostrar status após remoção
git status --short | Select-Object -First 20

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Verifique o status completo: git status" -ForegroundColor White
Write-Host "2. Adicione apenas o .gitignore: git add .gitignore" -ForegroundColor White
Write-Host "3. Commit: git commit -m 'Corrigir .gitignore e remover arquivos de build'" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Os arquivos ainda existem no disco, apenas foram removidos do git!" -ForegroundColor Yellow
