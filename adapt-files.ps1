# Script pour adapter les fichiers copiés pour Next.js
$files = Get-ChildItem -Path "components\comporchestrator" -Recurse -File -Include "*.tsx","*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # 1. Ajouter "use client" au début des fichiers .tsx (sauf s'il existe déjà)
    if ($file.Extension -eq ".tsx" -and $content -notmatch '"use client"') {
        $content = '"use client";' + "`n`n" + $content
    }
    
    # 2. Remplacer import.meta.env.VITE_* par process.env.NEXT_PUBLIC_*
    $content = $content -replace 'import\.meta\.env\.VITE_([A-Z_]+)', 'process.env.NEXT_PUBLIC_$1'
    
    # 3. Remplacer les imports relatifs depuis '../services' par './services'
    $content = $content -replace "from\s+['""]\.\.\/services\/", "from './services/"
    $content = $content -replace "from\s+['""]\.\.\/\.\.\/services\/", "from '../services/"
    
    # 4. Remplacer les imports relatifs depuis '../components' par './components' ou '../components'
    $content = $content -replace "from\s+['""]\.\.\/components\/", "from '../components/"
    
    # 5. Adapter window.location.href (sera fait manuellement pour les cas complexes)
    # $content = $content -replace 'window\.location\.href\s*=\s*["'']([^"'']+)["'']', 'router.push("$1")'
    
    # Écrire seulement si le contenu a changé
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Adapted: $($file.FullName)"
    }
}

Write-Host "`nAdaptation complete!"

