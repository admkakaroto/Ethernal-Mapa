document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("map-container");
    const mapImage = document.getElementById("map-image");
    const navBar = document.getElementById("nav-bar");
    const filterBar = document.getElementById("filter-bar");
    const tooltip = document.getElementById("tooltip");
    const ttTitle = document.getElementById("tt-title");
    const ttLevel = document.getElementById("tt-level");
    const ttRsw = document.getElementById("tt-rsw");

    let worldsData = [];
    let currentWorldIndex = 0;
    let currentFilter = 'all'; // 'all', 'field', 'dungeon'

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
            { id: 'all', label: '🗺️ Mostrar Tudo' },
            { id: 'field', label: '🏙️ Apenas Campos / Cidades' },
            { id: 'dungeon', label: '⚔️ Apenas Dungeons' }
        ];

        filters.forEach(f => {
            const btn = document.createElement("button");
            btn.className = "filter-btn" + (f.id === 'all' ? " active" : "");
            btn.textContent = f.label;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                currentFilter = f.id;
                loadWorld(currentWorldIndex);
            });
            filterBar.appendChild(btn);
        });
    }

    function loadWorld(index) {
        const world = worldsData[index];
        if (!world) return;
        
        mapImage.src = `assets/images/${world.image}`;

        // Limpar caixas anteriores
        document.querySelectorAll(".map-region").forEach(el => el.remove());

        if (world.maps && Array.isArray(world.maps)) {
            world.maps.forEach(map => {
                // Aplicar filtro de exibição
                if (currentFilter !== 'all' && map.type !== currentFilter) {
                    return;
                }

                const el = document.createElement("div");
                el.className = "map-region " + (map.type || 'field');
                
                el.style.left = map.x1 + "px";
                el.style.top = map.y1 + "px";

                // Se for dungeon, exibimos o nome diretamente na placa vermelha (estilo jogo)
                if (map.type === 'dungeon') {
                    el.style.width = (map.width > 0 ? map.width : 120) + "px";
                    el.style.height = (map.height > 0 ? map.height : 26) + "px";
                    el.textContent = map.name; // Mostra o nome na placa vermelha
                } else {
                    el.style.width = map.width + "px";
                    el.style.height = map.height + "px";
                }

                el.addEventListener("mouseenter", () => {
                    ttTitle.textContent = map.name;
                    ttLevel.textContent = map.level ? `Nível Recomendado: ${map.level}` : "Zona Segura / Cidade";
                    ttRsw.textContent = map.type === 'dungeon' ? 'Tipo: Dungeon' : `Arquivo: ${map.rsw}`;
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
        }
    }
});