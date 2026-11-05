<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Worldmap Interativo - Ragnarok Online</title>
    <link rel="stylesheet" href="assets/css/estilo.css?v=<?php echo time(); ?>">
</head>
<body>

    <!-- Menu de Continentes -->
    <div id="nav-bar"></div>

    <!-- Menu de Filtros (Dungeons vs Fields) -->
    <div id="filter-bar"></div>

    <div id="map-container">
        <img id="map-image" src="" alt="Worldmap">
        <div id="tooltip">
            <img id="tt-thumbnail" src="" alt="Miniatura" style="display: none;">
            <div class="title" id="tt-title">---</div>
            <div class="level" id="tt-level"></div>
            <div class="rsw" id="tt-rsw"></div>
        </div>
    </div>

    <script src="assets/js/api.js?v=<?php echo time(); ?>"></script>
</body>
</html>