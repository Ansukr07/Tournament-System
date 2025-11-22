# Move all frontend files to frontend folder

$frontendDirs = @("app", "components", "hooks", "lib", "public", "shared", "styles")
$frontendFiles = @("components.json", "next-env.d.ts", "next.config.mjs", "package.json", "package-lock.json", "postcss.config.mjs", "tsconfig.json", "pnpm-lock.yaml")

Write-Host "Moving frontend directories..." -ForegroundColor Green
foreach ($dir in $frontendDirs) {
    if (Test-Path $dir) {
        Write-Host "Moving $dir to frontend/$dir"
        Move-Item -Path $dir -Destination "frontend/$dir" -Force
    }
}

Write-Host "Moving frontend files..." -ForegroundColor Green
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "Moving $file to frontend/$file"
        Move-Item -Path $file -Destination "frontend/$file" -Force
    }
}

Write-Host "Moving .next build folder..." -ForegroundColor Green
if (Test-Path ".next") {
    Move-Item -Path ".next" -Destination "frontend/.next" -Force
}

if (Test-Path "node_modules") {
    Write-Host "Moving node_modules..." -ForegroundColor Yellow
    Move-Item -Path "node_modules" -Destination "frontend/node_modules" -Force
}

Write-Host "Reorganization complete!" -ForegroundColor Green
