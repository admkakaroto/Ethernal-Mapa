document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("map-container");
    const mapImage = document.getElementById("map-image");
    const navBar = document.getElementById("nav-bar");
    const filterBar = document.getElementById("filter-bar");
    const settingsBar = document.getElementById("settings-bar");
    const tooltip = document.getElementById("tooltip");
    const ttThumbnail = document.getElementById("tt-thumbnail");
    const ttTitle = document.getElementById("tt-title");
    const ttLevel = document.getElementById("tt-level");
    const ttRsw = document.getElementById("tt-rsw");

    let worldsData = [];
    let currentWorldIndex = 0;
    let currentFilter = 'field'; // 'field' ou 'dungeon'
    let currentMapsList = [];
    
    // Estados das preferências do jogador
    let permanentThumbnails = false;
    let showLevelsOnMap = false;
    let showTownsOnMap = true; // Habilitado por padrão como opção de overlay

    const townList = [
        "prontera", "morocc", "geffen", "payon", "alberta", "izlude", "aldebaran",
        "xmas", "comodo", "yuno", "amatsu", "gonryun", "umbala", "niflheim",
        "louyang", "start", "prison", "jawaii", "ayothaya", "einbroch",
        "lighthalzen", "einbech", "hugel", "rachel", "veins", "moscovia",
        "mid_camp", "manuk", "splendide", "brasilis", "dicastes01", "mora",
        "dewata", "malangdo", "malaya", "eclage", "lasagna", "lutie"
    ];

    fetch('json/worldmap_structured.json')
        .then(res => res.json())
        .then(data => {
            worldsData = data;
            buildNav();
            buildFilters();
            buildSettings();
            if (worldsData.length > 0) {
                loadWorld(0);
            }
        })
        .catch(err => console.error("Erro ao carregar o JSON:", err));

    window.addEventListener("resize", () => {
        updateRegionPositions();
    });

    function buildNav() {
        navBar.innerHTML = "";
        worldsData.forEach((world, index) => {
            const btn = document.createElement("button");
            btn.className = "world-btn" + (index === 0 ? " active" : "");
            btn.textContent = world.name;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".world-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentWorldIndex = index;
                loadWorld(index);
            });
            navBar.appendChild(btn);
        });
    }

    function buildFilters() {
        filterBar.innerHTML = "";
        
        // Filtros principais (Campos e Dungeons)
        const filters = [
            { id: 'field', label: '🏙️ Apenas Campos' },
            { id: 'dungeon', label: '⚔️ Apenas Dungeons' }
        ];

        filters.forEach(f => {
            const btn = document.createElement("button");
            btn.className = "filter-btn" + (f.id === 'field' ? " active" : "");
            btn.textContent = f.label;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = f.id;
                renderMapRegions();
            });
            filterBar.appendChild(btn);
        });
    }

    // Painel de Configurações / Preferências do Jogador
    function buildSettings() {
        settingsBar.innerHTML = "";

        // Switch para Miniaturas (Hover vs Fixas)
        const thumbBtn = document.createElement("button");
        thumbBtn.className = "setting-btn";
        updateThumbButtonText(thumbBtn);
        thumbBtn.addEventListener("click", () => {
            permanentThumbnails = !permanentThumbnails;
            updateThumbButtonText(thumbBtn);
            renderMapRegions();
        });
        settingsBar.appendChild(thumbBtn);

        // Switch para Níveis Recomendados no Mapa
        const levelBtn = document.createElement("button");
        levelBtn.className = "setting-btn";
        updateLevelButtonText(levelBtn);
        levelBtn.addEventListener("click", () => {
            showLevelsOnMap = !showLevelsOnMap;
            updateLevelButtonText(levelBtn);
            renderMapRegions();
        });
        settingsBar.appendChild(levelBtn);

        // Switch para Exibir/Ocultar Cidades
        const townBtn = document.createElement("button");
        townBtn.className = "setting-btn";
        updateTownButtonText(townBtn);
        townBtn.addEventListener("click", () => {
            showTownsOnMap = !showTownsOnMap;
            updateTownButtonText(townBtn);
            renderMapRegions();
        });
        settingsBar.appendChild(townBtn);
    }

    function updateThumbButtonText(btn) {
        if (permanentThumbnails) {
            btn.textContent = "🖼️ Miniaturas: Sempre Visíveis";
            btn.classList.add("active");
        } else {
            btn.textContent = "🖼️ Miniaturas: Apenas no Mouse";
            btn.classList.remove("active");
        }
    }

    function updateLevelButtonText(btn) {
        if (showLevelsOnMap) {
            btn.textContent = "⭐ Níveis no Mapa: Visíveis";
            btn.classList.add("active");
        } else {
            btn.textContent = "⭐ Níveis no Mapa: Ocultos";
            btn.classList.remove("active");
        }
    }

    function updateTownButtonText(btn) {
        if (showTownsOnMap) {
            btn.textContent = "🏰 Cidades no Mapa: Visíveis";
            btn.classList.add("active");
        } else {
            btn.textContent = "🏰 Cidades no Mapa: Ocultas";
            btn.classList.remove("active");
        }
    }

    function loadWorld(index) {
        const world = worldsData[index];
        if (!world) return;
        
        // Limpeza imediata de regiões anteriores para impedir sobreposição entre mundos
        document.querySelectorAll(".map-region").forEach(el => el.remove());

        mapImage.src = `assets/images/${world.image}`;
        currentMapsList = world.maps || [];

        mapImage.onload = () => {
            renderMapRegions();
        };
        if (mapImage.complete) {
            renderMapRegions();
        }
    }

    function isTownMap(map) {
        if (!map.rsw) return false;
        const cleanName = map.rsw.toLowerCase().replace('.rsw', '');
        return townList.includes(cleanName) && !cleanName.includes('fild') && !cleanName.includes('dun');
    }

    function renderMapRegions() {
        document.querySelectorAll(".map-region").forEach(el => el.remove());

        currentMapsList.forEach(map => {
            const rswLower = (map.rsw || '').toLowerCase();
            const isDun = map.type === 'dungeon' || rswLower.includes('dun');
            const isTown = isTownMap(map);
            const isField = !isDun && !isTown;

            // Filtro dinâmico: Cidades aparecem se a opção 'showTownsOnMap' estiver ligada
            if (isTown) {
                if (!showTownsOnMap) return;
            } else {
                if (currentFilter === 'field' && !isField) return;
                if (currentFilter === 'dungeon' && !isDun) return;
            }

            const el = document.createElement("div");
            el.className = "map-region " + (isDun ? 'dungeon' : 'field');
            
            el.dataset.x1 = map.x1;
            el.dataset.y1 = map.y1;
            el.dataset.width = map.width > 0 ? map.width : (isDun ? 100 : 50);
            el.dataset.height = map.height > 0 ? map.height : (isDun ? 35 : 40);

            // Miniaturas fixas (se habilitado)
            if (permanentThumbnails && map.rsw && map.rsw !== "dungeon") {
                const rswName = map.rsw.replace('.rsw', '');
                const img = document.createElement("img");
                img.className = "region-thumb";
                img.src = `assets/images/mapas/${rswName}.png`;
                img.onerror = function() {
                    this.style.display = "none";
                };
                el.appendChild(img);
            }

            // Exibição de nível recomendado (se habilitado)
            if (showLevelsOnMap && map.level) {
                const levelBadge = document.createElement("div");
                levelBadge.className = "map-level-badge";
                levelBadge.textContent = map.level.includes("~") ? `Lv.${map.level}` : `Lv.${map.level}`;
                el.appendChild(levelBadge);
            }

            el.addEventListener("mouseenter", () => {
                ttTitle.textContent = map.name;
                ttLevel.textContent = map.level ? `Nível Recomendado: ${map.level}` : "Zona Segura / Cidade";
                ttRsw.textContent = isDun ? 'Tipo: Dungeon' : `Arquivo: ${map.rsw}`;

                if (!permanentThumbnails && map.rsw && map.rsw !== "dungeon") {
                    const rswName = map.rsw.replace('.rsw', '');
                    ttThumbnail.src = `assets/images/mapas/${rswName}.png`;
                    ttThumbnail.style.display = "block";
                    ttThumbnail.onerror = function() {
                        ttThumbnail.style.display = "none";
                    };
                } else {
                    ttThumbnail.style.display = "none";
                }

                tooltip.style.display = "block";
            });

            el.addEventListener("mousemove", (e) => {
                const rect = container.getBoundingClientRect();
                tooltip.style.left = (e.clientX - rect.left + 15) + "px";
                tooltip.style.top = (e.clientY - rect.top + 15) + "px";
            });

            el.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });

            container.appendChild(el);
        });

        updateRegionPositions();
    }

    function updateRegionPositions() {
        const baseWidth = 1280;
        const currentWidth = mapImage.clientWidth;
        if (!currentWidth) return;

        const scale = currentWidth / baseWidth;

        document.querySelectorAll(".map-region").forEach(el => {
            const x1 = parseFloat(el.dataset.x1);
            const y1 = parseFloat(el.dataset.y1);
            const w = parseFloat(el.dataset.width);
            const h = parseFloat(el.dataset.height);

            el.style.left = (x1 * scale) + "px";
            el.style.top = (y1 * scale) + "px";
            el.style.width = (w * scale) + "px";
            el.style.height = (h * scale) + "px";
        });
    }
});