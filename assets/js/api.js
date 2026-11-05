document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("map-container");
    const mapImage = document.getElementById("map-image");
    const navBar = document.getElementById("nav-bar");
    const filterBar = document.getElementById("filter-bar");
    const tooltip = document.getElementById("tooltip");
    const ttThumbnail = document.getElementById("tt-thumbnail");
    const ttTitle = document.getElementById("tt-title");
    const ttLevel = document.getElementById("tt-level");
    const ttRsw = document.getElementById("tt-rsw");

    let worldsData = [];
    let currentWorldIndex = 0;
    let currentFilter = 'field'; 
    let currentMapsList = [];
    let permanentThumbnails = false;

    // Lista oficial rigorosa de cidades do Ragnarok
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
        
        const filters = [
            { id: 'field', label: '🏙️ Apenas Campos' },
            { id: 'dungeon', label: '⚔️ Apenas Dungeons' },
            { id: 'town', label: '🏰 Apenas Cidades' }
        ];

        filters.forEach(f => {
            const btn = document.createElement("button");
            btn.className = "filter-btn" + (f.id === 'field' ? " active" : "");
            btn.textContent = f.label;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => {
                    if(!b.classList.contains('toggle-thumb-btn')) b.classList.remove("active");
                });
                btn.classList.add("active");
                currentFilter = f.id;
                renderMapRegions();
            });
            filterBar.appendChild(btn);
        });

        const toggleBtn = document.createElement("button");
        toggleBtn.className = "filter-btn toggle-thumb-btn";
        updateToggleButtonLabel(toggleBtn);
        
        toggleBtn.addEventListener("click", () => {
            permanentThumbnails = !permanentThumbnails;
            updateToggleButtonLabel(toggleBtn);
            renderMapRegions();
        });
        filterBar.appendChild(toggleBtn);
    }

    function updateToggleButtonLabel(btn) {
        if (permanentThumbnails) {
            btn.textContent = "🖼️ Miniaturas: Sempre Visíveis";
            btn.style.background = "#1b4d3e";
            btn.style.borderColor = "#00ffcc";
        } else {
            btn.textContent = "🖼️ Miniaturas: Apenas no Mouse";
            btn.style.background = "#2a1f1f";
            btn.style.borderColor = "#662222";
        }
    }

    function loadWorld(index) {
        const world = worldsData[index];
        if (!world) return;
        
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

            if (currentFilter === 'field' && !isField) return;
            if (currentFilter === 'dungeon' && !isDun) return;
            if (currentFilter === 'town' && !isTown) return;

            const el = document.createElement("div");
            el.className = "map-region " + (isDun ? 'dungeon' : 'field');
            
            el.dataset.x1 = map.x1;
            el.dataset.y1 = map.y1;
            el.dataset.width = map.width > 0 ? map.width : (isDun ? 100 : 50);
            el.dataset.height = map.height > 0 ? map.height : (isDun ? 35 : 40);

            // Inserção da miniatura permanente (funciona perfeitamente em dungeons e campos quando ativado)
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