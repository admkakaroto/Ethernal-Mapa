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

    <!-- Menu de Filtros (Tipos de Mapas) -->
    <div id="filter-bar"></div>

    <!-- Barra de Configurações / Preferências do Jogador -->
    <div id="settings-bar"></div>

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
<!-- Rodapé do Site -->
    <footer id="site-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>Worldmap Interativo</h3>
                <p>O seu guia definitivo para explorar continentes, campos, dungeons e cidades no universo de Ragnarok Online.</p>
            </div>
            <div class="footer-section">
                <h4>Links Úteis</h4>
                <ul>
                    <li><a href="index.php">Mapa Principal</a></li>
                    <li><a href="#" id="footer-about">Sobre o Projeto</a></li>
                    <li><a href="#" id="footer-credits">Créditos dos Dados</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Estado do Servidor</h4>
                <p><span class="status-indicator"></span> Servidor Online</p>
                <p class="copyright">&copy; <?php echo date("Y"); ?> - Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
</html>