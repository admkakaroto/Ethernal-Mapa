<?php
// parser.php - Parser definitivo por leitura de blocos lineares

function parseAllWorlds() {
    $langFile  = __DIR__ . '/data/worldviewdata_Language.lub';
    $listFile  = __DIR__ . '/data/worldviewdata_list.lub';
    $tableFile = __DIR__ . '/data/worldviewdata_table.lub';

    if (!file_exists($langFile) || !file_exists($listFile) || !file_exists($tableFile)) {
        die("Ficheiros .lub em falta na pasta /data/");
    }

    $langContent  = file_get_contents($langFile);
    $listContent  = file_get_contents($listFile);
    $tableContent = file_get_contents($tableFile);

    // 1. Extrair os textos de WORLD_MSGID (ex: MSI_1_THA_T01 = "Thanatos Tower F1...")
    $msgIds = [];
    preg_match_all('/(MSI_[A-Z0-9_]+)\s*=\s*"([^"]+)"/', $langContent, $matches, PREG_SET_ORDER);
    foreach ($matches as $m) {
        $msgIds[$m[1]] = $m[2];
    }

    // 2. Extrair a lista de Mundos (World_List) do worldviewdata_list.lub
    preg_match_all('/\{\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\s*\}/', $listContent, $listMatches, PREG_SET_ORDER);
    
    $worldsData = [];

    echo "<pre>";
    foreach ($listMatches as $world) {
        $worldName      = $world[1];
        $fieldTableName = $world[2];
        $dunTableName   = $world[3];
        $bgImage        = $world[4];

        $maps = [];

        // Extrair campos/cidades e dungeons usando a busca por bloco
        extractTableMapsByBlock($tableContent, $fieldTableName, $msgIds, $maps, false);
        extractTableMapsByBlock($tableContent, $dunTableName, $msgIds, $maps, true);

        echo "Continente: <b>{$worldName}</b> | Tabelas: {$fieldTableName} / {$dunTableName} | Mapas extraídos: " . count($maps) . "\n";

        $worldsData[] = [
            'name'  => $worldName,
            'image' => $bgImage,
            'maps'  => $maps
        ];
    }
    echo "</pre>";

    $outputDir = __DIR__ . '/json';
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0777, true);
    }

    $outputFile = $outputDir . '/worldmap_structured.json';
    file_put_contents($outputFile, json_encode($worldsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo "<br><b>Sucesso! JSON guardado em: {$outputFile}</b>";
}

function extractTableMapsByBlock($tableContent, $tableName, $msgIds, &$maps, $isDungeon) {
    // Procura onde a tabela começa no ficheiro (ex: "worldtable_main = {" ou "worldtable_main={")
    $pos = preg_match('/\b' . preg_quote($tableName) . '\s*=\s*\{/', $tableContent, $match, PREG_OFFSET_CAPTURE);
    if (!$pos) return;

    $startOffset = $match[0][1];
    
    // Recorta o texto a partir do início da tabela
    $subContent = substr($tableContent, $startOffset);

    // Encontra o fecho da tabela principal isolando o bloco entre a primeira '{' e a '}' final da tabela
    $firstBrace = strpos($subContent, '{');
    if ($firstBrace === false) return;

    $openCount = 0;
    $block = '';
    $length = strlen($subContent);

    for ($i = $firstBrace; $i < $length; $i++) {
        $char = $subContent[$i];
        if ($char === '{') $openCount++;
        if ($char === '}') $openCount--;

        $block .= $char;

        if ($openCount === 0) {
            break; // Fim do bloco da tabela principal
        }
    }

    // Agora extraímos cada linha contida dentro do bloco
    if (!$isDungeon) {
        // Exemplo Campo/Cidade: { 1, "tha_t01.rsw", 552, 5, 646, 45, WORLD_MSGID.MSI_1_THA_T01, "110" },
        $pattern = '/\{\s*([^,]+),\s*"([^"]+)",\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*([A-Z0-9_\.]+),\s*"([^"]*)"\s*\}/i';
        preg_match_all($pattern, $block, $rows, PREG_SET_ORDER);

        foreach ($rows as $r) {
            $msgKey = trim(str_replace(['WORLD_MSGID.', ' '], '', $r[7]));
            $maps[] = [
                'rsw'    => $r[2],
                'x1'     => (int)$r[3],
                'y1'     => (int)$r[4],
                'x2'     => (int)$r[5],
                'y2'     => (int)$r[6],
                'width'  => abs((int)$r[5] - (int)$r[3]),
                'height' => abs((int)$r[6] - (int)$r[4]),
                'name'   => $msgIds[$msgKey] ?? $msgKey,
                'level'  => $r[8] !== "" ? $r[8] : null,
                'type'   => 'field'
            ];
        }
    } else {
        // Exemplo Dungeon: { 1, 725, 17, 745, 37, WORLD_MSGID.MSI_DUN1, "110~130" },
        $pattern = '/\{\s*([^,]+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*(-?\d+),\s*([A-Z0-9_\.]+),\s*"([^"]*)"\s*\}/i';
        preg_match_all($pattern, $block, $rows, PREG_SET_ORDER);

        foreach ($rows as $r) {
            $msgKey = trim(str_replace(['WORLD_MSGID.', ' '], '', $r[6]));
            $maps[] = [
                'rsw'    => 'dungeon',
                'x1'     => (int)$r[2],
                'y1'     => (int)$r[3],
                'x2'     => (int)$r[4],
                'y2'     => (int)$r[5],
                'width'  => abs((int)$r[4] - (int)$r[2]),
                'height' => abs((int)$r[5] - (int)$r[3]),
                'name'   => $msgIds[$msgKey] ?? $msgKey,
                'level'  => $r[7] !== "" ? $r[7] : null,
                'type'   => 'dungeon'
            ];
        }
    }
}

parseAllWorlds();