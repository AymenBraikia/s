(() => {
    try {
        const calcDist = (p1, p2) => {
                let x1 = p1.x,
                    y1 = p1.y;
                let x2 = p2.x,
                    y2 = p2.y;

                if (p1.r && "x" in p1.r) {
                    x1 = p1.r.x;
                    y1 = p1.r.y;
                }
                if (p2.r && "x" in p2.r) {
                    x2 = p2.r.x;
                    y2 = p2.r.y;
                }
                return Math.hypot(x2 - x1, y2 - y1);
            },
            sleep = async (ms) => new Promise((res) => setTimeout(res, ms)),
            get_num_in_range = ({ min, max }) => Math.round(min + Math.random() * (max - min)),
            calcAngle = (me, t) => {
                let x1 = me.x,
                    y1 = me.y;
                let x2 = t.x,
                    y2 = t.y;

                if (me.r && "x" in me.r) {
                    x1 = me.r.x;
                    y1 = me.r.y;
                }
                if (t.r && "x" in t.r) {
                    x2 = t.r.x;
                    y2 = t.r.y;
                }

                return (Math.atan2(y2 - y1, x2 - x1) + PI2M) % PI2M;
            },
            void_function = () => {},
            get_range = (r) => {
                switch (r) {
                    case ItemType.WOOD_SWORD:
                    case ItemType.STONE_SWORD:
                    case ItemType.GOLD_SWORD:
                    case ItemType.DIAMOND_SWORD:
                    case ItemType.AMETHYST_SWORD:
                    case ItemType.REIDITE_SWORD:
                    case ItemType.DRAGON_SWORD:
                    case ItemType.LAVA_SWORD:
                    case ItemType.PIRATE_SWORD:
                        return pirate_range + (me[vars.fly] ? 20 : 0);

                    case ItemType.EMERALD_SWORD:
                        return sword_range + (me[vars.fly] ? 20 : 0);

                    case ItemType.WOOD_SPEAR:
                    case ItemType.STONE_SPEAR:
                    case ItemType.GOLD_SPEAR:
                    case ItemType.DIAMOND_SPEAR:
                    case ItemType.AMETHYST_SPEAR:
                    case ItemType.REIDITE_SPEAR:
                    case ItemType.DRAGON_SPEAR:
                    case ItemType.LAVA_SPEAR:
                    case ItemType.CRAB_SPEAR:
                    case ItemType.EMERALD_SPEAR:
                        return spear_range + (me[vars.fly] ? 20 : 0);

                    case ItemType.WOOD_AXE:
                    case ItemType.STONE_AXE:
                    case ItemType.GOLD_AXE:
                    case ItemType.DIAMOND_AXE:
                    case ItemType.AMETHYST_AXE:
                    case ItemType.REIDITE_AXE:
                        return axe_range + (me[vars.fly] ? 20 : 0);

                    default:
                        return 0;
                }
            };

        function sendAymen(msg) {
            if (client[vars._ws] && client[vars._ws].readyState == WebSocket.OPEN) client[vars._ws].send(JSON.stringify(msg));
        }

        function loadSettings() {
            try {
                if (localStorage.getItem("settings")) {
                    const s = JSON.parse(localStorage.getItem("settings"));
                    s.aimbot.enabled = false;
                    s.auto_spike.enabled = false;
                    s.auto_wall.enabled = false;
                    // s.steal_chest.enabled = false;
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
            axe_range = 110,
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
            player_on_top: {
                enabled: true,
                draw: false,
            },
            auto_tame: {
                enabled: false,
                k: "KeyU",
                cd: 200,
                last: 0,
                type: "press",
                draw: true,
            },
            auto_craft: {
                enabled: false,
                draw: true,
                k: "KeyQ",
                type: "press",
                last: 0,
                id: null,
                cd: 50,
            },
            spectator: {
                enabled: false,
                draw: true,
                k: "KeyE",
                type: "press",
                direction: null,
                x: 0,
                y: 0,
                speed: 25,
            },
            fps: {
                draw: false,
                last: 0,
                count: 0,
                amount: 0,
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
                cd: 25,
                last: -1,
                target: null,
                draw: true,
                target_closest: true,
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
            // steal_chest: {
            //     k: "KeyR",
            //     enabled: false,
            //     type: "press",
            //     draw: true,
            //     cd: 50,
            //     last: -1,
            // },
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
            move: 37,
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

            SADDLE: 162,
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
            CRATE: 108,
            DEAD: 104,

            BABY_DRAGON: 89,
            BABY_LAVA: 90,
            BABY_MAMOTH: 94,
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
        const PLACE_DISTANCE = 120;

        // item id -> radius, built once instead of searching ITEMS on every call
        const RADIUS_BY_ITEM = {};
        for (const name in RADUIS) if (ITEMS[name] !== undefined) RADIUS_BY_ITEM[ITEMS[name]] = RADUIS[name];

        function load_resources() {
            window.resetWorld = false;
            resources = (world[vars.map] || []).filter((r) => MAP_R[r[1]] && typeof MAP_R[r[1]][r[2]] === "number").map((e) => ({ x: e[3] * 100 + 50, y: e[4] * 100 + 50, r: MAP_R[e[1]][e[2]], t: e[1] }));
        }

        function can_build(me, item, angle) {
            const itemR = RADIUS_BY_ITEM[item];
            if (itemR === undefined || !Number.isFinite(angle)) return false; // NaN angle used to return true

            if (!resources || window.resetWorld) load_resources();

            const x = me.x + PLACE_DISTANCE * Math.cos(angle);
            const y = me.y + PLACE_DISTANCE * Math.sin(angle);

            for (const type in RADIUS_BY_ITEM) {
                const min = itemR + RADIUS_BY_ITEM[type];
                const min2 = min * min;

                for (const e of world[vars.units][type] || []) {
                    if (+type === ITEMS.PLAYERS && e[vars.pid] === user.id) continue;
                    const dx = x - e.x,
                        dy = y - e.y;
                    if (dx * dx + dy * dy < min2) return false; // missing x/y gives NaN, which never matches
                }
            }

            for (const e of resources) {
                const min = itemR + e.r;
                const dx = x - e.x,
                    dy = y - e.y;
                if (dx * dx + dy * dy < min * min) return false;
            }

            return true;
        }

        function best_angle(me, item, angle = null) {
            const stepDeg = 1;
            const maxSteps = angle == null ? 40 : 60;

            const base = angle ?? (typeof settings.aimbot.angle == "number" ? settings.aimbot.angle : me.angle);
            const step = (stepDeg * Math.PI) / 180;

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

        const keyboard = {
            down: false,
            up: false,
            right: false,
            left: false,
        };

        let chat_block = document.getElementById("chat_block"),
            command_block = document.getElementById("commandMainBox"),
            update_ui = false;

        document.addEventListener("keydown", (k) => {
            if (!client[vars._ws] || client[vars._ws].readyState != WebSocket.OPEN || chat_block?.style.display == "inline-block" || command_block?.style.display == "inline-block") return;
            switch (k.code) {
                case "KeyA":
                    if (!keyboard.left) keyboard.left = true;
                    break;
                case "KeyD":
                    if (!keyboard.right) keyboard.right = true;
                    break;
                case "KeyS":
                    if (!keyboard.down) keyboard.down = true;
                    break;
                case "KeyW":
                    if (!keyboard.up) keyboard.up = true;
                    break;
                default:
                    break;
            }
            for (const s of Object.values(settings)) {
                if (s.type == "press") continue;
                if (k.code == s.k) s.enabled = true;
            }
            if (!update_ui) {
                update_ui = true;
                gui.update();
            }
        });

        document.addEventListener("keyup", (k) => {
            if (!client[vars._ws] || client[vars._ws].readyState != WebSocket.OPEN || chat_block?.style.display == "inline-block" || command_block?.style.display == "inline-block") return;
            switch (k.code) {
                case "KeyA":
                    if (keyboard.left) keyboard.left = false;
                    break;
                case "KeyD":
                    if (keyboard.right) keyboard.right = false;
                    break;
                case "KeyS":
                    if (keyboard.down) keyboard.down = false;
                    break;
                case "KeyW":
                    if (keyboard.up) keyboard.up = false;
                    break;
                default:
                    break;
            }

            if (k.code == "Escape") {
                gui.hide();
                hidden = !hidden;
            } else for (const s of Object.values(settings)) if (k.code == s.k) s.enabled = s.type == "hold" ? false : !s.enabled;
            gui.update();
            update_ui = false;
        });

        // script logic
        function run_time() {
            requestAnimationFrame(run_time);
            if (!world || !client || !user || !vars) {
                world = Aymen.world;
                client = Aymen.client;
                user = Aymen.user;
                vars = Aymen.vars || JSON.parse(localStorage.getItem("vars"));
                return;
            }
            if (!client[vars._ws] || client[vars._ws].readyState != WebSocket.OPEN) {
                settings.auto_spike.enabled = false;
                settings.auto_wall.enabled = false;
                return;
            }

            const timestamp = performance.now();

            settings.fps.count++;

            if (timestamp - settings.fps.last >= 1e3) {
                settings.fps.last = timestamp;
                settings.fps.amount = settings.fps.count;
                settings.fps.count = 0;
            }

            if (!client[vars._ws].noice) {
                client[vars._ws].noice = true;

                client[vars._ws].addEventListener("message", packet_handler);

                Aymen.send = client[vars._ws].send;
                client[vars._ws].send = new Proxy(Aymen.send, {
                    apply(target, thisArg, args) {
                        if (typeof args[0] == "string") {
                            const pkt = JSON.parse(args[0]);

                            if (pkt[0] == 15 && settings.spectator.enabled) {
                                pkt[1] = settings.spectator.x;
                                pkt[2] = settings.spectator.y;
                                args[0] = JSON.stringify(pkt);
                                return Reflect.apply(target, thisArg, args);
                            }

                            if (Array.isArray(window.logger) && window.logger.includes(pkt[0])) Aymen.log(pkt);
                            else if (window.logger == true) Aymen.log(pkt);

                            if (pkt[0] == packets.craft) {
                                me.right != ItemType.BOOK && sendAymen([packets.equipe, ItemType.BOOK]);
                                settings.auto_craft.id = pkt[1];
                            }
                        } else {
                            const pkt = args[0];
                            if (Array.isArray(window.logger) && window.logger.includes(pkt[0])) Aymen.log(pkt);
                            else if (window.logger == true) Aymen.log(pkt);
                            if (settings.spectator.enabled && args[0][0] == packets.move) return;
                        }

                        return Reflect.apply(target, thisArg, args);
                    },
                });
            }

            for (const p of world[vars.units][ITEMS.PLAYERS]) {
                if (p.newX != p.r.x || p.newY != p.r.y) {
                    p.prevX = p.newX;
                    p.prevY = p.newY;

                    p.newX = p.x;
                    p.newY = p.y;
                }

                if (p[vars.pid] == user.id) me = p;
            }

            // me = world[vars.fast_units][user.id * 1e3];
            if (!me) return;
            if (!settings.spectator.original) settings.spectator.original = user[vars.cam][vars.update];
            Aymen.me = me;

            if (!hidden) draw_ui();

            // if (world[vars.map]) {
            //     Aymen.ress = [];

            //     for (const r of world[vars.map]) {
            //         if (calcDist(me, { x: r[3] * 100 + 50, y: r[4] * 100 + 50 }) < (Aymen.dist || 150)) Aymen.ress.push(r);
            //     }
            // }

            // auto tame
            if (settings.auto_tame.enabled && timestamp - settings.auto_tame.last > settings.auto_tame.cd) {
                const u = world[vars.units];

                const tamed_ids = [ITEMS.BABY_DRAGON, ITEMS.BABY_LAVA, ITEMS.BABY_MAMOTH];

                const mobs = [];
                for (const id of tamed_ids) mobs.push(...u[id]);

                for (const m of mobs)
                    if (110 >= calcDist(me, m)) {
                        if (m.info != 0) continue;

                        if (me.right != ItemType.SADDLE) sendAymen([packets.equipe, ItemType.SADDLE]);

                        const angle = calcAngle(me, m);

                        sendAymen([packets.angle, Math.floor((((angle + PI2M) % PI2M) * 255) / PI2M)]);
                        sendAymen([packets.attack, Math.floor((((angle + PI2M) % PI2M) * 255) / PI2M)]);
                        sendAymen([packets.stop_attack]);

                        settings.auto_tame.last = timestamp;
                        break;
                    }
            }
            if (settings.spectator.enabled) {
                // spectator
                user[vars.cam][vars.update] = () => {};

                settings.spectator.speed = 1500 / settings.fps.amount;

                settings.spectator.direction = 0;

                if (keyboard.left) settings.spectator.direction |= 1;
                if (keyboard.right) settings.spectator.direction |= 2;
                if (keyboard.down) settings.spectator.direction |= 4;
                if (keyboard.up) settings.spectator.direction |= 8;

                switch (settings.spectator.direction) {
                    case 1:
                        user[vars.cam].x += settings.spectator.speed;
                        break;
                    case 2:
                        user[vars.cam].x -= settings.spectator.speed;
                        break;
                    case 4:
                        user[vars.cam].y -= settings.spectator.speed;
                        break;
                    case 5:
                        user[vars.cam].x += settings.spectator.speed;
                        user[vars.cam].y -= settings.spectator.speed;
                        break;
                    case 6:
                        user[vars.cam].x -= settings.spectator.speed;
                        user[vars.cam].y -= settings.spectator.speed;
                        break;
                    case 8:
                        user[vars.cam].y += settings.spectator.speed;
                        break;
                    case 9:
                        user[vars.cam].x += settings.spectator.speed;
                        user[vars.cam].y += settings.spectator.speed;
                        break;
                    case 10:
                        user[vars.cam].x -= settings.spectator.speed;
                        user[vars.cam].y += settings.spectator.speed;
                        break;
                }
                settings.spectator.x = user[vars.cam].x;
                settings.spectator.y = user[vars.cam].y;
            } else if (settings.spectator.original != user[vars.cam][vars.update]) {
                user[vars.cam][vars.update] = settings.spectator.original;
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
            if (settings.auto_spike.enabled && timestamp - settings.auto_spike.last > settings.auto_spike.cd) {
                let spike, type;

                const amounts = user[vars.inv][vars.n];
                if (amounts[ItemType.REIDITE_SPIKE]) ((spike = ItemType.REIDITE_SPIKE), (type = ITEMS.REIDITE_SPIKE));
                else if (amounts[ItemType.AMETHYST_SPIKE]) ((spike = ItemType.AMETHYST_SPIKE), (type = ITEMS.AMETHYST_SPIKE));
                else if (amounts[ItemType.DIAMOND_SPIKE]) ((spike = ItemType.DIAMOND_SPIKE), (type = ITEMS.DIAMOND_SPIKE));
                else if (amounts[ItemType.GOLD_SPIKE]) ((spike = ItemType.GOLD_SPIKE), (type = ITEMS.GOLD_SPIKE));
                else if (amounts[ItemType.STONE_SPIKE]) ((spike = ItemType.STONE_SPIKE), (type = ITEMS.STONE_SPIKE));
                else if (amounts[ItemType.WOOD_SPIKE]) ((spike = ItemType.WOOD_SPIKE), (type = ITEMS.WOOD_SPIKE));

                if (spike) {
                    let enemy = null;
                    const rng = 150;

                    let closest = Infinity;
                    for (const t of world[vars.units][ITEMS.PLAYERS]) {
                        if (t[vars.pid] == user.id || user[vars.team].includes(t[vars.pid]) || me[vars.fly] != t[vars.fly]) continue;
                        const d = calcDist(me, t);
                        if (settings.auto_spike.target_closest) {
                            if (d < closest) {
                                closest = d;
                                enemy = t;
                            }
                        } else {
                            if (enemy && d <= rng) {
                                enemy = null;
                                break;
                            }
                            if (!enemy && d <= rng) enemy = t;
                        }
                    }
                    if (enemy) {
                        // enemy velocity (px per tick), from position history

                        const vx = enemy.r.x - enemy.prevX;
                        const vy = enemy.r.y - enemy.prevY;

                        const speed = Math.hypot(vx, vy) || 1;
                        const lead = RADUIS.GOLD_SPIKE + 15; // px ahead of him, tune this

                        const predicted = {
                            x: enemy.r.x + (vx / speed) * lead,
                            y: enemy.r.y + (vy / speed) * lead,
                        };

                        const predicted_angle = calcAngle(me, predicted);

                        const adjust = best_angle(me, type, predicted_angle);
                        if (adjust != null) {
                            const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);

                            sendAymen([packets.angle, angle]);
                            sendAymen([packets.place, spike, angle, 0]);
                            settings.auto_spike.last = timestamp;
                            settings.auto_spike.cd = get_num_in_range({ min: 25, max: 50 });
                        }
                    } else {
                        const adjust = best_angle(me, type);
                        if (adjust != null) {
                            const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);
                            sendAymen([packets.angle, angle]);
                            sendAymen([packets.place, spike, angle, 0]);
                            settings.auto_spike.last = timestamp;
                            settings.auto_spike.cd = get_num_in_range({ min: 25, max: 50 });
                        }
                    }
                }
            }
            // auto wall
            if (settings.auto_wall.enabled && timestamp - settings.auto_wall.last > settings.auto_wall.cd) {
                let wall, type;

                const amounts = user[vars.inv][vars.n];
                if (amounts[ItemType.WOOD_WALL]) ((wall = ItemType.WOOD_WALL), (type = ITEMS.WOOD_WALL));

                if (wall) {
                    let enemy = null;
                    const rng = 150;

                    for (const t of world[vars.units][ITEMS.PLAYERS]) {
                        if (t[vars.pid] == user.id || user[vars.team].includes(t[vars.pid]) || me[vars.fly] != t[vars.fly]) continue;
                        const d = calcDist(me, t);

                        if (enemy && d <= rng) {
                            enemy = null;
                            break;
                        }
                        if (!enemy && d <= rng) enemy = t;
                    }
                    if (enemy) {
                        const vx = enemy.r.x - enemy.prevX;
                        const vy = enemy.r.y - enemy.prevY;

                        const speed = Math.hypot(vx, vy) || 1;
                        const lead = RADUIS.WOOD_WALL + 10;

                        const predicted = {
                            x: enemy.r.x + (vx / speed) * lead,
                            y: enemy.r.y + (vy / speed) * lead,
                        };

                        const predicted_angle = calcAngle(me, predicted);

                        const adjust = best_angle(me, type, predicted_angle);
                        if (adjust != null) {
                            const angle = Math.floor((((adjust + PI2M) % PI2M) * 255) / PI2M);

                            sendAymen([packets.angle, angle]);
                            sendAymen([packets.place, wall, angle, 0]);
                            settings.auto_wall.last = timestamp;
                            settings.auto_wall.cd = get_num_in_range({ min: 50, max: 100 });
                        }
                    } else {
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
            }
            // auto fire
            if (settings.auto_fire.enabled && !user.build.wait && timestamp - settings.auto_fire.last > settings.auto_fire.cd) {
                let fire;

                const amounts = user[vars.inv][vars.n];
                if (amounts[ItemType.FIRE]) fire = ItemType.FIRE;
                else if (amounts[ItemType.BIG_FIRE]) fire = ItemType.BIG_FIRE;

                if (fire) {
                    const angle = Math.floor((((me.angle + PI2M) % PI2M) * 255) / PI2M);

                    sendAymen([packets.place, fire, angle, 0]);

                    settings.auto_fire.last = timestamp;
                    settings.auto_fire.cd = get_num_in_range({ min: 50, max: 100 });
                }
            }
            // auto land
            // if (me[vars.vehicle] && settings.auto_land.enabled) {
            //     if (me[vars.fly]) settings.auto_land.active = true;
            //     else if (settings.auto_land.active)
            //         if (me[vars.vehicle] == ItemType.NIMBUS) {
            //             settings.auto_land.active = false;
            //             sendAymen([packets.equipe, me[vars.vehicle]]);
            //         } else if (me.speed <= 100) {
            //             settings.auto_land.active = false;
            //             sendAymen([packets.equipe, me[vars.vehicle]]);
            //         }
            // }

            if (settings.aimbot.enabled) {
                if (weapons.has(me.right)) {
                    const target = get_closest_player(me, get_range(me.right));
                    if (target) {
                        settings.aimbot.target = target;
                        let angle = calcAngle(me, target);

                        if (settings.aimbot.org_angle != angle) {
                            settings.aimbot.org_angle = angle;

                            settings.aimbot.angle2 = calcAngle(me, target);
                            // angle = calcAngle(me, { x: randomize(target.x), y: randomize(target.y) });

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

            // if (settings.steal_chest.enabled && timestamp - settings.steal_chest.last > settings.steal_chest.cd) {
            //     const chests = get_closest_chest(me);
            //     for (const chest of chests) {
            //         sendAymen([packets.take_chest, chest[vars.pid], chest.id]);
            //         settings.steal_chest.last = timestamp;
            //     }
            // }
        }

        const rotl = (v, r) => ((v << (r & 7)) | (v >> (8 - (r & 7)))) & 255;

        // Decodes ONE byte of the packet. Each byte only depends on b0, b1 and its own index,
        // so there is no need to decode the whole buffer.
        function decode_byte(raw, i) {
            const b0 = raw[0],
                b1 = raw[1],
                s = b0 ^ b1,
                v = raw[i],
                m = (b0 + i) & 255;

            switch (b0 % 4) {
                case 0:
                    if (s === 0 || s === 3) return rotl(v ^ m, 3);
                    if (s === 1) return v ^ m;
                    if (s === 5) return ((v ^ m) - m + b0) & 255;
                    return (v ^ ~m) & 255;
                case 1:
                    return (v ^ rotl(b0, i + b1)) & 255;
                case 2:
                    return (v ^ (i % 2 ? b1 : b0)) & 255;
                default:
                    return (v ^ ((b0 * (i + 1)) ^ b1)) & 255;
            }
        }

        function packet_handler(event) {
            if (typeof event.data === "string") {
                const msg = JSON.parse(event.data);
                if (msg[0] === 3) {
                    // spawn
                    const myUnit = msg[9] * msg[7]; // player id * units per player
                    const unit = world[vars.fast_units][myUnit];
                    if (unit) unit.gauges = { life: 200, food: 100, cold: 100, water: 100, oxygen: 100, heat: 0, bandage: 0 };

                    settings.timers.heal = false;
                    settings.timers.next = performance.now() + 5e3;
                }
                return;
            }

            // The game's own onmessage already XOR'd event.data in place, so just read it (never write to it).
            const raw = new Uint8Array(event.data);
            if (raw.length < 3) return;

            // byte 2 is the opcode; entity updates (0/1) are the most common and are ignored, so they cost one byte decode
            const op = decode_byte(raw, 2);
            if (!me) return;

            switch (op) {
                case 16: // gauges update
                    me.gauges = {
                        life: decode_byte(raw, 3),
                        food: decode_byte(raw, 4),
                        cold: decode_byte(raw, 5),
                        water: decode_byte(raw, 6),
                        oxygen: decode_byte(raw, 7),
                        heat: decode_byte(raw, 8),
                        bandage: decode_byte(raw, 9),
                    };
                    settings.timers.next = performance.now() + 5e3;
                    settings.timers.heal = !settings.timers.heal;
                    break;
                case 37:
                    me.hp = decode_byte(raw, 3) * 2;
                    break;
                case 38:
                    if (me.gauges) me.gauges.food = decode_byte(raw, 3);
                    break;
                case 39:
                    if (me.gauges) me.gauges.water = decode_byte(raw, 3);
                    break;
                case 55:
                    if (me.gauges) me.gauges.heat = decode_byte(raw, 3);
                    break;
                case 56:
                    if (me.gauges) me.gauges.cold = decode_byte(raw, 3);
                    break;
                case 71:
                    if (me.gauges) me.gauges.bandage = decode_byte(raw, 3);
                    break;
            }
        }
        // ctx UI
        const ui_labels = {};

        function draw_ui() {
            const cam = user[vars.cam];
            const cam_x = me.x + cam.x,
                cam_y = me.y + cam.y;

            ctx.save();
            ctx.textBaseline = "top";
            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";

            // enabled features list
            ctx.font = "18px Baloo Paaji";
            ctx.textAlign = "left";
            ctx.fillStyle = "red";
            let y = 290;
            for (const k in settings) {
                const s = settings[k];
                if (!s.draw || !s.enabled) continue;
                const label = (ui_labels[k] ??= k.replaceAll("_", " "));
                ctx.strokeText(label, 10, y);
                ctx.fillText(label, 10, y);
                y += 24;
            }

            // debug hitboxes: one path, one stroke
            if (Aymen.show_hit_boxes && resources) {
                ctx.strokeStyle = "red";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cam_x + RADUIS.PLAYERS, cam_y);
                ctx.arc(cam_x, cam_y, RADUIS.PLAYERS, 0, PI2M);
                for (const r of resources) {
                    const sx = r.x + cam.x,
                        sy = r.y + cam.y;
                    ctx.moveTo(sx + r.r, sy);
                    ctx.arc(sx, sy, r.r, 0, PI2M);
                }
                ctx.stroke();
                ctx.strokeStyle = "black";
                ctx.lineWidth = 4;
            }

            // hp + heal timer
            if (settings.timers.enabled) {
                ctx.font = "24px Baloo Paaji";
                ctx.textAlign = "center"; // same as subtracting half the measured width
                ctx.globalAlpha = 0.8;

                if (me.hp) {
                    const h = Math.round(me.hp);
                    ctx.fillStyle = h > 100 ? "lime" : h > 50 ? "orange" : "red";
                    ctx.strokeText(h + "hp", cam_x, cam_y + 50);
                    ctx.fillText(h + "hp", cam_x, cam_y + 50);
                }

                const t = ((settings.timers.next - performance.now()) / 1e3).toFixed(2) + "s";
                ctx.fillStyle = settings.timers.heal ? "lime" : "red";
                ctx.strokeText(t, cam_x, cam_y + 80);
                ctx.fillText(t, cam_x, cam_y + 80);
            }

            ctx.restore();
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
            gui.register({ type: "folder", label: "Settings" });

            gui.register({ type: "checkbox", label: "Player On Top", folder: "Visuals", object: settings.player_on_top, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Timers", folder: "Visuals", object: settings.timers, prop: "enabled" });

            gui.register({ type: "checkbox", label: "Auto Land", folder: "Misc", object: settings.auto_land, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Aimbot", folder: "Misc", object: settings.aimbot, prop: "enabled" });
            gui.register({ type: "checkbox", label: "Target The Closest Enemy", folder: "Misc", object: settings.auto_spike, prop: "target_closest" });
            // gui.register({ type: "checkbox", label: "Steal Chest", folder: "Misc", object: settings.steal_chest, prop: "enabled" });

            gui.register({
                type: "button",
                label: "Clear Cached Client",
                folder: "Settings",
                action: async () => {
                    await Aymen.clearCache();
                    location.reload();
                },
            });

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
