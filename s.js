(() => {
    try {
        class Advanced_Pathfinder {
            constructor(search_radius = 1500, cell_size = 100) {
                this.search_radius = search_radius;
                this.cell_size = cell_size;

                this.world_w = 8100;
                this.world_h = 8100;

                this.me = null;
                this.target = null;

                this.obstacles = [];
                this.cells = new Map();

                this.path = [];
                this.index = 0;

                this.setup_cells();
            }

            // Set the destination in WORLD coordinates.
            set_target(x, y, me) {
                this.me = {
                    x: me.x,
                    y: me.y,
                    r: me.r ?? 10,
                };

                this.target = { x, y };

                this.path = [];
                this.index = 0;
            }

            // Each obstacle should have { x, y, r } in world coordinates.
            set_obstacles(obstacles) {
                this.obstacles = Array.isArray(obstacles) ? obstacles : [];
            }

            // World coordinates -> grid key.
            location_to_grid({ x, y }) {
                const cols = Math.ceil(this.world_w / this.cell_size);
                const rows = Math.ceil(this.world_h / this.cell_size);

                const gx = Math.max(0, Math.min(cols - 1, Math.floor(x / this.cell_size)));

                const gy = Math.max(0, Math.min(rows - 1, Math.floor(y / this.cell_size)));

                return `${gx},${gy}`;
            }

            // Grid key -> integer grid coordinates.
            grid_to_coords(key) {
                const [x, y] = key.split(",").map(Number);
                return { x, y };
            }

            // Grid key -> world-space center of the cell.
            grid_to_location(key) {
                const { x, y } = this.grid_to_coords(key);

                return {
                    x: (x + 0.5) * this.cell_size,
                    y: (y + 0.5) * this.cell_size,
                };
            }

            calc_dist(a, b) {
                return Math.hypot(a.x - b.x, a.y - b.y);
            }

            // Initialize all cells as walkable.
            setup_cells() {
                this.cells.clear();

                const cols = Math.ceil(this.world_w / this.cell_size);
                const rows = Math.ceil(this.world_h / this.cell_size);

                for (let x = 0; x < cols; x++) {
                    for (let y = 0; y < rows; y++) {
                        this.cells.set(`${x},${y}`, true);
                    }
                }
            }

            // true = walkable
            // false = blocked

            calc_directions() {
                const size = this.cell_size;
                const cols = Math.ceil(this.world_w / size);
                const rows = Math.ceil(this.world_h / size);

                const player_radius = Math.max(0, Number(this.me?.r) || 20);

                // Reset the existing grid.
                for (const key of this.cells.keys()) {
                    if (this.cells.get(key) === false) {
                        this.cells.set(key, true);
                    }
                }

                // Mark only cells near each obstacle.
                for (const obs of this.obstacles) {
                    if (!obs || !Number.isFinite(obs.x) || !Number.isFinite(obs.y)) {
                        continue;
                    }

                    const obstacle_radius = Math.max(0, Number(obs.r) || 0);

                    const clearance = obstacle_radius + player_radius + size * Math.SQRT1_2;

                    // Restrict work to the obstacle's local bounding box.
                    const minGX = Math.max(0, Math.floor((obs.x - clearance) / size));

                    const maxGX = Math.min(cols - 1, Math.floor((obs.x + clearance) / size));

                    const minGY = Math.max(0, Math.floor((obs.y - clearance) / size));

                    const maxGY = Math.min(rows - 1, Math.floor((obs.y + clearance) / size));

                    for (let gx = minGX; gx <= maxGX; gx++) {
                        const cellX = (gx + 0.5) * size;
                        const dx = cellX - obs.x;

                        for (let gy = minGY; gy <= maxGY; gy++) {
                            const cellY = (gy + 0.5) * size;
                            const dy = cellY - obs.y;

                            if (Math.hypot(dx, dy) > clearance) {
                                continue;
                            }

                            this.cells.set(`${gx},${gy}`, false);
                        }
                    }
                }
            }

            // A* pathfinding.
            find_path() {
                this.path = [];
                this.index = 0;

                if (!this.me || !this.target || this.cells.size === 0) {
                    return null;
                }

                const start_key = this.location_to_grid(this.me);
                const target_key = this.location_to_grid(this.target);

                if (!this.cells.has(start_key) || !this.cells.has(target_key)) {
                    return null;
                }

                // Permit the start cell even if the player is overlapping
                // an obstacle, so the player can attempt to escape.
                const is_walkable = (key) => this.cells.has(key) && (key === start_key || this.cells.get(key) === true);

                if (start_key === target_key) {
                    this.path = [this.grid_to_location(start_key)];
                    return this.path;
                }

                if (!is_walkable(target_key)) {
                    return null;
                }

                // Octile distance heuristic for 8-direction movement.
                const heuristic = (key) => {
                    const a = this.grid_to_coords(key);
                    const b = this.grid_to_coords(target_key);

                    const dx = Math.abs(a.x - b.x);
                    const dy = Math.abs(a.y - b.y);

                    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
                };

                // Min-heap: node with the smallest f score comes first.
                const heap = [];

                const heap_push = (node) => {
                    let i = heap.length;
                    heap.push(node);

                    while (i > 0) {
                        const parent = (i - 1) >> 1;

                        if (heap[parent].f <= node.f) {
                            break;
                        }

                        heap[i] = heap[parent];
                        i = parent;
                    }

                    heap[i] = node;
                };

                const heap_pop = () => {
                    if (!heap.length) return null;

                    const first = heap[0];
                    const last = heap.pop();

                    if (heap.length > 0) {
                        let i = 0;

                        while (true) {
                            const left = i * 2 + 1;
                            const right = left + 1;

                            if (left >= heap.length) break;

                            let child = left;

                            if (right < heap.length && heap[right].f < heap[left].f) {
                                child = right;
                            }

                            if (heap[child].f >= last.f) {
                                break;
                            }

                            heap[i] = heap[child];
                            i = child;
                        }

                        heap[i] = last;
                    }

                    return first;
                };

                const came_from = new Map();
                const g_score = new Map();

                const closed = new Set();

                g_score.set(start_key, 0);

                heap_push({
                    key: start_key,
                    g: 0,
                    f: heuristic(start_key),
                });

                const directions = [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                    [1, 1],
                    [1, -1],
                    [-1, 1],
                    [-1, -1],
                ];

                while (heap.length > 0) {
                    const current = heap_pop();

                    // Ignore old entries for cells whose score improved.
                    if (current.g !== g_score.get(current.key)) {
                        continue;
                    }

                    if (closed.has(current.key)) {
                        continue;
                    }

                    // Target reached: reconstruct the path.
                    if (current.key === target_key) {
                        const path = [];
                        let key = target_key;

                        while (key !== start_key) {
                            path.push(this.grid_to_location(key));

                            key = came_from.get(key);

                            if (key === undefined) {
                                this.path = [];
                                return null;
                            }
                        }

                        path.push(this.grid_to_location(start_key));
                        path.reverse();

                        this.path = path;
                        this.index = 0;

                        return this.path;
                    }

                    closed.add(current.key);

                    const { x: gx, y: gy } = this.grid_to_coords(current.key);

                    for (const [dx, dy] of directions) {
                        const nx = gx + dx;
                        const ny = gy + dy;
                        const next_key = `${nx},${ny}`;

                        if (!is_walkable(next_key)) {
                            continue;
                        }

                        if (closed.has(next_key)) {
                            continue;
                        }

                        const next_pos = this.grid_to_location(next_key);

                        // Restrict the search to the radius around the player.
                        if (Number.isFinite(this.search_radius) && this.calc_dist(next_pos, this.me) > this.search_radius) {
                            continue;
                        }

                        // Prevent diagonal movement through blocked corners.
                        if (dx !== 0 && dy !== 0) {
                            const side_x = `${gx + dx},${gy}`;
                            const side_y = `${gx},${gy + dy}`;

                            if (!is_walkable(side_x) || !is_walkable(side_y)) {
                                continue;
                            }
                        }

                        const step_cost = dx !== 0 && dy !== 0 ? Math.SQRT2 : 1;

                        const tentative_g = current.g + step_cost;
                        const previous_g = g_score.get(next_key) ?? Infinity;

                        if (tentative_g >= previous_g) {
                            continue;
                        }

                        came_from.set(next_key, current.key);
                        g_score.set(next_key, tentative_g);

                        heap_push({
                            key: next_key,
                            g: tentative_g,
                            f: tentative_g + heuristic(next_key),
                        });
                    }
                }

                // No reachable route found.
                this.path = [];
                this.index = 0;

                return null;
            }

            // Calculate the movement bitmask for your existing controller.
            get_next_move(me) {
                if (!this.path.length) {
                    return DIRECTION.STOP;
                }

                const player_x = Math.floor(me.x / this.cell_size);
                const player_y = Math.floor(me.y / this.cell_size);

                // Skip waypoints as soon as their tiles are reached.
                while (this.index < this.path.length) {
                    const waypoint = this.path[this.index];

                    const tx = Math.floor(waypoint.x / this.cell_size);
                    const ty = Math.floor(waypoint.y / this.cell_size);

                    if (player_x === tx && player_y === ty) {
                        this.index++;
                    } else {
                        break;
                    }
                }

                if (this.index >= this.path.length) {
                    return DIRECTION.STOP;
                }

                const waypoint = this.path[this.index];

                const target_x = Math.floor(waypoint.x / this.cell_size);
                const target_y = Math.floor(waypoint.y / this.cell_size);

                let move = DIRECTION.STOP;

                if (player_x < target_x) move |= DIRECTION.RIGHT;
                if (player_x > target_x) move |= DIRECTION.LEFT;

                if (player_y > target_y) move |= DIRECTION.UP;
                if (player_y < target_y) move |= DIRECTION.DOWN;

                return move;
            }
        }

        function get_pathfinder_obstacles() {
            // Lazily initialize static map resources.
            if (resources === null) {
                const map_data = world?.[vars.map];

                resources = Array.isArray(map_data)
                    ? map_data
                          .filter((e) => e && MAP_R[e[1]])
                          .map((e) => ({
                              x: e[3] * 100 + 50,
                              y: e[4] * 100 + 50,
                              r: MAP_R[e[1]][e[2]],
                              t: e[1],
                          }))
                    : [];
            }

            const obstacles = resources.slice();
            const units = world?.[vars.units];

            // Add placed objects that have collision radii.
            for (const name of Object.keys(RADUIS)) {
                if (name === "PLAYERS" || name === "PLOT") {
                    continue;
                }

                const type = ITEMS[name];

                if (type === undefined) {
                    continue;
                }

                const entities = units?.[type];

                if (!Array.isArray(entities)) {
                    continue;
                }

                const radius = RADUIS[name];

                for (const obj of entities) {
                    if (!obj || !Number.isFinite(obj.x) || !Number.isFinite(obj.y)) {
                        continue;
                    }

                    obstacles.push({
                        x: obj.x,
                        y: obj.y,
                        r: radius,
                    });
                }
            }

            return obstacles;
        }

        function update_pathfinder(timestamp) {
            const s = settings.pathfinder;

            if (!s.enabled) {
                if (PathFinder.was_enabled && s.last_move !== DIRECTION.STOP) {
                    sendAymen([packets.move, DIRECTION.STOP]);
                    s.last_move = DIRECTION.STOP;
                }

                PathFinder.was_enabled = false;
                return;
            }

            const just_enabled = !PathFinder.was_enabled;
            PathFinder.was_enabled = true;

            let move = DIRECTION.STOP;

            const target_x = s.x;
            const target_y = s.y;

            if (!Number.isFinite(target_x) || !Number.isFinite(target_y)) {
                s.enabled = false;
            } else if (s.advanced) {
                const target_key = `${target_x},${target_y}`;

                const needs_repath =
                    just_enabled || PathFinder.last_mode !== "advanced" || s.cached_target !== target_key || PathFinder.path.length === 0 || PathFinder.index >= PathFinder.path.length || timestamp - (s.last_repath || 0) >= 8000;

                if (needs_repath) {
                    // Convert tile coordinates to the center of the target tile.
                    PathFinder.set_target(target_x * 100 + 50, target_y * 100 + 50, me);

                    PathFinder.set_obstacles(get_pathfinder_obstacles());

                    PathFinder.calc_directions();

                    s.path = PathFinder.find_path();

                    s.cached_target = target_key;
                    s.last_repath = timestamp;
                }

                PathFinder.last_mode = "advanced";

                if (PathFinder.path.length > 0) {
                    // This updates the waypoint index and returns the bitmask.
                    move = PathFinder.get_next_move(me);
                } else {
                    console.warn("Pathfinder: no path found.");
                    s.enabled = false;
                }
            } else {
                PathFinder.last_mode = "basic";

                // Basic movement also compares TILE coordinates.
                const x = Math.floor(me.x / 100);
                const y = Math.floor(me.y / 100);

                if (x < target_x) move |= DIRECTION.RIGHT;
                if (x > target_x) move |= DIRECTION.LEFT;

                if (y > target_y) move |= DIRECTION.UP;
                if (y < target_y) move |= DIRECTION.DOWN;
            }

            // Send movement ONCE, regardless of which pathfinding mode is used.
            if (move !== s.last_move) {
                sendAymen([packets.move, move]);
                s.last_move = move;
            }

            if (move === DIRECTION.STOP) {
                s.enabled = false;
                PathFinder.was_enabled = false;
                gui.update();
            }
        }

        const PathFinder = new Advanced_Pathfinder(20000, 50);

        const calcDist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y),
            sleep = async (ms) => new Promise((res) => setTimeout(res, ms)),
            get_num_in_range = ({ min, max }) => Math.round(min + Math.random() * (max - min)),
            calcAngle = (me, t) => (Math.atan2(t.y - me.y, t.x - me.x) + PI2M) % PI2M,
            void_function = () => {},
            get_range = (r) => {
                switch (r) {
                    case ItemType.WOOD_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.STONE_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.GOLD_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.DIAMOND_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.AMETHYST_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.REIDITE_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.DRAGON_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.LAVA_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.CURSED_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.PIRATE_SWORD:
                        return pirate_range + (me.fly ? 20 : 0);

                    case ItemType.IRON_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.COPPER_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.TOPAZ_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.AQUAMARINE_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.RUBY_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.COAL_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.EMERALD_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.JADE_SWORD:
                        return sword_range + (me.fly ? 20 : 0);
                    case ItemType.SAPPHIRE_SWORD:
                        return sword_range + (me.fly ? 20 : 0);

                    case ItemType.WOOD_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.STONE_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.GOLD_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.DIAMOND_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.AMETHYST_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.REIDITE_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.DRAGON_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.LAVA_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.CRAB_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);

                    case ItemType.IRON_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.COPPER_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.TOPAZ_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.AQUAMARINE_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.RUBY_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.COAL_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.EMERALD_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.JADE_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);
                    case ItemType.SAPPHIRE_SPEAR:
                        return spear_range + (me.fly ? 18 : 0);

                    case ItemType.WOOD_BOW:
                        return bow_range;
                    case ItemType.STONE_BOW:
                        return bow_range;
                    case ItemType.GOLD_BOW:
                        return bow_range;
                    case ItemType.DIAMOND_BOW:
                        return bow_range;
                    case ItemType.AMETHYST_BOW:
                        return bow_range;
                    case ItemType.REIDITE_BOW:
                        return bow_range;
                    case ItemType.DRAGON_BOW:
                        return bow_range;

                    case ItemType.IRON_BOW:
                        return bow_range;
                    case ItemType.COPPER_BOW:
                        return bow_range;
                    case ItemType.TOPAZ_BOW:
                        return bow_range;
                    case ItemType.AQUAMARINE_BOW:
                        return bow_range;
                    case ItemType.RUBY_BOW:
                        return bow_range;
                    case ItemType.COAL_BOW:
                        return bow_range;
                    case ItemType.EMERALD_BOW:
                        return bow_range;
                    case ItemType.JADE_BOW:
                        return bow_range;
                    case ItemType.SAPPHIRE_BOW:
                        return bow_range;

                    default:
                        return 0;
                }
            },
            format_number = (num) => {
                if (num < 1_000) return num.toString();
                if (num < 1_000_000) return `${(num / 1_000).toFixed(2).replace(/\.?0+$/, "")}k`;
                if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}m`;
                if (num < 1_000_000_000_000) return `${(num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}b`;
                return `${(num / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, "")}t`;
            };

        function loadSettings() {
            try {
                if (localStorage.getItem("settings")) {
                    const s = JSON.parse(localStorage.getItem("settings"));
                    s.aimbot.enabled = false;
                    s.auto_spike.enabled = false;
                    s.auto_door.enabled = false;
                    s.steal_chest.enabled = false;
                    settings = s;
                    return true;
                }
            } catch {}
            return false;
        }
        function saveSettings() {
            localStorage.setItem("settings", JSON.stringify(settings));
        }

        const canvas = document.querySelector("canvas"),
            ctx = canvas.getContext("2d"),
            PI2M = 2 * window.Math.PI,
            sword_range = 135,
            spear_range = 195,
            pirate_range = 140,
            wrench_range = 110,
            bow_range = 1500;

        let vars = null,
            me = null,
            gui = null,
            changing = false,
            resources = null;

        const sell_ids = {
            BREAD: 16,
            SANDWICH: 15,
            MEAT: 13,
            COOKIE: 12,
            CAKE: 11,
            SPIKE: 35,
        };

        let settings = {
            pathfinder: {
                enabled: false,
                draw: true,
                k: "KeyP",
                type: "press",
                x: null,
                y: null,
                advanced: true,
                last_move: null,

                target: {
                    x: null,
                    y: null,
                },
                path: null,
            },
            show_hit_boxes: {
                enabled: false,
                draw: true,
                k: "Numpad3",
                type: "press",
            },
            show_range: {
                enabled: false,
                draw: true,
                k: "Numpad2",
                type: "press",
            },
            auto_respawn: {
                enabled: false,
                draw: true,
                k: "Numpad0",
                type: "press",
            },
            // timers: {
            //     orange_gem: null,
            //     emerald: null,
            //     bandage: null,
            // },
            auto_land: {
                last: -1,
                v: 0,
                enabled: false,
                draw: true,
                k: "Numpad1",
                type: "press",
                active: false,
            },
            auto_spike: {
                k: "Space",
                type: "hold",
                enabled: false,
                cd: 50,
                last: -1,
                target: null,
                draw: true,
            },
            auto_door: {
                k: "KeyC",
                type: "hold",
                enabled: false,
                cd: 50,
                last: -1,
                target: null,
                draw: true,
            },
            drop_sword: {
                k: "KeyV",
                type: "hold",
                enabled: false,
                cd: 200,
                last: -1,
                draw: true,
            },
            aimbot: {
                k: "KeyF",
                type: "press",
                enabled: false,
                cd: 10,
                last: -1,
                target: null,
                attack: false,
                angle: null,
                org_angle: 0,
                draw: true,
            },
            hide_afk: {
                k: "Backspace",
                enabled: false,
                set: false,
                type: "press",
                draw: true,
            },
            steal_chest: {
                k: "KeyR",
                enabled: false,
                type: "press",
                draw: true,
                cd: 50,
                last: -1,
            },
            auto_sell: {
                k: "KeyL",
                enabled: true,
                type: "press",
                draw: true,
                cd: 50,
                last: -1,
            },
        };
        loadSettings();
        window.settings = settings;

        const packets = {
            move: 2,
            equipe: 5,
            angle: 4,
            attack: 3,
            stop_attack: 46,
            place: 33,
            drop: 6,
            take_chest: 8,
            sell: 32,
        };
        const DIRECTION = {
            STOP: 0,
            LEFT: 1,
            RIGHT: 2,
            DOWN: 4,
            UP: 8,
        };

        const ItemType = {
            HAND: 0,
            WOOD_SWORD: 1,
            STONE_SWORD: 2,
            GOLD_SWORD: 3,
            DIAMOND_SWORD: 4,
            AMETHYST_SWORD: 5,
            REIDITE_SWORD: 6,
            DRAGON_SWORD: 7,
            LAVA_SWORD: 8,
            CURSED_SWORD: 9,
            PIRATE_SWORD: 10,
            WOOD_SPEAR: 11,
            STONE_SPEAR: 12,
            GOLD_SPEAR: 13,
            DIAMOND_SPEAR: 14,
            AMETHYST_SPEAR: 15,
            REIDITE_SPEAR: 16,
            DRAGON_SPEAR: 17,
            LAVA_SPEAR: 18,
            CRAB_SPEAR: 19,
            WOOD_SHIELD: 20,
            STONE_SHIELD: 21,
            GOLD_SHIELD: 22,
            DIAMOND_SHIELD: 23,
            AMETHYST_SHIELD: 24,
            REIDITE_SHIELD: 25,
            WOOD_BOW: 26,
            STONE_BOW: 27,
            GOLD_BOW: 28,
            DIAMOND_BOW: 29,
            AMETHYST_BOW: 30,
            REIDITE_BOW: 31,
            DRAGON_BOW: 32,
            WAND1: 33,
            WAND2: 34,
            WOOD_ARROW: 247,
            STONE_ARROW: 248,
            GOLD_ARROW: 249,
            DIAMOND_ARROW: 250,
            AMETHYST_ARROW: 251,
            REIDITE_ARROW: 252,
            DRAGON_ARROW: 253,
            WOOD_PICK: 355,
            STONE_PICK: 356,
            GOLD_PICK: 357,
            DIAMOND_PICK: 358,
            AMETHYST_PICK: 359,
            REIDITE_PICK: 360,
            EMERALD_PICK: 361,
            IRON_PICK: 362,
            TOPAZ_PICK: 363,
            AQUAMARINE_PICK: 364,
            SAPPHIRE_PICK: 365,
            COPPER_PICK: 366,
            COAL_PICK: 367,
            JADE_PICK: 368,
            RUBY_PICK: 369,
            STONE_SHOVEL: 48,
            GOLD_SHOVEL: 49,
            DIAMOND_SHOVEL: 50,
            AMETHYST_SHOVEL: 51,
            REIDITE_SHOVEL: 52,
            STONE_HAMMER: 53,
            GOLD_HAMMER: 54,
            DIAMOND_HAMMER: 55,
            AMETHYST_HAMMER: 56,
            REIDITE_HAMMER: 57,
            SUPER_HAMMER: 58,
            WATERING_CAN_EMPTY: 59,
            WATERING_CAN_FULL: 60,
            PITCHFORK: 61,
            GOLD_PITCHFORK: 62,
            BOOK: 63,
            WRENCH: 64,
            MACHETE: 65,
            BUCKET_FULL: 66,
            BUCKET_EMPTY: 67,
            WOOD_HELMET: 68,
            STONE_HELMET: 69,
            GOLD_HELMET: 70,
            DIAMOND_HELMET: 71,
            AMETHYST_HELMET: 72,
            REIDITE_HELMET: 73,
            DRAGON_HELMET: 74,
            LAVA_HELMET: 75,
            CRAB_HELMET: 76,
            DIAMOND_PROTECTION: 77,
            AMETHYST_PROTECTION: 78,
            REIDITE_PROTECTION: 79,
            DIVING_MASK: 80,
            SUPER_DIVING_SUIT: 81,
            CROWN_BLUE: 82,
            CROWN_GREEN: 83,
            CROWN_ORANGE: 84,
            EARMUFFS: 85,
            COAT: 86,
            CAP_SCARF: 87,
            FUR_HAT: 88,
            HOOD: 89,
            WINTER_HOOD: 90,
            PEASANT: 91,
            WINTER_PEASANT: 92,
            TURBAN1: 93,
            TURBAN2: 94,
            PILOT_HAT: 95,
            PIRATE_HAT: 96,
            EXPLORER_HAT: 97,
            WITCH_HAT: 98,
            CHRISTMAS_HAT: 99,
            ELF_HAT: 100,
            FLOWER_HAT: 101,
            BAG: 102,
            BERRY_SEED: 613,
            WHEAT_SEED: 614,
            PUMPKIN_SEED: 615,
            CARROT_SEED: 616,
            TOMATO_SEED: 793,
            THORNBUSH_SEED: 794,
            GARLIC_SEED: 122,
            WATERMELON_SEED: 239,
            ALOE_VERA_SEED: 370,
            EMERALD_HAMMER: 111,
            BERRY: 112,
            PUMPKIN: 113,
            WHEAT: 114,
            BREAD: 115,
            SANDWICH: 116,
            CARROT: 117,
            TOMATO: 118,
            THORNBUSH: 119,
            GARLIC: 120,
            WATERMELON: 121,
            ALOE_VERA: 371,
            CACTUS: 123,
            SUGAR_CAN: 124,
            CANDY: 125,
            COOKIE: 126,
            CAKE: 127,
            FISH: 128,
            FISH_COOKED: 129,
            MEAT: 130,
            COOKED_MEAT: 131,
            CRAB_STICK: 132,
            CRAB_LOOT: 133,
            BOTTLE_FULL: 134,
            BOTTLE_EMPTY: 135,
            FIRE: 136,
            BIG_FIRE: 137,
            FURNACE: 138,
            WORKBENCH: 139,
            CHEST: 140,
            BANDAGE: 141,
            FLOUR: 142,
            PAPER: 143,
            DIAMOND_CORD: 144,
            LOCK: 145,
            LOCK_PICK: 146,
            TOTEM: 147,
            BRIDGE: 148,
            ROOF: 149,
            TOWER: 150,
            PLOT: 151,
            WINDMILL: 152,
            RESURRECTION: 153,
            EMERALD_MACHINE: 154,
            STONE_EXTRACTOR: 155,
            GOLD_EXTRACTOR: 156,
            DIAMOND_EXTRACTOR: 157,
            AMETHYST_EXTRACTOR: 158,
            REIDITE_EXTRACTOR: 159,
            RUBY_EXTRACTOR: 380,
            SAPPHIRE_EXTRACTOR: 381,
            TOPAZ_EXTRACTOR: 382,
            AQUAMARINE_EXTRACTOR: 383,
            JADE_EXTRACTOR: 384,
            COAL_EXTRACTOR: 385,
            IRON_EXTRACTOR: 386,
            COPPER_EXTRACTOR: 387,
            EMERALD_EXTRACTOR: 795,
            BREAD_OVEN: 160,
            WELL: 161,
            BED: 162,
            SADDLE: 163,
            GARLAND: 164,
            BOAT: 165,
            HAWK: 166,
            SLED: 167,
            BOAR: 168,
            PLANE: 169,
            NIMBUS: 170,
            CRAB_BOSS: 171,
            BABY_MAMMOTH: 172,
            BABY_DRAGON: 173,
            BABY_LAVA: 174,
            WOOD_WALL: 175,
            STONE_WALL: 176,
            GOLD_WALL: 177,
            DIAMOND_WALL: 178,
            AMETHYST_WALL: 179,
            REIDITE_WALL: 180,
            WOOD_SPIKE: 181,
            STONE_SPIKE: 182,
            GOLD_SPIKE: 183,
            DIAMOND_SPIKE: 184,
            AMETHYST_SPIKE: 185,
            REIDITE_SPIKE: 186,
            WOOD_DOOR: 187,
            STONE_DOOR: 188,
            GOLD_DOOR: 189,
            DIAMOND_DOOR: 190,
            AMETHYST_DOOR: 191,
            REIDITE_DOOR: 192,
            WOOD_DOOR_SPIKE: 193,
            STONE_DOOR_SPIKE: 194,
            GOLD_DOOR_SPIKE: 195,
            DIAMOND_DOOR_SPIKE: 196,
            AMETHYST_DOOR_SPIKE: 197,
            REIDITE_DOOR_SPIKE: 198,
            DRAGON_CUBE: 199,
            DRAGON_ORB: 200,
            LAVA_CUBE: 201,
            LAVA_ORB: 202,
            GEM_GREEN: 203,
            GEM_ORANGE: 204,
            GEM_BLUE: 205,
            WINTER_PEASANT_FUR: 206,
            WINTER_HOOD_FUR: 207,
            PITCHFORK_PART: 208,
            PILOT_GLASSES: 209,
            DRAGON_HEART: 210,
            LAVA_HEART: 211,
            RABBIT_FUR: 212,
            WOLF_FUR: 213,
            CORD: 214,
            BOAR_FUR: 215,
            WINTER_FUR: 216,
            KRAKEN_FUR: 217,
            PIRANHA_SCALES: 218,
            MAMMOTH_FUR: 219,
            PENGUIN_FEATHER: 220,
            HAWK_FEATHER: 221,
            VULTURE_FEATHER: 222,
            SANDWORM_JUICE: 223,
            FIREFLY: 224,
            FLAME: 225,
            GROUND: 226,
            SAND: 227,
            ICE: 228,
            WOOD: 229,
            STONE: 230,
            GOLD: 231,
            DIAMOND: 232,
            AMETHYST: 233,
            REIDITE: 234,
            EMERALD: 235,
            AQUAMARINE: 372,
            RUBY: 373,
            COAL: 374,
            SAPPHIRE: 375,
            JADE: 376,
            COPPER: 377,
            TOPAZ: 378,
            IRON: 379,
            BOTTLE_FULL_2: 236,
            BOTTLE_FULL_3: 237,
            GOLD_WRENCH: 45,
            EMERALD_WRENCH: 339,
            EMERALD_SHOVEL: 42,
            BLACK_SHOVEL: 44,
            IRON_SHOVEL: 103,
            TOPAZ_SHOVEL: 104,
            EMERALD_SWORD: 47,
            EMERALD_SPEAR: 46,
            EMERALD_HELMET: 43,
            GOLD_HEART: 238,
            EMERALD_SPIKE: 246,
            EMERALD_DOOR_SPIKE: 254,
            RUBY_BOW: 35,
            SAPPHIRE_BOW: 796,
            TOPAZ_BOW: 797,
            AQUAMARINE_BOW: 388,
            JADE_BOW: 389,
            COAL_BOW: 390,
            IRON_BOW: 391,
            COPPER_BOW: 392,
            EMERALD_BOW: 393,
            RUBY_ARROW: 255,
            AQUAMARINE_ARROW: 2812,
            COAL_ARROW: 2813,
            EMERALD_ARROW: 2814,
            SAPPHIRE_ARROW: 2824,
            TOPAZ_ARROW: 2825,
            JADE_ARROW: 2826,
            IRON_ARROW: 2827,
            COPPER_ARROW: 2828,
            AQUAMARINE_HAMMER: 36,
            SAPPHIRE_HAMMER: 327,
            IRON_HAMMER: 328,
            COPPER_HAMMER: 329,
            COAL_HAMMER: 330,
            JADE_HAMMER: 331,
            TOPAZ_HAMMER: 332,
            RUBY_HAMMER: 333,
            COAL_SWORD: 105,
            COAL_HELMET: 106,
            AQUAMARINE_SWORD: 107,
            TOPAZ_SWORD: 315,
            SAPPHIRE_SWORD: 316,
            RUBY_SWORD: 317,
            JADE_SWORD: 318,
            IRON_SWORD: 319,
            COPPER_SWORD: 320,
            AQUAMARINE_HELMET: 108,
            TOPAZ_HELMET: 321,
            SAPPHIRE_HELMET: 322,
            RUBY_HELMET: 323,
            JADE_HELMET: 324,
            IRON_HELMET: 325,
            COPPER_HELMET: 326,
            COAL_SPEAR: 109,
            AQUAMARINE_SPEAR: 110,
            TOPAZ_SPEAR: 309,
            SAPPHIRE_SPEAR: 310,
            RUBY_SPEAR: 311,
            JADE_SPEAR: 312,
            IRON_SPEAR: 313,
            COPPER_SPEAR: 314,
            AQUAMARINE_SHOVEL: 301,
            TOPAZ_SHOVEL2: 337,
            SAPPHIRE_SHOVEL: 302,
            COPPER_SHOVEL: 304,
            COAL_SHOVEL: 305,
            JADE_SHOVEL: 306,
            RUBY_SHOVEL: 308,
            CROWN_EMERALD: 334,
            CROWN_WHITE: 335,
            CROWN_MIXED: 336,
            PARROT_TAMED: 338,
            WOOD_AXE: 340,
            RUBY_AXE: 354,
            JADE_AXE: 353,
            COAL_AXE: 352,
            COPPER_AXE: 351,
            SAPPHIRE_AXE: 350,
            AQUAMARINE_AXE: 349,
            TOPAZ_AXE: 348,
            IRON_AXE: 347,
            EMERALD_AXE: 346,
            REIDITE_AXE: 345,
            AMETHYST_AXE: 344,
            DIAMOND_AXE: 343,
            GOLD_AXE: 342,
            STONE_AXE: 341,
        };
        const ITEMS = {
            PLAYERS: 0,
            FIRE: 1,
            WORKBENCH: 2,
            SEED: 3,
            WALL: 4,
            SPIKE: 5,
            BIG_FIRE: 6,
            STONE_WALL: 7,
            GOLD_WALL: 8,
            DIAMOND_WALL: 9,
            WOOD_DOOR: 10,
            CHEST: 11,
            STONE_SPIKE: 12,
            GOLD_SPIKE: 13,
            DIAMOND_SPIKE: 14,
            STONE_DOOR: 15,
            GOLD_DOOR: 16,
            DIAMOND_DOOR: 17,
            FURNACE: 18,
            AMETHYST_WALL: 19,
            AMETHYST_SPIKE: 20,
            AMETHYST_DOOR: 21,
            RESURRECTION: 22,
            EMERALD_MACHINE: 23,
            EXTRACTOR_MACHINE_STONE: 24,
            EXTRACTOR_MACHINE_GOLD: 25,
            DIAMOND_EXTRACTOR: 26,
            EXTRACTOR_MACHINE_AMETHYST: 27,
            EXTRACTOR_MACHINE_REIDITE: 28,
            EXTRACTOR_MACHINE_RUBY: 92,
            EXTRACTOR_MACHINE_SAPPHIRE: 93,
            EXTRACTOR_MACHINE_TOPAZ: 94,
            EXTRACTOR_MACHINE_AQUAMARINE: 95,
            EXTRACTOR_MACHINE_JADE: 96,
            EXTRACTOR_MACHINE_COAL: 97,
            EXTRACTOR_MACHINE_IRON: 98,
            EXTRACTOR_MACHINE_COPPER: 99,
            EXTRACTOR_MACHINE_EMERALD: 103,
            TOTEM: 29,
            BRIDGE: 30,
            WHEAT_SEED: 31,
            WINDMILL: 32,
            PLOT: 33,
            BREAD_OVEN: 34,
            WELL: 35,
            PUMPKIN_SEED: 37,
            ROOF: 38,
            GARLIC_SEED: 39,
            THORNBUSH_SEED: 40,
            BED: 41,
            GARLAND: 42,
            TOMATO_SEED: 43,
            CARROT_SEED: 44,
            WOOD_DOOR_SPIKE: 45,
            STONE_DOOR_SPIKE: 46,
            GOLD_DOOR_SPIKE: 47,
            DIAMOND_DOOR_SPIKE: 48,
            AMETHYST_DOOR_SPIKE: 49,
            REIDITE_WALL: 50,
            REIDITE_DOOR: 51,
            REIDITE_SPIKE: 52,
            EMERALD_SPIKE: 101,
            REIDITE_DOOR_SPIKE: 53,
            EMERALD_DOOR_SPIKE: 102,
            WATERMELON_SEED: 54,
            ALOE_VERA_SEED: 55,
            WOOD_TOWER: 56,
            WOLF: 60,
            SPIDER: 61,
            FOX: 62,
            BEAR: 63,
            DRAGON: 64,
            PIRANHA: 65,
            KRAKEN: 66,
            CRAB: 67,
            FLAME: 68,
            LAVA_DRAGON: 69,
            BOAR: 70,
            CRAB_BOSS: 71,
            BABY_DRAGON: 72,
            BABY_LAVA: 73,
            HAWK: 74,
            VULTURE: 75,
            SAND_WORM: 76,
            BABY_MAMMOTH: 77,
            MAMMOTH: 78,
            WHEAT_MOB: 79,
            RABBIT: 80,
            TREASURE_CHEST: 81,
            DEAD_BOX: 82,
            PUMPKIN_MOB: 83,
            GARLIC_MOB: 84,
            THORNBUSH_MOB: 85,
            CRATE: 86,
            GIFT: 87,
            PENGUIN: 88,
            ALOE_VERA_MOB: 89,
            FIREFLY: 90,
            SPELL: 91,
        };
        const RADUIS = {
            PLOT: 45,
            TOTEM: 45,
            PLAYERS: 25,
            CHEST: 35,
            EMERALD_MACHINE: 60,

            WOOD_DOOR_SPIKE: 41,
            STONE_DOOR_SPIKE: 41,
            GOLD_DOOR_SPIKE: 41,
            DIAMOND_DOOR_SPIKE: 41,
            AMETHYST_DOOR_SPIKE: 41,
            REIDITE_DOOR_SPIKE: 41,
            EMERALD_DOOR_SPIKE: 41,

            SPIKE: 41,
            STONE_SPIKE: 41,
            GOLD_SPIKE: 41,
            DIAMOND_SPIKE: 41,
            AMETHYST_SPIKE: 41,
            REIDITE_SPIKE: 41,
            EMERALD_SPIKE: 41,

            WALL: 45,
            STONE_WALL: 45,
            GOLD_WALL: 45,
            DIAMOND_WALL: 45,
            AMETHYST_WALL: 45,
            REIDITE_WALL: 45,

            WOOD_DOOR: 45,
            STONE_DOOR: 45,
            GOLD_DOOR: 45,
            DIAMOND_DOOR: 45,
            AMETHYST_DOOR: 45,
            REIDITE_DOOR: 45,
        };

        const weapons = new Set([
            ItemType.WOOD_SWORD,
            ItemType.STONE_SWORD,
            ItemType.GOLD_SWORD,
            ItemType.DIAMOND_SWORD,
            ItemType.AMETHYST_SWORD,
            ItemType.REIDITE_SWORD,
            ItemType.DRAGON_SWORD,
            ItemType.LAVA_SWORD,
            ItemType.CURSED_SWORD,
            ItemType.PIRATE_SWORD,

            ItemType.IRON_SWORD,
            ItemType.COPPER_SWORD,
            ItemType.TOPAZ_SWORD,
            ItemType.AQUAMARINE_SWORD,
            ItemType.RUBY_SWORD,
            ItemType.COAL_SWORD,
            ItemType.EMERALD_SWORD,
            ItemType.JADE_SWORD,
            ItemType.SAPPHIRE_SWORD,

            ItemType.WOOD_SPEAR,
            ItemType.STONE_SPEAR,
            ItemType.GOLD_SPEAR,
            ItemType.DIAMOND_SPEAR,
            ItemType.AMETHYST_SPEAR,
            ItemType.REIDITE_SPEAR,
            ItemType.DRAGON_SPEAR,
            ItemType.LAVA_SPEAR,
            ItemType.CRAB_SPEAR,

            ItemType.IRON_SPEAR,
            ItemType.COPPER_SPEAR,
            ItemType.TOPAZ_SPEAR,
            ItemType.AQUAMARINE_SPEAR,
            ItemType.RUBY_SPEAR,
            ItemType.COAL_SPEAR,
            ItemType.EMERALD_SPEAR,
            ItemType.JADE_SPEAR,
            ItemType.SAPPHIRE_SPEAR,

            ItemType.WOOD_BOW,
            ItemType.STONE_BOW,
            ItemType.GOLD_BOW,
            ItemType.DIAMOND_BOW,
            ItemType.AMETHYST_BOW,
            ItemType.REIDITE_BOW,
            ItemType.DRAGON_BOW,

            ItemType.IRON_BOW,
            ItemType.COPPER_BOW,
            ItemType.TOPAZ_BOW,
            ItemType.AQUAMARINE_BOW,
            ItemType.RUBY_BOW,
            ItemType.COAL_BOW,
            ItemType.EMERALD_BOW,
            ItemType.JADE_BOW,
            ItemType.SAPPHIRE_BOW,
        ]);

        const bows = new Set([
            ItemType.WOOD_BOW,
            ItemType.STONE_BOW,
            ItemType.GOLD_BOW,
            ItemType.DIAMOND_BOW,
            ItemType.AMETHYST_BOW,
            ItemType.REIDITE_BOW,
            ItemType.DRAGON_BOW,

            ItemType.IRON_BOW,
            ItemType.COPPER_BOW,
            ItemType.TOPAZ_BOW,
            ItemType.AQUAMARINE_BOW,
            ItemType.RUBY_BOW,
            ItemType.COAL_BOW,
            ItemType.EMERALD_BOW,
            ItemType.JADE_BOW,
            ItemType.SAPPHIRE_BOW,
        ]);

        const sizes = {
            s: 70,
            m: 85,
            l: 95,
        };
        const MAP_R = {
            // f: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // p: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // s: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // re: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // plm: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // d: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // a: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // g: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // b: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // t: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },

            // m: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },

            // rub: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // aqu: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // coa: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },

            // cop: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // jad: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // sap: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            // top: {
            //     0: sizes.s,
            //     1: sizes.m,
            //     2: sizes.l,
            //     3: sizes.xl,
            // },
            f: {
                0: 140,
                1: 95,
                2: 95,
            },
            s: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            cs: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            re: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            c: {
                0: sizes.s - 10,
                1: sizes.m - 10,
                2: sizes.l - 10,
            },
            a: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            d: {
                0: sizes.s + 10,
                1: sizes.m + 10,
                2: sizes.l + 10,
            },
            plm: {
                0: sizes.s - 25,
                1: sizes.m - 25,
                2: sizes.l - 25,
            },
            b: {
                0: 95,
                1: 95,
                2: 85,
            },
            r: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },

            t: {
                0: 95,
                1: 95,
                2: 95,
            },
            p: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            g: {
                0: sizes.s + 20,
                1: sizes.m - 15,
                2: sizes.l + 20,
            },
            rub: {
                0: sizes.s - 5,
                1: sizes.m - 5,
                2: sizes.l - 5,
            },
            aqu: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            coa: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            fo: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            de: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            cop: {
                0: sizes.s - 5,
                1: sizes.m - 5,
                2: sizes.l - 5,
            },
            jad: {
                0: sizes.s - 5,
                1: sizes.m - 5,
                2: sizes.l - 5,
            },
            sap: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            top: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
            iro: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
            },
        };
        const noise = {
            inc_chance: 50,
            v: 0,
            max: 10,
            min: -10,
            gap: 20,
        };

        function can_build(me, item, angle) {
            let itemName = null;

            if (!resources) {
                window.resetWorld = false;
                resources = world[vars.map]
                    .filter((r) => MAP_R[r[1]])
                    .map((e) => {
                        const x = e[3] * 100 + 50,
                            y = e[4] * 100 + 50,
                            r = MAP_R[e[1]][e[2]],
                            t = e[1];

                        return { x, y, r, t };
                    });
            }

            for (const n of Object.keys(ITEMS))
                if (ITEMS[n] === item) {
                    itemName = n;
                    break;
                }

            if (!itemName) return false;

            const itemRadius = RADUIS[itemName];
            if (itemRadius == null) return false;

            const PLACE_DISTANCE = 120;

            const x = me.x + PLACE_DISTANCE * Math.cos(angle);
            const y = me.y + PLACE_DISTANCE * Math.sin(angle);

            for (const name of Object.keys(RADUIS)) {
                const type = ITEMS[name];

                if (type === undefined) continue;

                const radius = RADUIS[name];
                const entities = world?.[vars.units]?.[type];

                if (!entities) continue;

                for (const e of entities) {
                    // Don't collide with yourself
                    if (e.type == ITEMS.PLAYERS && e.pid === user.id) continue;

                    if (e.x == null || e.y == null) continue;

                    const dist = Math.hypot(x - e.x, y - e.y);

                    if (dist < itemRadius + radius) return false;
                }
            }

            for (const e of resources) {
                if (typeof e.x != "number" || typeof e.y != "number" || typeof e.r != "number") continue;

                const dist = Math.hypot(x - e.x, y - e.y);

                if (dist < itemRadius + e.r) return false;
            }

            return true;
        }

        function best_angle(me, item, angle = null) {
            const stepDeg = 1;
            const maxSteps = 60;

            const base = typeof settings.aimbot.angle == "number" ? settings.aimbot.angle : (angle ?? me.angle);
            const step = (stepDeg * Math.PI) / 180;

            // Try:
            for (let i = 0; i <= maxSteps; i++) {
                if (i === 0) {
                    if (can_build(me, item, base)) return base;
                } else {
                    const left = base - i * step;
                    const right = base + i * step;

                    if (can_build(me, item, left)) return left;

                    if (can_build(me, item, right)) return right;
                }
            }

            return null;
        }

        function get_closest_player(me, max) {
            let dist = max || Infinity;
            let closest = null;
            for (const t of world[vars.units][ITEMS.PLAYERS]) {
                if (t.pid == user.id || user[vars.team].includes(t.pid) || me.fly != t.fly || t.clothe == ItemType.WINTER_PEASANT) continue;
                const d = calcDist(me, t);

                if (d < dist) {
                    dist = d;
                    closest = t;
                }
            }

            return closest;
        }
        function get_closest_chest(me) {
            let dist = 100;
            let closest = null;
            for (const chest of world[vars.units][ITEMS.CHEST]) {
                if (chest.lock || !chest.extra || !chest.info) continue;
                const d = calcDist(me, chest);

                if (d < dist) {
                    dist = d;
                    closest = chest;
                }
            }

            return closest;
        }

        function randomize(original) {
            const roll = Math.random() * 100;
            let direction = roll > noise.inc_chance ? 1 : -1;

            noise.inc_chance = ((noise.v + 1) * 100) / noise.gap;

            noise.v = noise.v + Math.random() * (Math.random() * 5) * direction;

            return original + noise.v;
        }

        document.addEventListener("keydown", (k) => {
            if (changing || user[vars.cmdInput].open || user[vars.chatInput].open || (!user && user.id == 0)) return;
            for (const s of Object.values(settings)) {
                if (s.type == "press") continue;
                if (k.code == s.k) s.enabled = true;
            }
            // gui.update();
        });

        document.addEventListener("keyup", (k) => {
            if (changing || user[vars.cmdInput].open || user[vars.chatInput].open || (!user && user.id == 0)) return;
            for (const s of Object.values(settings)) if (k.code == s.k) s.enabled = s.type == "hold" ? false : !s.enabled;
            gui.update();
        });

        // script logic
        function run_time() {
            requestAnimationFrame(run_time);
            if (!window.user || !window.world || user.id == 0) return;

            const timestamp = Date.now();

            for (const p of world[vars.units][ITEMS.PLAYERS]) {
                if (p.pid == user.id) {
                    me = p;
                    break;
                }
            }
            if (!me) return;
            window.aymen = me;

            draw_ui();

            // timers
            if (me.action & STATE.HEAL) {
                // afk spots
                if (!(me.x > 5900 && me.y > 5200 && me.x < 7700 && me.y < 5200)) {
                }
            }

            // drop sword
            if (settings.drop_sword.enabled && timestamp - settings.drop_sword.last > settings.drop_sword.cd && weapons.has(me.right)) sendAymen([packets.drop, me.right]);

            // auto spike
            if (settings.auto_spike.enabled && timestamp - settings.auto_spike.last > settings.auto_spike.cd) {
                let spike, type;

                const amounts = user[vars.inv].n;
                if (amounts[ItemType.EMERALD_SPIKE]) ((spike = ItemType.EMERALD_SPIKE), (type = ITEMS.EMERALD_SPIKE));
                else if (amounts[ItemType.REIDITE_SPIKE]) ((spike = ItemType.REIDITE_SPIKE), (type = ITEMS.REIDITE_SPIKE));
                else if (amounts[ItemType.AMETHYST_SPIKE]) ((spike = ItemType.AMETHYST_SPIKE), (type = ITEMS.AMETHYST_SPIKE));
                else if (amounts[ItemType.DIAMOND_SPIKE]) ((spike = ItemType.DIAMOND_SPIKE), (type = ITEMS.DIAMOND_SPIKE));
                else if (amounts[ItemType.GOLD_SPIKE]) ((spike = ItemType.GOLD_SPIKE), (type = ITEMS.GOLD_SPIKE));
                else if (amounts[ItemType.STONE_SPIKE]) ((spike = ItemType.STONE_SPIKE), (type = ITEMS.STONE_SPIKE));
                else if (amounts[ItemType.WOOD_SPIKE]) ((spike = ItemType.WOOD_SPIKE), (type = ITEMS.SPIKE));

                if (spike) {
                    const adjust = best_angle(me, type);
                    if (adjust != null) {
                        const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);
                        user[vars.craft].preview = spike;

                        sendAymen([packets.angle, angle]);
                        sendAymen([packets.place, spike, angle, 0]);

                        settings.auto_spike.last = timestamp;
                        user[vars.craft].preview = -2;
                        settings.auto_spike.cd = get_num_in_range({ min: 50, max: 100 });
                    }
                }
            }
            // auto door
            if (settings.auto_door.enabled && timestamp - settings.auto_door.last > settings.auto_door.cd) {
                let spike, type;

                const amounts = user[vars.inv].n;
                if (amounts[ItemType.EMERALD_DOOR_SPIKE]) ((spike = ItemType.EMERALD_DOOR_SPIKE), (type = ITEMS.EMERALD_DOOR_SPIKE));
                else if (amounts[ItemType.STONE_DOOR_SPIKE]) ((spike = ItemType.STONE_DOOR_SPIKE), (type = ITEMS.STONE_DOOR_SPIKE));
                else if (amounts[ItemType.REIDITE_DOOR_SPIKE]) ((spike = ItemType.REIDITE_DOOR_SPIKE), (type = ITEMS.REIDITE_DOOR_SPIKE));
                else if (amounts[ItemType.AMETHYST_DOOR_SPIKE]) ((spike = ItemType.AMETHYST_DOOR_SPIKE), (type = ITEMS.AMETHYST_DOOR_SPIKE));
                else if (amounts[ItemType.DIAMOND_DOOR_SPIKE]) ((spike = ItemType.DIAMOND_DOOR_SPIKE), (type = ITEMS.DIAMOND_DOOR_SPIKE));
                else if (amounts[ItemType.GOLD_DOOR_SPIKE]) ((spike = ItemType.GOLD_DOOR_SPIKE), (type = ITEMS.GOLD_DOOR_SPIKE));
                else if (amounts[ItemType.WOOD_DOOR_SPIKE]) ((spike = ItemType.WOOD_DOOR_SPIKE), (type = ITEMS.WOOD_DOOR_SPIKE));

                if (spike) {
                    const adjust = best_angle(me, type);
                    if (adjust != null) {
                        const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);
                        user[vars.craft].preview = spike;

                        sendAymen([packets.angle, angle]);
                        sendAymen([packets.place, spike, angle, 0]);

                        settings.auto_door.last = timestamp;
                        user[vars.craft].preview = -2;
                        settings.auto_door.cd = get_num_in_range({ min: 50, max: 100 });
                    }
                }
            }
            // auto land
            if (me.vehicle && settings.auto_land.enabled) {
                if (me.fly) settings.auto_land.active = true;
                else if (settings.auto_land.active)
                    if (me.vehicle == ItemType.NIMBUS) {
                        settings.auto_land.active = false;
                        sendAymen([packets.equipe, me.vehicle]);
                    } else if (me.speed <= 100) {
                        settings.auto_land.active = false;
                        sendAymen([packets.equipe, me.vehicle]);
                    }
            }

            if (settings.aimbot.enabled) {
                if (weapons.has(me.right)) {
                    const target = get_closest_player(me, get_range(me.right));
                    if (target) {
                        settings.aimbot.target = target;
                        let angle = calcAngle(me, target);

                        if (settings.aimbot.org_angle != angle) {
                            settings.aimbot.org_angle = angle;

                            if (!bows.has(me.right)) angle = calcAngle(me, { x: randomize(target.x), y: randomize(target.y) });

                            settings.aimbot.angle = angle;
                        }

                        if (timestamp - settings.aimbot.last > settings.aimbot.cd) {
                            if (target) {
                                settings.aimbot.attack = me.action & STATE.ATTACK ? true : false;
                                sendAymen([packets.angle, Math.floor((((angle + PI2M) % PI2M) * 255) / PI2M)]);

                                if (!settings.aimbot.attack) {
                                    settings.aimbot.attack = true;
                                    sendAymen([packets.attack, Math.floor((((angle + PI2M) % PI2M) * 255) / PI2M)]);
                                }

                                settings.aimbot.last = timestamp;
                            } else if (settings.aimbot.attack) {
                                settings.aimbot.attack = false;
                                settings.aimbot.angle = null;
                                settings.aimbot.org_angle = null;
                                sendAymen([packets.stop_attack]);
                            }
                        }
                    } else {
                        if (settings.aimbot.attack) sendAymen([packets.stop_attack]);
                        settings.aimbot.attack = false;
                        settings.aimbot.angle = null;
                        settings.aimbot.org_angle = null;
                    }
                } else if (settings.aimbot.attack) {
                    if (settings.aimbot.attack) sendAymen([packets.stop_attack]);
                    settings.aimbot.attack = false;
                    settings.aimbot.angle = null;
                    settings.aimbot.org_angle = null;
                }
            } else if (settings.aimbot.attack) {
                if (settings.aimbot.attack) sendAymen([packets.stop_attack]);
                settings.aimbot.attack = false;
                settings.aimbot.angle = null;
                settings.aimbot.org_angle = null;
            }

            if (settings.hide_afk.enabled) {
                for (const p of world[vars.units][ITEMS.PLAYERS]) {
                    // prop
                    if (!vars.draw_player) for (const e in p) typeof p[e] == "function" && p[e].name == "draw_player"((vars.draw_player = e));

                    if (!p.drawhooked) {
                        p.originalDraw = p[vars.draw_player];
                        p.drawhooked = true;
                    }

                    if (p.right == ItemType.WOOD_SHIELD && p[vars.draw_player] != void_function) p[vars.draw_player] = void_function;
                    if (p.right != ItemType.WOOD_SHIELD && p[vars.draw_player] == void_function) p[vars.draw_player] = p.originalDraw;
                }
                settings.hide_afk.set = true;
            } else if (settings.hide_afk.set) {
                settings.hide_afk.set = false;
                for (const p of world[vars.units][ITEMS.PLAYERS]) p[vars.draw_player] = p.originalDraw;
            }

            if (settings.steal_chest.enabled && timestamp - settings.steal_chest.last > settings.steal_chest.cd && get_closest_chest(me)) {
                settings.steal_chest.last = timestamp;
                sendAymen([packets.take_chest, 1e8]);
            }
            if (settings.auto_sell.enabled && timestamp - settings.auto_sell.last > settings.auto_sell.cd) {
                settings.auto_sell.last = timestamp;
                const amounts = user[vars.inv].n;

                // if (amounts[ItemType.COOKED_MEAT]) sendAymen([packets.sell, amounts[ItemType.COOKED_MEAT], sell_ids.MEAT]);
                if (amounts[ItemType.COOKIE]) sendAymen([packets.sell, amounts[ItemType.COOKIE], sell_ids.COOKIE]);
                if (amounts[ItemType.SANDWICH]) sendAymen([packets.sell, amounts[ItemType.SANDWICH], sell_ids.SANDWICH]);
                if (amounts[ItemType.CAKE]) sendAymen([packets.sell, amounts[ItemType.CAKE], sell_ids.CAKE]);
                if (amounts[ItemType.BREAD]) sendAymen([packets.sell, amounts[ItemType.BREAD], sell_ids.BREAD]);
            }

            update_pathfinder(timestamp);
        }

        // ctx UI
        function draw_ui() {
            const cam_x = me.x + user[vars.cam].x,
                cam_y = me.y + user[vars.cam].y;

            const x = 10;
            const lineHeight = 24;
            let y = 290;

            ctx.save();

            ctx.font = "18px Baloo Paaji";
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";

            if (user[vars.inv].n[ItemType.BOTTLE_EMPTY]) {
                const txt = "Bottles: " + format_number(user[vars.inv].n[ItemType.BOTTLE_EMPTY]);

                ctx.strokeText(txt, x, y);

                ctx.fillStyle = "cyan";
                ctx.fillText(txt, x, y);
                y += lineHeight;
            }

            ctx.fillStyle = "red";

            for (const k in settings) {
                const s = settings[k];

                if (!s.draw || !s.enabled) continue;
                ctx.strokeText(k.replaceAll("_", " "), x, y);

                ctx.fillText(k.replaceAll("_", " "), x, y);

                y += lineHeight;
            }

            ctx.restore();

            if (settings.show_hit_boxes.enabled && resources) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;

                const r = RADUIS.PLAYERS;

                ctx.save();
                ctx.beginPath();
                ctx.arc(cam_x, cam_y, r, 0, PI2M);
                ctx.stroke();

                for (const { x, y, r, t } of resources) {
                    ctx.save();
                    ctx.translate(x + user[vars.cam].x, y + user[vars.cam].y);
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, PI2M);
                    ctx.stroke();
                    ctx.restore();
                }
                for (const { x, y } of [...world[vars.units][ITEMS.REIDITE_DOOR_SPIKE], ...world[vars.units][ITEMS.STONE_DOOR_SPIKE], ...world[vars.units][ITEMS.EMERALD_DOOR_SPIKE]]) {
                    ctx.save();
                    ctx.translate(x + user[vars.cam].x, y + user[vars.cam].y);
                    ctx.beginPath();
                    ctx.arc(0, 0, RADUIS.REIDITE_DOOR_SPIKE, 0, PI2M);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            if (settings.aimbot.enabled || settings.show_range.enabled) {
                ctx.save();

                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.6;

                if (me.right != ItemType.WRENCH && me.right != ItemType.GOLD_WRENCH) {
                    ctx.strokeStyle = get_closest_player(me, sword_range + (me.fly ? 20 : 0)) ? "lime" : "red";
                    ctx.beginPath();
                    ctx.arc(cam_x, cam_y, sword_range + (me.fly ? 20 : 0), 0, PI2M);
                    ctx.stroke();

                    ctx.strokeStyle = get_closest_player(me, pirate_range + (me.fly ? 20 : 0)) ? "lime" : "red";
                    ctx.beginPath();
                    ctx.arc(cam_x, cam_y, pirate_range + (me.fly ? 20 : 0), 0, PI2M);
                    ctx.stroke();

                    ctx.strokeStyle = get_closest_player(me, spear_range + (me.fly ? 18 : 0)) ? "lime" : "red";
                    ctx.beginPath();
                    ctx.arc(cam_x, cam_y, spear_range + (me.fly ? 18 : 0), 0, PI2M);
                    ctx.stroke();
                } else {
                    ctx.strokeStyle = "red";
                    ctx.beginPath();
                    ctx.arc(cam_x, cam_y, wrench_range, me.angle + -PI2M / 13, me.angle + PI2M / 13);
                    ctx.stroke();
                }

                ctx.restore();
            }

            if (user[vars.gauges].l < 1) {
                ctx.save();
                const h = Math.round(user[vars.gauges].l * 200);
                const t = h + "hp";

                ctx.font = "24px Baloo Paaji";
                ctx.textBaseline = "top";
                ctx.textAlign = "left";
                ctx.globalAlpha = 0.8;

                ctx.lineWidth = 4;
                ctx.strokeStyle = "black";

                ctx.fillStyle = h > 100 ? "lime" : h > 50 ? "orange" : "red";
                const r = ctx.measureText(t);

                ctx.strokeText(t, cam_x - r.width / 2, cam_y + 50);

                ctx.fillText(t, cam_x - r.width / 2, cam_y + 50);
                ctx.restore();
            }

            const doors = [...world[vars.units][ITEMS.REIDITE_DOOR_SPIKE], ...world[vars.units][ITEMS.STONE_DOOR_SPIKE], ...world[vars.units][ITEMS.EMERALD_DOOR_SPIKE]];

            if (settings.show_range.enabled)
                for (const door of doors) {
                    ctx.save();

                    ctx.lineWidth = 3;
                    ctx.strokeStyle = calcDist(me, door) <= wrench_range + 40 ? "lime" : "red";
                    ctx.beginPath();

                    const x = user[vars.cam].x + door.x,
                        y = user[vars.cam].y + door.y;

                    ctx.arc(x, y, 40, 0, PI2M);
                    ctx.stroke();

                    ctx.restore();
                }
        }

        function changeKeybind(obj) {
            changing = true;
            obj.k = "Set Keybind";
            gui.update();

            function handlePress(e) {
                obj.k = e.code;
                changing = false;
                gui.update();
                saveSettings();
                document.removeEventListener("keypress", handlePress);
            }
            document.addEventListener("keypress", handlePress);
        }

        function initUI() {
            gui = new window.GUI_MODULE();
            gui.start();

            gui.register({ type: "folder", label: "Visuals" });
            gui.register({ type: "folder", label: "Misc" });
            gui.register({ type: "folder", label: "Kits" });
            gui.register({ type: "folder", label: "Pathfinder" });
            gui.register({ type: "folder", label: "Others" });
            gui.register({ type: "folder", label: "Settings" });

            gui.register({ type: "checkbox", label: "Show Hit Boxes", folder: "Visuals", object: settings.show_hit_boxes, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Show Range", folder: "Visuals", object: settings.show_range, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Hide AFK", folder: "Visuals", object: settings.hide_afk, prop: "enabled" });

            gui.register({ type: "checkbox", label: "Auto Land", folder: "Misc", object: settings.auto_land, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Aimbot", folder: "Misc", object: settings.aimbot, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Steal Chest", folder: "Misc", object: settings.steal_chest, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Auto Sell", folder: "Misc", object: settings.auto_sell, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Auto Respawn", folder: "Misc", object: settings.auto_respawn, prop: "enabled" });

            gui.register({ type: "button", label: "Copy Free kit cmd", folder: "Kits", action: () => navigator.clipboard.writeText(`!kit_aob_eu freekit ${user.id}`) });
            gui.register({ type: "button", label: "Copy Tag kit cmd", folder: "Kits", action: () => navigator.clipboard.writeText(`!kit_aob_eu tag ${user.id}`) });

            gui.register({ type: "checkbox", label: "Pathfinder", folder: "Pathfinder", object: settings.pathfinder, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Advanced", folder: "Pathfinder", object: settings.pathfinder, prop: "advanced" });
            gui.register({ type: "display", label: "Target X:", folder: "Pathfinder", object: settings.pathfinder, prop: "x" });
            gui.register({ type: "display", label: "Target Y:", folder: "Pathfinder", object: settings.pathfinder, prop: "y" });

            gui.register({
                type: "button",
                label: "Set Pathfinder Location",
                folder: "Pathfinder",
                action: () => {
                    settings.pathfinder.x = Math.floor(me.x / 100);
                    settings.pathfinder.y = Math.floor(me.y / 100);
                    gui.update();
                    saveSettings();
                },
            });

            gui.register({ type: "button", label: "Respawn", folder: "Others", action: () => {} });

            for (const e in settings) {
                if (settings[e].k) {
                    gui.register({ type: "display", label: e.replaceAll("_", " "), folder: "Settings", object: settings[e], prop: "k" });
                    gui.register({ type: "button", label: "Set " + e.replaceAll("_", " ") + " key", folder: "Settings", action: () => changeKeybind(settings[e]) });
                }
            }
        }

        initUI();
        run_time();
    } catch (error) {
        if (window.debugErr) console.error(error);
    }
    window.debugErr = true;

    document.querySelector("#shop_market").style.opacity = 0.6;
    document.querySelector("#home_craft").style.opacity = 0.6;
    document.querySelector("#recipe_craft").style.opacity = 0.6;
})();
