(() => {
    try {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");

        const PI2M = 2 * window.Math.PI;
        let vars = null;
        let me = null;

        async function run_time() {
            requestAnimationFrame(run_time);
            if (!window.user || !window.world) return;

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
                    if (adjust) {
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
                else if (amounts[ItemType.REIDITE_DOOR_SPIKE]) ((spike = ItemType.REIDITE_DOOR_SPIKE), (type = ITEMS.REIDITE_DOOR_SPIKE));
                else if (amounts[ItemType.AMETHYST_DOOR_SPIKE]) ((spike = ItemType.AMETHYST_DOOR_SPIKE), (type = ITEMS.AMETHYST_DOOR_SPIKE));
                else if (amounts[ItemType.DIAMOND_DOOR_SPIKE]) ((spike = ItemType.DIAMOND_DOOR_SPIKE), (type = ITEMS.DIAMOND_DOOR_SPIKE));
                else if (amounts[ItemType.GOLD_DOOR_SPIKE]) ((spike = ItemType.GOLD_DOOR_SPIKE), (type = ITEMS.GOLD_DOOR_SPIKE));
                else if (amounts[ItemType.STONE_DOOR_SPIKE]) ((spike = ItemType.STONE_DOOR_SPIKE), (type = ITEMS.STONE_DOOR_SPIKE));
                else if (amounts[ItemType.WOOD_DOOR_SPIKE]) ((spike = ItemType.WOOD_DOOR_SPIKE), (type = ITEMS.WOOD_DOOR_SPIKE));

                if (spike) {
                    const angle = Math.floor((((best_angle(me, type) + PI2M) % PI2M) * 255) / PI2M);
                    if (angle) {
                        user[vars.craft].preview = spike;
                        sendAymen([packets.angle, angle]);
                        sendAymen([packets.place, spike, angle, 0]);

                        user[vars.craft].preview = -2;
                        settings.auto_door.last = timestamp;
                        settings.auto_door.cd = get_num_in_range({ min: 50, max: 100 });
                    }
                }
            }
            // auto land
            if (me.vehicle)
                if (me.fly) settings.auto_land.enabled = true;
                else if (settings.auto_land.enabled)
                    if (me.vehicle == ItemType.NIMBUS) {
                        settings.auto_land.enabled = false;
                        sendAymen([packets.equipe, me.vehicle]);
                    } else if (me.speed <= 100) {
                        settings.auto_land.enabled = false;
                        sendAymen([packets.equipe, me.vehicle]);
                    }

            if (settings.aimbot.enabled) {
                if (weapons.has(me.right)) {
                    if (timestamp - settings.aimbot.last > settings.aimbot.cd) {
                        const target = get_closest_player(me, get_range(me.right));
                        settings.aimbot.target = target;

                        if (target) {
                            let angle = calcAngle(me, target);
                            if (settings.aimbot.org_angle != angle) {
                                settings.aimbot.org_angle = angle;
                                angle = calcAngle(me, { x: randomize(target.x), y: randomize(target.y) });
                                settings.aimbot.angle = angle;

                                //     sendAymen([packets.angle, Math.floor((((angle + PI2M) % PI2M) * 255) / PI2M)]);
                            }

                            if (!settings.aimbot.attack) {
                                settings.aimbot.attack = true;
                                sendAymen([packets.attack, [packets.angle, Math.floor((((angle + PI2M) % PI2M) * 255) / PI2M)]]);
                            }

                            settings.aimbot.last = timestamp;
                        } else if (settings.aimbot.attack) {
                            settings.aimbot.attack = false;
                            settings.aimbot.angle = null;
                            settings.aimbot.org_angle = null;
                            sendAymen([packets.stop_attack]);
                        }
                    }
                }
            } else if (settings.aimbot.attack) {
                settings.aimbot.attack = false;
                settings.aimbot.angle = null;
                settings.aimbot.org_angle = null;
                sendAymen([packets.stop_attack]);
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

                if (amounts[ItemType.COOKED_MEAT]) sendAymen([packets.sell, amounts[ItemType.COOKED_MEAT], sell_ids.MEAT]);
                if (amounts[ItemType.COOKIE]) sendAymen([packets.sell, amounts[ItemType.COOKIE], sell_ids.COOKIE]);
                if (amounts[ItemType.SANDWICH]) sendAymen([packets.sell, amounts[ItemType.SANDWICH], sell_ids.SANDWICH]);
                if (amounts[ItemType.CAKE]) sendAymen([packets.sell, amounts[ItemType.CAKE], sell_ids.CAKE]);
                if (amounts[ItemType.BREAD]) sendAymen([packets.sell, amounts[ItemType.BREAD], sell_ids.BREAD]);
            }
        }

        const sell_ids = {
            BREAD: 15,
            SANDWICH: 14,
            MEAT: 13,
            COOKIE: 12,
            CAKE: 11,
            SPIKE: 35,
        };
        const settings = {
            auto_land: {
                cd: 200,
                last: -1,
                v: 0,
                enabled: false,
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
                cd: 50,
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
        window.settings = settings;

        const packets = {
            equipe: 5,
            angle: 4,
            attack: 3,
            stop_attack: 46,
            place: 33,
            drop: 6,
            take_chest: 8,
            sell: 32,
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
            PLAYERS: 30,
            CHEST: 35,
            EMERALD_MACHINE: 60,

            WOOD_DOOR_SPIKE: 42,
            STONE_DOOR_SPIKE: 42,
            GOLD_DOOR_SPIKE: 42,
            DIAMOND_DOOR_SPIKE: 42,
            AMETHYST_DOOR_SPIKE: 42,
            REIDITE_DOOR_SPIKE: 42,
            EMERALD_DOOR_SPIKE: 42,

            SPIKE: 42,
            STONE_SPIKE: 42,
            GOLD_SPIKE: 42,
            DIAMOND_SPIKE: 42,
            AMETHYST_SPIKE: 42,
            REIDITE_SPIKE: 42,
            EMERALD_SPIKE: 42,

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

        const sizes = {
            s: 55,
            m: 135,
            l: 85,
            xl: 100,
        };
        const MAP_R = {
            f: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            p: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            s: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            re: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            plm: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            d: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            a: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            g: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            b: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            t: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },

            m: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },

            rub: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            aqu: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            coa: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },

            cop: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            jad: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            sap: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
            top: {
                0: sizes.s,
                1: sizes.m,
                2: sizes.l,
                3: sizes.xl,
            },
        };
        let resources;

        const sword_range = 135,
            spear_range = 197,
            pirate_range = 140,
            bow_range = 700;

        const get_range = (r) => {
            switch (r) {
                case ItemType.WOOD_SWORD:
                    return sword_range;
                case ItemType.STONE_SWORD:
                    return sword_range;
                case ItemType.GOLD_SWORD:
                    return sword_range;
                case ItemType.DIAMOND_SWORD:
                    return sword_range;
                case ItemType.AMETHYST_SWORD:
                    return sword_range;
                case ItemType.REIDITE_SWORD:
                    return sword_range;
                case ItemType.DRAGON_SWORD:
                    return sword_range;
                case ItemType.LAVA_SWORD:
                    return sword_range;
                case ItemType.CURSED_SWORD:
                    return sword_range;
                case ItemType.PIRATE_SWORD:
                    return pirate_range;

                case ItemType.IRON_SWORD:
                    return sword_range;
                case ItemType.COPPER_SWORD:
                    return sword_range;
                case ItemType.TOPAZ_SWORD:
                    return sword_range;
                case ItemType.AQUAMARINE_SWORD:
                    return sword_range;
                case ItemType.RUBY_SWORD:
                    return sword_range;
                case ItemType.COAL_SWORD:
                    return sword_range;
                case ItemType.EMERALD_SWORD:
                    return sword_range;
                case ItemType.JADE_SWORD:
                    return sword_range;
                case ItemType.SAPPHIRE_SWORD:
                    return sword_range;

                case ItemType.WOOD_SPEAR:
                    return spear_range;
                case ItemType.STONE_SPEAR:
                    return spear_range;
                case ItemType.GOLD_SPEAR:
                    return spear_range;
                case ItemType.DIAMOND_SPEAR:
                    return spear_range;
                case ItemType.AMETHYST_SPEAR:
                    return spear_range;
                case ItemType.REIDITE_SPEAR:
                    return spear_range;
                case ItemType.DRAGON_SPEAR:
                    return spear_range;
                case ItemType.LAVA_SPEAR:
                    return spear_range;
                case ItemType.CRAB_SPEAR:
                    return spear_range;

                case ItemType.IRON_SPEAR:
                    return spear_range;
                case ItemType.COPPER_SPEAR:
                    return spear_range;
                case ItemType.TOPAZ_SPEAR:
                    return spear_range;
                case ItemType.AQUAMARINE_SPEAR:
                    return spear_range;
                case ItemType.RUBY_SPEAR:
                    return spear_range;
                case ItemType.COAL_SPEAR:
                    return spear_range;
                case ItemType.EMERALD_SPEAR:
                    return spear_range;
                case ItemType.JADE_SPEAR:
                    return spear_range;
                case ItemType.SAPPHIRE_SPEAR:
                    return spear_range;

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

        function can_build(me, item, angle) {
            let itemName = null;

            if (!resources) {
                resources = world[vars.map]
                    .filter((r) => MAP_R[r[1]])
                    .map((e) => {
                        const x = e[3] * 100,
                            y = e[4] * 100,
                            r = MAP_R[e[1]][e[2]],
                            t = e[1];

                        // if (typeof x != "number" || typeof y != "number" || typeof r != "number") {
                        //     console.log(x, y, r, t);
                        //     debugger;
                        // }
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
                if (typeof e.x != "number" || typeof e.y != "number" || typeof e.r != "number") {
                    // console.log("missing data for: ", e.t);
                    continue;
                }

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

        const sleep = async (ms) => new Promise((res) => setTimeout(res, ms));
        const get_num_in_range = ({ min, max }) => Math.round(min + Math.random() * (max - min));
        const randomSleep = async ({ min, max }) => await sleep(get_num_in_range({ min, max }));

        document.addEventListener("keydown", (k) => {
            if (user[vars.cmdInput].open || user[vars.chatInput].open) return;
            for (const s of Object.values(settings)) {
                if (s.type == "press") continue;
                if (k.code == s.k) s.enabled = true;
            }
        });

        document.addEventListener("keyup", (k) => {
            if (user[vars.cmdInput].open || user[vars.chatInput].open) return;
            for (const s of Object.values(settings)) if (k.code == s.k) s.enabled = s.type == "hold" ? false : !s.enabled;
        });

        function adjustAngle(angle, increment = 0) {
            const MAX_ANGLE = 256;
            return (((angle + increment) % MAX_ANGLE) + MAX_ANGLE) % MAX_ANGLE;
        }

        function calcAngle(me, t) {
            return (Math.atan2(t.y - me.y, t.x - me.x) + PI2M) % PI2M;
        }

        function get_closest_player(me, max) {
            let dist = max || Infinity;
            let closest = null;
            for (const t of world[vars.units][ITEMS.PLAYERS]) {
                if (t.pid == user.id || user[vars.team].includes(t.pid) || me.fly != t.fly) continue;
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

        const calcDist = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const format_number = (num) => {
            if (num < 1_000) return num.toString();
            if (num < 1_000_000) return `${(num / 1_000).toFixed(2).replace(/\.?0+$/, "")}k`;
            if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}m`;
            if (num < 1_000_000_000_000) return `${(num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")}b`;
            return `${(num / 1_000_000_000_000).toFixed(2).replace(/\.?0+$/, "")}t`;
        };

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

            if (settings.aimbot.enabled) {
                ctx.save();

                ctx.lineWidth = 3;
                ctx.globalAlpha = 0.6;

                ctx.strokeStyle = get_closest_player(me, sword_range) ? "lime" : "red";
                ctx.beginPath();
                ctx.arc(cam_x, cam_y, sword_range, 0, PI2M);
                ctx.stroke();

                ctx.strokeStyle = get_closest_player(me, pirate_range) ? "lime" : "red";
                ctx.beginPath();
                ctx.arc(cam_x, cam_y, pirate_range, 0, PI2M);
                ctx.stroke();

                ctx.strokeStyle = get_closest_player(me, spear_range) ? "lime" : "red";
                ctx.beginPath();
                ctx.arc(cam_x, cam_y, spear_range, 0, PI2M);
                ctx.stroke();

                ctx.restore();
            }

            if (user[vars.gauges].l < 1) {
                const h = user[vars.gauges].l * 200;
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
            }
        }

        run_time();

        const noise = {
            inc_chance: 50,
            v: 0,
            max: 20,
            min: -20,
            gap: 40,
        };

        function randomize(original) {
            const roll = Math.random() * 100;
            let direction = roll > noise.inc_chance ? 1 : -1;

            noise.inc_chance = ((noise.v + 20) * 100) / noise.gap;

            // noise.v = noise.v + Math.random() * (Math.random() * 10 + 5) * direction;
            noise.v = noise.v + Math.random() * (Math.random() * 5) * direction;

            return original + noise.v;
        }

        const void_function = () => {};
    } catch (error) {
        if (window.debugErr) console.error(error);
    }
    window.debugErr = true;

    document.querySelector("#shop_market").style.opacity = 0.6;
    document.querySelector("#home_craft").style.opacity = 0.6;
    document.querySelector("#recipe_craft").style.opacity = 0.6;
})();
