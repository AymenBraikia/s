(() => {
    try {
        const calcDist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y),
            sleep = async (ms) => new Promise((res) => setTimeout(res, ms)),
            get_num_in_range = ({ min, max }) => Math.round(min + Math.random() * (max - min)),
            calcAngle = (me, t) => {
                let x1 = me.x,
                    y1 = me.y;
                let x2 = t.x,
                    y2 = t.y;

                // if (me.r && "x" in me.r) {
                //     x1 = me.r.x;
                //     y1 = me.r.y;
                // }
                // if (t.r && "x" in t.r) {
                //     x2 = t.r.x;
                //     y2 = t.r.y;
                // }

                return (Math.atan2(y2 - y1, x2 - x1) + PI2M) % PI2M;
            },
            void_function = () => {},
            get_range = (r) => {
                switch (r) {
                    case ItemType.WOOD_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.STONE_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.GOLD_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.DIAMOND_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.AMETHYST_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.REIDITE_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.DRAGON_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.LAVA_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.CURSED_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.PIRATE_SWORD:
                        return pirate_range + (me[vars.fly] ? 20 : 0);

                    case ItemType.IRON_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.COPPER_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.TOPAZ_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.AQUAMARINE_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.RUBY_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.COAL_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.EMERALD_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.JADE_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);
                    case ItemType.SAPPHIRE_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);

                    case ItemType.WOOD_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.STONE_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.GOLD_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.DIAMOND_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.AMETHYST_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.REIDITE_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.DRAGON_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.LAVA_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.CRAB_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);

                    case ItemType.IRON_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.COPPER_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.TOPAZ_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.AQUAMARINE_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.RUBY_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.COAL_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.EMERALD_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.JADE_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);
                    case ItemType.SAPPHIRE_SPEAR:
                        return spear_range + (me[vars.fly] ? 18 : 0);

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
            };

        function loadSettings() {
            try {
                if (localStorage.getItem("settings")) {
                    const s = JSON.parse(localStorage.getItem("settings"));
                    s.aimbot.enabled = false;
                    s.auto_spike.enabled = false;
                    s.auto_wall.enabled = false;
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
            axe_range = 100,
            spear_range = 195,
            pirate_range = 140;

        let vars = null,
            world = null,
            client = null,
            user = null,
            me = null,
            gui = null,
            hidden = false,
            resources = null;
        const STATE = {
            DELETE: 1,
            HURT: 2,
            COLD: 4,
            HUNGER: 8,
            ATTACK: 16,
            HEAL: 32,
            WEB: 64,
            IDLE: 128,
            WALK: 256,
        };
        let settings = {
            auto_craft: {
                enabled: false,
                draw: true,
                k: "KeyE",
                type: "press",
                last: 0,
                id: null,
                cd: 50,
            },
            auto_respawn: {
                enabled: false,
                draw: true,
                k: "Numpad0",
                type: "press",
            },
            timers: {
                heal: false,
                next: null,
                enabled: true,
                draw: false,
            },
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
            auto_fire: {
                k: "KeyX",
                type: "hold",
                enabled: false,
                cd: 50,
                last: -1,
                target: null,
                draw: true,
            },
            auto_wall: {
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
                angle2: null,
                org_angle: 0,
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
        };
        // loadSettings();

        Aymen.settings = settings;

        const packets = {
            craft: 22,
            equipe: 6,
            angle: 24,
            attack: 7,
            stop_attack: 35,
            place: 25,
            drop: 2,
            take_chest: 18,
            put_chest: 29,
        };

        const ItemType = {
            FIRE: 204,
            BIG_FIRE: 209,
            BOOK: 46,
            WOOD_WALL: 264,

            WOOD_SPIKE: 262,
            STONE_SPIKE: 270,
            GOLD_SPIKE: 271,
            DIAMOND_SPIKE: 272,
            AMETHYST_SPIKE: 214,
            REIDITE_SPIKE: 329,

            WOOD_AXE: 167,
            STONE_AXE: 168,
            GOLD_AXE: 169,
            DIAMOND_AXE: 170,
            AMETHYST_AXE: 171,
            REIDITE_AXE: 172,
            EMERALD_AXE: 173,

            WOOD_SWORD: 103,
            STONE_SWORD: 0,
            GOLD_SWORD: 5,
            DIAMOND_SWORD: 6,
            AMETHYST_SWORD: 48,
            REIDITE_SWORD: 28,
            EMERALD_SWORD: 110,
            DRAGON_SWORD: 108,
            LAVA_SWORD: 109,
            PIRATE_SWORD: 10,

            WOOD_SPEAR: 12,
            STONE_SPEAR: 13,
            GOLD_SPEAR: 14,
            DIAMOND_SPEAR: 15,
            AMETHYST_SPEAR: 60,
            REIDITE_SPEAR: 61,
            EMERALD_SPEAR: 19,
            DRAGON_SPEAR: 16,
            LAVA_SPEAR: 17,
            CRAB_SPEAR: 18,
        };
        const ITEMS = {
            PLAYERS: 0,
            WOOD_WALL: 4,
            STONE_WALL: 7,
            GOLD_WALL: 8,
            DIAMOND_WALL: 9,
            AMETHYST_WALL: 19,
            REIDITE_WALL: 59,

            WOOD_SPIKE: 5,
            STONE_SPIKE: 12,
            GOLD_SPIKE: 13,
            DIAMOND_SPIKE: 14,
            AMETHYST_SPIKE: 20,
            REIDITE_SPIKE: 61,

            WOOD_DOOR: 10,
            STONE_DOOR: 15,
            GOLD_DOOR: 16,
            DIAMOND_DOOR: 17,
            AMETHYST_DOOR: 21,
            REIDITE_DOOR: 60,

            WOOD_DOOR_SPIKE: 54,
            STONE_DOOR_SPIKE: 55,
            GOLD_DOOR_SPIKE: 56,
            DIAMOND_DOOR_SPIKE: 57,
            AMETHYST_DOOR_SPIKE: 58,
            REIDITE_DOOR_SPIKE: 62,

            WORKBENCH: 2,
            CHEST: 11,
            OVEN: 43,
            TOTEM: 38,
            FIRE: 1,
            BIG_FIRE: 6,
            RESURECTION_STONE: 22,
            EMERALD_MACHINE: 23,

            EXTRACTOR_STONE: 24,
            EXTRACTOR_GOLD: 25,
            EXTRACTOR_DIAMOND: 26,
            EXTRACTOR_AMETHYST: 27,
            EXTRACTOR_REIDITE: 28,

            ROOF: 47,
            STONE_ROOF: 68,
            BRIDGE: 39,
            STONE_BRIDGE: 67,
            TOWER: 65,
            PLOT: 42,
        };
        const RADUIS = {
            PLOT: 50,
            TOTEM: 50,
            FIRE: 30,
            BIG_FIRE: 40,
            PLAYERS: 25,
            CHEST: 35,
            EMERALD_MACHINE: 60,

            WOOD_DOOR_SPIKE: 43,
            STONE_DOOR_SPIKE: 43,
            GOLD_DOOR_SPIKE: 43,
            DIAMOND_DOOR_SPIKE: 43,
            AMETHYST_DOOR_SPIKE: 43,
            REIDITE_DOOR_SPIKE: 43,
            EMERALD_DOOR_SPIKE: 43,

            WOOD_SPIKE: 43,
            STONE_SPIKE: 43,
            GOLD_SPIKE: 43,
            DIAMOND_SPIKE: 43,
            AMETHYST_SPIKE: 43,
            REIDITE_SPIKE: 43,
            EMERALD_SPIKE: 43,

            WOOD_WALL: 50,
            STONE_WALL: 50,
            GOLD_WALL: 50,
            DIAMOND_WALL: 50,
            AMETHYST_WALL: 50,
            REIDITE_WALL: 50,

            WOOD_DOOR: 50,
            STONE_DOOR: 50,
            GOLD_DOOR: 50,
            DIAMOND_DOOR: 50,
            AMETHYST_DOOR: 50,
            REIDITE_DOOR: 50,

            TOWER: 50,
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
            // ItemType.CURSED_SWORD,
            ItemType.PIRATE_SWORD,

            // ItemType.IRON_SWORD,
            // ItemType.COPPER_SWORD,
            // ItemType.TOPAZ_SWORD,
            // ItemType.AQUAMARINE_SWORD,
            // ItemType.RUBY_SWORD,
            // ItemType.COAL_SWORD,
            ItemType.EMERALD_SWORD,
            // ItemType.JADE_SWORD,
            // ItemType.SAPPHIRE_SWORD,

            ItemType.WOOD_SPEAR,
            ItemType.STONE_SPEAR,
            ItemType.GOLD_SPEAR,
            ItemType.DIAMOND_SPEAR,
            ItemType.AMETHYST_SPEAR,
            ItemType.REIDITE_SPEAR,
            ItemType.DRAGON_SPEAR,
            ItemType.LAVA_SPEAR,
            ItemType.CRAB_SPEAR,

            // ItemType.IRON_SPEAR,
            // ItemType.COPPER_SPEAR,
            // ItemType.TOPAZ_SPEAR,
            // ItemType.AQUAMARINE_SPEAR,
            // ItemType.RUBY_SPEAR,
            // ItemType.COAL_SPEAR,
            ItemType.EMERALD_SPEAR,
            // ItemType.JADE_SPEAR,
            // ItemType.SAPPHIRE_SPEAR,

            ItemType.WOOD_AXE,
            ItemType.STONE_AXE,
            ItemType.GOLD_AXE,
            ItemType.DIAMOND_AXE,
            ItemType.AMETHYST_AXE,
            ItemType.REIDITE_AXE,
            ItemType.EMERALD_AXE,

            // ItemType.IRON_AXE,
            // ItemType.COPPER_AXE,
            // ItemType.TOPAZ_AXE,
            // ItemType.AQUAMARINE_AXE,
            // ItemType.RUBY_AXE,
            // ItemType.COAL_AXE,
            // ItemType.EMERALD_AXE,
            // ItemType.JADE_AXE,
            // ItemType.SAPPHIRE_AXE,
        ]);

        const sizes = {
            xs: 50,
            s: 55,
            m: 70,
            l: 75,
            xl: 95,
            xxl: 95,
        };
        const MAP_R = {
            f: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            s: {
                0: sizes.xxl,
                1: sizes.xl - 10,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            cs: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            re: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            c: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            a: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            d: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            plm: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            b: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            r: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },

            t: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            p: {
                0: sizes.xxl - 20,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            g: {
                0: sizes.xxl,
                1: sizes.xl - 10,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            rub: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            aqu: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            coa: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            fo: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            de: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            cop: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            jad: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            sap: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            top: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
            },
            iro: {
                0: sizes.xxl,
                1: sizes.xl,
                2: sizes.l,
                3: sizes.m,
                4: sizes.s,
                5: sizes.xs,
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
                    if (e.type == ITEMS.PLAYERS && e[vars.pid] === user.id) continue;

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
                if (t[vars.pid] == user.id || user[vars.team].includes(t[vars.pid]) || me[vars.fly] != t[vars.fly]) continue;
                const d = calcDist(me, t);

                if (d < dist) {
                    dist = d;
                    closest = t;
                }
            }

            return closest;
        }
        function get_closest_chest(me) {
            const limit = 180;
            const closest = [];
            for (const chest of world[vars.units][ITEMS.CHEST]) {
                if (chest.lock || !chest.action) continue;

                const d = calcDist(me, chest);

                if (d < limit) closest.push(chest);
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
            if (!client[vars._ws] || client[vars._ws].readyState != WebSocket.OPEN || document.getElementById("chat_block").style.display == "inline-block" || document.getElementById("commandMainBox").style.display == "inline-block")
                return;
            for (const s of Object.values(settings)) {
                if (s.type == "press") continue;
                if (k.code == s.k) s.enabled = true;
            }
            gui.update();
        });

        document.addEventListener("keyup", (k) => {
            if (!client[vars._ws] || client[vars._ws].readyState != WebSocket.OPEN || document.getElementById("chat_block").style.display == "inline-block" || document.getElementById("commandMainBox").style.display == "inline-block")
                return;

            if (k.code == "Escape") {
                gui.hide();
                hidden = !hidden;
            } else for (const s of Object.values(settings)) if (k.code == s.k) s.enabled = s.type == "hold" ? false : !s.enabled;
            gui.update();
        });

        // script logic
        function run_time() {
            requestAnimationFrame(run_time);
            if (!world || !client || !user || !vars) {
                world = Aymen.world;
                client = Aymen.client;
                user = Aymen.user;
                vars = Aymen.vars;
                return;
            }

            if (!client[vars._ws] || client[vars._ws].readyState != WebSocket.OPEN) return;

            function sendAymen(msg) {
                if (client[vars._ws] && client[vars._ws].readyState == WebSocket.OPEN) client[vars._ws].send(JSON.stringify(msg));
            }

            const timestamp = Date.now();

            if (!client[vars._ws].noice) {
                client[vars._ws].noice = true;

                client[vars._ws].addEventListener("message", packet_handler);

                Aymen.send = client[vars._ws].send;
                client[vars._ws].send = new Proxy(Aymen.send, {
                    apply(target, thisArg, args) {
                        if (typeof args[0] == "string") {
                            const pkt = JSON.parse(args[0]);
                            window.logger && Aymen.log(pkt);
                            if (pkt[0] == packets.craft) {
                                me.right != ItemType.BOOK && sendAymen([packets.equipe, ItemType.BOOK]);
                                settings.auto_craft.id = pkt[1];
                            }
                        }

                        return Reflect.apply(target, thisArg, args);
                    },
                });
            }

            for (const p of world[vars.units][ITEMS.PLAYERS])
                if (p[vars.pid] == user.id) {
                    me = p;
                    break;
                }

            // me = world[vars.fast_units][user.id * 1e3];
            if (!me) return;
            Aymen.me = me;

            if (!hidden) draw_ui();

            if (world[vars.map]) {
                Aymen.ress = [];

                for (const r of world[vars.map]) {
                    if (calcDist(me, { x: r[3] * 100 + 50, y: r[4] * 100 + 50 }) < (Aymen.dist || 150)) Aymen.ress.push(r);
                }
            }

            // auto craft
            if (settings.auto_craft.enabled && timestamp - settings.auto_craft.last > settings.auto_craft.cd) {
                settings.auto_craft.last = timestamp;
                sendAymen([packets.craft, settings.auto_craft.id]);
            }

            // drop sword
            if (settings.drop_sword.enabled && timestamp - settings.drop_sword.last > settings.drop_sword.cd && weapons.has(me.right)) {
                settings.drop_sword.last = timestamp;
                sendAymen([packets.drop, me.right]);
            }

            // auto spike
            // if (settings.auto_spike.enabled && timestamp - settings.auto_spike.last > settings.auto_spike.cd) {
            if (settings.auto_spike.enabled && !user.build.wait && timestamp - settings.auto_spike.last > settings.auto_spike.cd) {
                let spike, type;

                const amounts = user[vars.inv][vars.n];
                if (amounts[ItemType.REIDITE_SPIKE]) ((spike = ItemType.REIDITE_SPIKE), (type = ITEMS.REIDITE_SPIKE));
                else if (amounts[ItemType.AMETHYST_SPIKE]) ((spike = ItemType.AMETHYST_SPIKE), (type = ITEMS.AMETHYST_SPIKE));
                else if (amounts[ItemType.DIAMOND_SPIKE]) ((spike = ItemType.DIAMOND_SPIKE), (type = ITEMS.DIAMOND_SPIKE));
                else if (amounts[ItemType.GOLD_SPIKE]) ((spike = ItemType.GOLD_SPIKE), (type = ITEMS.GOLD_SPIKE));
                else if (amounts[ItemType.STONE_SPIKE]) ((spike = ItemType.STONE_SPIKE), (type = ITEMS.STONE_SPIKE));
                else if (amounts[ItemType.WOOD_SPIKE]) ((spike = ItemType.WOOD_SPIKE), (type = ITEMS.SPIKE));

                if (spike) {
                    const adjust = best_angle(me, type);
                    if (adjust != null) {
                        const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);

                        sendAymen([packets.angle, angle]);
                        sendAymen([packets.place, spike, angle, 0]);

                        settings.auto_spike.last = timestamp;
                        settings.auto_spike.cd = get_num_in_range({ min: 50, max: 100 });
                    }
                }
            }
            // auto wall
            if (settings.auto_wall.enabled && !user.build.wait && timestamp - settings.auto_wall.last > settings.auto_wall.cd) {
                let wall, type;

                const amounts = user[vars.inv][vars.n];
                if (amounts[ItemType.WOOD_WALL]) ((wall = ItemType.WOOD_WALL), (type = ITEMS.WOOD_WALL));

                if (wall) {
                    const adjust = best_angle(me, type);
                    if (adjust != null) {
                        const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);

                        sendAymen([packets.angle, angle]);
                        sendAymen([packets.place, wall, angle, 0]);

                        settings.auto_wall.last = timestamp;
                        settings.auto_wall.cd = get_num_in_range({ min: 50, max: 100 });
                    }
                }
            }
            // auto fire
            if (settings.auto_fire.enabled && !user.build.wait && timestamp - settings.auto_fire.last > settings.auto_fire.cd) {
                let fire, type;

                const amounts = user[vars.inv][vars.n];
                if (amounts[ItemType.FIRE]) ((fire = ItemType.FIRE), (type = ITEMS.FIRE));
                else if (amounts[ItemType.BIG_FIRE]) ((fire = ItemType.BIG_FIRE), (type = ITEMS.BIG_FIRE));

                if (fire) {
                    const adjust = best_angle(me, type);
                    if (adjust != null) {
                        const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);

                        sendAymen([packets.angle, angle]);
                        sendAymen([packets.place, fire, angle, 0]);

                        settings.auto_fire.last = timestamp;
                        settings.auto_fire.cd = get_num_in_range({ min: 50, max: 100 });
                    }
                }
            }
            // auto land
            if (me[vars.vehicle] && settings.auto_land.enabled) {
                if (me[vars.fly]) settings.auto_land.active = true;
                else if (settings.auto_land.active)
                    if (me[vars.vehicle] == ItemType.NIMBUS) {
                        settings.auto_land.active = false;
                        sendAymen([packets.equipe, me[vars.vehicle]]);
                    } else if (me.speed <= 100) {
                        settings.auto_land.active = false;
                        sendAymen([packets.equipe, me[vars.vehicle]]);
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

                            settings.aimbot.angle2 = calcAngle(me, target);
                            angle = calcAngle(me, { x: randomize(target.x), y: randomize(target.y) });

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
                                settings.aimbot.angle2 = null;
                                settings.aimbot.org_angle = null;
                                sendAymen([packets.stop_attack]);
                            }
                        }
                    } else {
                        if (settings.aimbot.attack) sendAymen([packets.stop_attack]);
                        settings.aimbot.attack = false;
                        settings.aimbot.angle = null;
                        settings.aimbot.angle2 = null;
                        settings.aimbot.org_angle = null;
                    }
                } else if (settings.aimbot.attack) {
                    if (settings.aimbot.attack) sendAymen([packets.stop_attack]);
                    settings.aimbot.attack = false;
                    settings.aimbot.angle = null;
                    settings.aimbot.angle2 = null;
                    settings.aimbot.org_angle = null;
                }
            } else if (settings.aimbot.attack) {
                if (settings.aimbot.attack) sendAymen([packets.stop_attack]);
                settings.aimbot.attack = false;
                settings.aimbot.angle = null;
                settings.aimbot.angle2 = null;
                settings.aimbot.org_angle = null;
            }

            if (settings.steal_chest.enabled && timestamp - settings.steal_chest.last > settings.steal_chest.cd) {
                const chests = get_closest_chest(me);
                for (const chest of chests) {
                    sendAymen([packets.take_chest, chest[vars.pid], chest.id]);
                    settings.steal_chest.last = timestamp;
                }
            }
        }

        // function packet_handler(e) {
        //     const msg = e.data;

        //     if (typeof msg == "string") {
        //     } else {
        //         const data = new Uint8Array(msg);
        //         Aymen.log(data);
        //     }
        // }
        function packet_handler(event) {
            if (typeof event.data === "string") {
                const msg = JSON.parse(event.data);
                if (msg[0] === 3) {
                    // spawn
                    // const mode = msg[1]; // game mode
                    // const x = msg[3]; // spawn position X
                    // const y = msg[10]; // spawn position Y
                    // const time = msg[5]; // day/night time
                    const myId = msg[9]; // your player id
                    const unitMul = msg[7]; // units per player
                    const myUnit = myId * unitMul; // your unit id in entity updates (opcode 0/1)
                    // const players = msg[4]; // [{ i: id, n: name, l: level, ... }]

                    if (world[vars.fast_units][myUnit])
                        world[vars.fast_units][myUnit].gauges = {
                            life: 200,
                            food: 100,
                            cold: 100,
                            water: 100,
                            oxygen: 100,
                            heat: 0,
                            bandage: 0,
                        };
                    settings.timers.next = Date.now() + 5e3;
                }
                return;
            }

            // The game's own onmessage already XOR'd event.data in place, so only the transform is left.
            const b = new Uint8Array(event.data).slice(); // copy so the game's buffer isn't touched
            const b0 = b[0],
                b1 = b[1],
                s = b0 ^ b1;
            const rotl = (v, r) => ((v << (r & 7)) | (v >> (8 - (r & 7)))) & 255;

            for (let i = 2; i < b.length; i++) {
                const m = (b0 + i) & 255;
                switch (b0 % 4) {
                    case 0:
                        if (s === 0 || s === 3) b[i] = rotl(b[i] ^ m, 3);
                        else if (s === 1) b[i] ^= m;
                        else if (s === 5) b[i] = (b[i] ^ m) - m + b0;
                        else b[i] ^= ~m;
                        break;
                    case 1:
                        b[i] ^= rotl(b0, i + b1);
                        break;
                    case 2:
                        b[i] ^= i % 2 ? b1 : b0;
                        break;
                    case 3:
                        b[i] ^= (b0 * (i + 1)) ^ b1;
                        break;
                }
            }

            const data = b.slice(2); // data[0] = opcode, same array the game switches on
            switch (data[0]) {
                case 0:
                case 1:
                    // entity update
                    break;
                case 21:
                    break;
                case 25:
                    // dead
                    break;

                case 16:
                    // gauges update
                    if (me)
                        me.gauges = {
                            life: data[1],
                            food: data[2],
                            cold: data[3],
                            water: data[4],
                            oxygen: data[5],
                            heat: data[6],
                            bandage: data[7],
                        };
                    settings.timers.next = Date.now() + 5e3;
                    settings.timers.heal = !settings.timers.heal;
                    break;

                case 37:
                    me.hp = data[1] * 2;
                    break;
                case 38:
                    gauges.food = data[1];
                    break;
                case 39:
                    gauges.water = data[1];
                    break;
                case 55:
                    gauges.heat = data[1];
                    break;
                case 56:
                    gauges.cold = data[1];
                    break;
                case 71:
                    gauges.bandage = data[1];
                    break;
                default:
                    break;
            }
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

            ctx.fillStyle = "red";

            for (const k in settings) {
                const s = settings[k];

                if (!s.draw || !s.enabled) continue;
                ctx.strokeText(k.replaceAll("_", " "), x, y);

                ctx.fillText(k.replaceAll("_", " "), x, y);

                y += lineHeight;
            }

            ctx.restore();

            if (Aymen.show_hit_boxes && resources) {
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
            }

            if (me.hp) {
                ctx.save();
                const h = Math.round(me.hp);
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

            if (settings.timers.enabled) {
                ctx.save();
                const h = Math.round(settings.timers.next - Date.now());
                const t = (h / 1e3).toFixed(2) + "s";

                ctx.font = "24px Baloo Paaji";
                ctx.textBaseline = "top";
                ctx.textAlign = "left";
                ctx.globalAlpha = 0.8;

                ctx.lineWidth = 4;
                ctx.strokeStyle = "black";

                ctx.fillStyle = settings.timers.heal ? "lime" : "red";
                const r = ctx.measureText(t);

                ctx.strokeText(t, cam_x - r.width / 2, cam_y + 80);

                ctx.fillText(t, cam_x - r.width / 2, cam_y + 80);
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
            // gui.register({ type: "folder", label: "Others" });
            gui.register({ type: "folder", label: "Settings" });

            gui.register({ type: "checkbox", label: "Auto Land", folder: "Misc", object: settings.auto_land, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Aimbot", folder: "Misc", object: settings.aimbot, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Steal Chest", folder: "Misc", object: settings.steal_chest, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Auto Respawn", folder: "Misc", object: settings.auto_respawn, prop: "enabled" });

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

    document.querySelector("#shop_market").style.opacity = 0.75;
    document.querySelector("#home_craft").style.opacity = 0.75;
    document.querySelector("#recipe_craft").style.opacity = 0.75;
})();
