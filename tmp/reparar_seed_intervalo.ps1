$ErrorActionPreference = 'Stop'

$htmlPath = Join-Path $PSScriptRoot '..\gestao_armazem_catenaria.html'
$jsonPath = Join-Path $PSScriptRoot '..\dados_armazem_catenaria.json'
$html = [IO.File]::ReadAllText($htmlPath)
$json = [IO.File]::ReadAllText($jsonPath)

$materialId = '"id":"sap20260817-mat-4500854997-330"'
$movementId = '"id":"mv4841"'

$htmlMaterial = $html.IndexOf($materialId)
$htmlMovement = $html.IndexOf($movementId, $htmlMaterial)
$jsonMaterial = $json.IndexOf($materialId)
$jsonMovement = $json.IndexOf($movementId, $jsonMaterial)

if ($htmlMaterial -lt 0 -or $htmlMovement -lt 0 -or $jsonMaterial -lt 0 -or $jsonMovement -lt 0) {
    throw 'Não foi possível localizar os limites seguros da reparação.'
}

$htmlObjectStart = $html.LastIndexOf('{', $htmlMaterial)
$jsonObjectStart = $json.LastIndexOf('{', $jsonMaterial)
$htmlMovementStart = $html.LastIndexOf('{', $htmlMovement)
$jsonMovementStart = $json.LastIndexOf('{', $jsonMovement)

$replacement = $json.Substring($jsonObjectStart, $jsonMovementStart - $jsonObjectStart)
$repaired = $html.Substring(0, $htmlObjectStart) + $replacement + $html.Substring($htmlMovementStart)

$utf8NoBom = [Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText($htmlPath, $repaired, $utf8NoBom)

Write-Output "Intervalo reparado: $($htmlMovementStart - $htmlObjectStart) -> $($replacement.Length) caracteres."
