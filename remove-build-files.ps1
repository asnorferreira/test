# Remove TODOS os arquivos de build do índice do git
# Execute: .\remove-build-files.ps1

Write-Host "Removendo arquivos de build do índice do git..." -ForegroundColor Yellow

# Remover .next/ recursivamente
git ls-files packages/admin/.next/ 2>$null | ForEach-Object {
    git rm --cached $_ 2>$null
}

# Remover outras pastas
git rm -r --cached packages/admin/.next/ 2>$null
git rm -r --cached packages/admin/out/ 2>$null
git rm -r --cached packages/admin/.turbo/ 2>$null
git rm -r --cached packages/server/dist/ 2>$null
git rm -r --cached packages/widget/dist/ 2>$null

# Remover tsbuildinfo
git rm --cached packages/admin/tsconfig.tsbuildinfo 2>$null

Write-Host "✅ Concluído! Execute 'git status' para verificar." -ForegroundColor Green


