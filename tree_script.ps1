$Exclude = @("node_modules", ".next", ".git", "dist", "build", ".vercel", ".vscode", ".idea", "coverage")

function Show-Tree {
    param(
        [string]$CurrentPath,
        [string]$Indent = ""
    )
    
    $Items = Get-ChildItem -Path $CurrentPath | Where-Object { $_.Name -notin $Exclude } | Sort-Object Name
    $Count = $Items.Count
    $i = 0
    
    foreach ($Item in $Items) {
        $i++
        $IsLast = $i -eq $Count
        $Prefix = if ($IsLast) { "└── " } else { "├── " }
        
        Write-Output "$Indent$Prefix$($Item.Name)"
        
        if ($Item.PSIsContainer) {
            $NextIndent = $Indent + (if ($IsLast) { "    " } else { "│   " })
            Show-Tree -CurrentPath $Item.FullName -Indent $NextIndent
        }
    }
}

Show-Tree -CurrentPath "."
