# Search much deeper into the PDF for text and metadata
$filePath = 'C:\Users\yoges\Downloads\Brand-Book-Hipro.pdf'
$encoding = [System.Text.Encoding]::GetEncoding(28591)

# Get file size
$fileInfo = Get-Item $filePath
Write-Host "File size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB"

# Read the ENTIRE file for font search
$fs = New-Object System.IO.FileStream($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read)
$allBytes = New-Object byte[] $fileInfo.Length
$fs.Read($allBytes, 0, $fileInfo.Length) | Out-Null
$fs.Close()

$fullContent = $encoding.GetString($allBytes)
Write-Host "Loaded entire file: $($fullContent.Length) chars"

# Find ALL fonts
Write-Host "`n=== ALL FONTS ==="
$fontRegex = [regex]::new('/BaseFont\s*/([^\s/\]\>\)]+)')
$fontMatches = $fontRegex.Matches($fullContent)
$seenFonts = @{}
foreach ($fm in $fontMatches) {
    $fontName = $fm.Groups[1].Value
    if (-not $seenFonts.ContainsKey($fontName)) {
        $seenFonts[$fontName] = $true
        Write-Host "  $fontName"
    }
}

# Find font family names
Write-Host "`n=== FONT FAMILIES ==="
$familyRegex = [regex]::new('/FontFamily\s*\(([^)]+)\)')
$familyMatches = $familyRegex.Matches($fullContent)
$seenFamilies = @{}
foreach ($fm in $familyMatches) {
    $family = $fm.Groups[1].Value
    if (-not $seenFamilies.ContainsKey($family)) {
        $seenFamilies[$family] = $true
        Write-Host "  $family"
    }
}

# Find font names via /FontName
Write-Host "`n=== FONT NAMES ==="
$fnameRegex = [regex]::new('/FontName\s*/([^\s/\]\>\)]+)')
$fnameMatches = $fnameRegex.Matches($fullContent)
$seenFnames = @{}
foreach ($fm in $fnameMatches) {
    $fname = $fm.Groups[1].Value
    if (-not $seenFnames.ContainsKey($fname)) {
        $seenFnames[$fname] = $true
        Write-Host "  $fname"
    }
}

# Search for ALL RGB color definitions throughout the file
Write-Host "`n=== ALL RGB COLORS ==="
$colorRegex = [regex]::new('(0?\.\d+|[01])\s+(0?\.\d+|[01])\s+(0?\.\d+|[01])\s+(rg|RG)')
$colorMatches = $colorRegex.Matches($fullContent)
$seenColors = @{}
foreach ($cm in $colorMatches) {
    $key = "$($cm.Groups[1].Value) $($cm.Groups[2].Value) $($cm.Groups[3].Value)"
    if (-not $seenColors.ContainsKey($key)) {
        $seenColors[$key] = $true
        $r = [math]::Round([double]$cm.Groups[1].Value * 255)
        $g = [math]::Round([double]$cm.Groups[2].Value * 255)
        $b = [math]::Round([double]$cm.Groups[3].Value * 255)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
        Write-Host "  RGB($r,$g,$b) = $hex"
    }
}

# All CMYK
Write-Host "`n=== ALL CMYK COLORS ==="
$cmykRegex = [regex]::new('(0?\.\d+|[01])\s+(0?\.\d+|[01])\s+(0?\.\d+|[01])\s+(0?\.\d+|[01])\s+(k|K)')
$cmykMatches = $cmykRegex.Matches($fullContent)
$seenCmyk = @{}
foreach ($cm in $cmykMatches) {
    $key = "$($cm.Groups[1].Value) $($cm.Groups[2].Value) $($cm.Groups[3].Value) $($cm.Groups[4].Value)"
    if (-not $seenCmyk.ContainsKey($key)) {
        $seenCmyk[$key] = $true
        Write-Host "  C=$($cm.Groups[1].Value) M=$($cm.Groups[2].Value) Y=$($cm.Groups[3].Value) K=$($cm.Groups[4].Value)"
    }
}

# Find ALL text blocks
Write-Host "`n=== ALL TEXT BLOCKS ==="
$btEtRegex = [regex]::new('BT\s(.+?)\sET', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$textBlocks = $btEtRegex.Matches($fullContent)
Write-Host "Total text blocks: $($textBlocks.Count)"

$allText = @()
foreach ($tb in $textBlocks) {
    $tjRegex = [regex]::new('\(([^\)]+)\)\s*Tj')
    $tjMatches = $tjRegex.Matches($tb.Value)
    foreach ($tj in $tjMatches) {
        $txt = $tj.Groups[1].Value -replace '[^\x20-\x7E]', ''
        if ($txt.Length -gt 1) {
            $allText += $txt
        }
    }
    # TJ array operator
    $tjArrRegex = [regex]::new('\[([^\]]+)\]\s*TJ')
    $tjArrMatches = $tjArrRegex.Matches($tb.Value)
    foreach ($tja in $tjArrMatches) {
        $innerRegex = [regex]::new('\(([^\)]+)\)')
        $innerMatches = $innerRegex.Matches($tja.Groups[1].Value)
        $combined = ""
        foreach ($im in $innerMatches) {
            $combined += $im.Groups[1].Value -replace '[^\x20-\x7E]', ''
        }
        if ($combined.Length -gt 1) {
            $allText += $combined
        }
    }
}

Write-Host "`nAll extracted text:"
$allText | Select-Object -Unique | ForEach-Object { Write-Host "  $_" }

# Search for specific keywords in context
Write-Host "`n=== KEYWORD SEARCH ACROSS FULL FILE ==="
$keywords = @('HIPRO', 'Hipro', 'hipro', 'brand', 'Brand', 'BRAND', 'Hindustan', 'HINDUSTAN', 'Projects', 'PROJECTS', 'construction', 'Construction', 'tagline', 'slogan', 'mission', 'vision', 'Pantone', 'pantone', 'PANTONE', 'C:', 'M:', 'Y:', 'K:', '#')
foreach ($kw in $keywords) {
    $kwMatches = [regex]::Matches($fullContent, [regex]::Escape($kw))
    if ($kwMatches.Count -gt 0) {
        Write-Host "  '$kw' found $($kwMatches.Count) times"
    }
}
