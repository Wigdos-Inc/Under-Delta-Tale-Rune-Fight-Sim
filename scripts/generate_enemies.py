#!/usr/bin/env python3
"""
Generate all Undertale enemy JSON files
This script creates comprehensive enemy data for all Undertale enemies
"""

import json
import os

# Base output directory
OUTPUT_DIR = "/workspaces/Under-Delta-Tale-Rune-Fight-Sim/data/enemies"

# Complete Undertale enemy database
ENEMIES = {
    # ===== RUINS =====
    "froggit": {
        "name": "Froggit",
        "hp": 30,
        "attack": 5,
        "defense": 0,
        "gold": 2,
        "exp": 3,
        "spareThreshold": 0,
        "dialogue": [
            "* Froggit hops closer.",
            "* Froggit makes a frog noise.",
            "* The battlefield is filled with\n  the smell of mustard seed.",
            "* Froggit doesn't seem to know\n  why it's here."
        ],
        "checkText": "ATK 4 DEF 1\n* Life is difficult for this enemy.",
        "sprites": {
            "idle": [
                "Battle/Enemies/01 - Ruins/Froggit/spr_froggit_0.png",
                "Battle/Enemies/01 - Ruins/Froggit/spr_froggit_1.png",
                "Battle/Enemies/01 - Ruins/Froggit/spr_froggit_2.png",
                "Battle/Enemies/01 - Ruins/Froggit/spr_froggit_3.png"
            ]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Froggit.\n* It doesn't seem to understand...", "mercyIncrease": 30},
            {"name": "Threaten", "effect": "threaten", "text": "* You threaten Froggit.\n* It starts to hop away.", "mercyIncrease": 10}
        ]
    },
    
    "whimsun": {
        "name": "Whimsun",
        "hp": 10,
        "attack": 5,
        "defense": 0,
        "gold": 2,
        "exp": 2,
        "spareThreshold": 0,
        "dialogue": [
            "* Whimsun approached meekly!",
            "* Whimsun continues to mutter\n  apologies.",
            "* Whimsun is hyperventilating.",
            "* Whimsun is thinking about\n  its friend."
        ],
        "checkText": "ATK 5 DEF 0\n* This monster is too sensitive\n  to fight...",
        "sprites": {
            "idle": ["Battle/Enemies/01 - Ruins/Whimsun/spr_whimsun_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Console", "effect": "console", "text": "* You console Whimsun.\n* Its eyes glimmer with tears...", "mercyIncrease": 100},
            {"name": "Terrorize", "effect": "terrorize", "text": "* You wiggle your arms at Whimsun.\n* Whimsun freaks out!", "mercyIncrease": 100}
        ]
    },
    
    "moldsmal": {
        "name": "Moldsmal",
        "hp": 50,
        "attack": 6,
        "defense": 0,
        "gold": 3,
        "exp": 3,
        "spareThreshold": 0,
        "dialogue": [
            "* Moldsmal wavers around.",
            "* Moldsmal burbles quietly.",
            "* Moldsmal is pondering something.",
            "* Smells like sweet lemons."
        ],
        "checkText": "ATK 6 DEF 0\n* Stereotypical: Curvaceously\n  attractive, but no brains...",
        "sprites": {
            "idle": [
                "Battle/Enemies/01 - Ruins/Moldsmal/spr_moldsmal_0.png",
                "Battle/Enemies/01 - Ruins/Moldsmal/spr_moldsmal_1.png"
            ]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Imitate", "effect": "imitate", "text": "* You lie on the ground and wiggle.\n* Moldsmal is flattered.", "mercyIncrease": 30},
            {"name": "Flirt", "effect": "flirt", "text": "* You wiggle your hips.\n* Moldsmal wiggles back.", "mercyIncrease": 50}
        ]
    },
    
    "loox": {
        "name": "Loox",
        "hp": 50,
        "attack": 6,
        "defense": 6,
        "gold": 5,
        "exp": 5,
        "spareThreshold": 0,
        "dialogue": [
            "* Loox draws near!",
            "* Loox stares at you.",
            "* Loox is suspicious of you.",
            "* Loox gnashes its teeth."
        ],
        "checkText": "ATK 6 DEF 6\n* Don't pick on.\n* Family name: Eyewalker.",
        "sprites": {
            "idle": ["Battle/Enemies/01 - Ruins/Loox/spr_loox_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pick On", "effect": "pickon", "text": "* You pick on Loox.\n* Its defense dropped!", "mercyIncrease": 30},
            {"name": "Don't Pick On", "effect": "dontpickon", "text": "* You don't pick on Loox.\n* Loox appreciates your restraint.", "mercyIncrease": 50}
        ]
    },
    
    "vegetoid": {
        "name": "Vegetoid",
        "hp": 72,
        "attack": 6,
        "defense": 2,
        "gold": 4,
        "exp": 5,
        "spareThreshold": 0,
        "dialogue": [
            "* Vegetoid came out of the earth!",
            "* Vegetoid settles down.",
            "* Vegetoid offers you a healthy meal.",
            "* Smells like apple juice."
        ],
        "checkText": "ATK 6 DEF 2\n* Serving Size: 1 Monster.\n  Not monitored by the USDA.",
        "sprites": {
            "idle": ["Battle/Enemies/01 - Ruins/Vegetoid/spr_vegetoid_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Dinner", "effect": "dinner", "text": "* You ask Vegetoid for dinner.\n* It offers you a healthy meal!", "mercyIncrease": 50},
            {"name": "Devour", "effect": "devour", "text": "* You eat Vegetoid's vegetables.\n* Your HP was maxed out!", "mercyIncrease": 100}
        ]
    },
    
    "migosp": {
        "name": "Migosp",
        "hp": 40,
        "attack": 7,
        "defense": 0,
        "gold": 3,
        "exp": 5,
        "spareThreshold": 0,
        "dialogue": [
            "* Migosp comes near!",
            "* Migosp is thinking about\n  its friends.",
            "* Migosp dances around.",
            "* Smells like a combination of  \n  plums, clams, and bleach."
        ],
        "checkText": "ATK 7 DEF 0\n* Seems evil, but it's just\n  with the wrong crowd...",
        "sprites": {
            "idle": ["Battle/Enemies/01 - Ruins/Migosp/spr_migosp_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Talk", "effect": "talk", "text": "* You talk to Migosp.\n* Seems comfortable here.", "mercyIncrease": 0}
        ]
    },
    
    "napstablook": {
        "name": "Napstablook",
        "hp": 88,
        "attack": 10,
        "defense": 255,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* napstablook...",
            "* i'm sorry...",
            "* i'm just really...\n  ...tired...",
            "* oh no..."
        ],
        "checkText": "ATK 10 DEF -40\n* This monster is really feeling\n  'it'... whatever 'it' is.",
        "sprites": {
            "idle": [
                "Battle/Enemies/01 - Ruins/Napstablook/spr_napstabattle_0.png",
                "Battle/Enemies/01 - Ruins/Napstablook/spr_napstabattle_1.png"
            ]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Cheer", "effect": "cheer", "text": "* You console Napstablook.\n* Its ATTACK dropped!", "mercyIncrease": 20},
            {"name": "Flirt", "effect": "flirt", "text": "* You flirt with Napstablook.\n  uh... no thanks...", "mercyIncrease": 10}
        ]
    },
    
    "dummy": {
        "name": "Dummy",
        "hp": 15,
        "attack": 0,
        "defense": 0,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* The dummy stands there motionless.",
            "* Cotton is spilling out of the dummy.",
            "* The dummy is giving you a blank stare."
        ],
        "checkText": "ATK 0 DEF 0\n* A cotton heart and a button eye.\n  You are the apple of its eye.",
        "sprites": {
            "idle": ["Battle/Enemies/01 - Ruins/Dummy/spr_dummyfight_glad_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Talk", "effect": "talk", "text": "* You talk to the dummy.\n* It seems happy.", "mercyIncrease": 100},
            {"name": "Hug", "effect": "hug", "text": "* You hug the dummy.\n* It's soft and fluffy...", "mercyIncrease": 100}
        ]
    },
    
    # ===== SNOWDIN =====
    "snowdrake": {
        "name": "Snowdrake",
        "hp": 74,
        "attack": 7,
        "defense": 0,
        "gold": 6,
        "exp": 6,
        "spareThreshold": 0,
        "dialogue": [
            "* Snowdrake comes flying in!",
            "* Snowdrake is checking you out.",
            "* Snowdrake has frozen over.",
            "* Smells like... snow."
        ],
        "checkText": "ATK 7 DEF 0\n* This teen comedian fights to\n  keep a captive audience.",
        "sprites": {
            "idle": ["Battle/Enemies/02 - Snowdin/Snowdrake/spr_icecap_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Joke", "effect": "joke", "text": "* You make a joke.\n* Snowdrake laughs!", "mercyIncrease": 30},
            {"name": "Heckle", "effect": "heckle", "text": "* You heckle Snowdrake.\n* Its confidence wavers...", "mercyIncrease": 30}
        ]
    },
    
    "icecap": {
        "name": "Ice Cap",
        "hp": 48,
        "attack": 6,
        "defense": 3,
        "gold": 5,
        "exp": 4,
        "spareThreshold": 0,
        "dialogue": [
            "* Ice Cap appears!",
            "* Ice Cap is thinking about\n  its hat.",
            "* Ice Cap is freezing.",
            "* Smells like icicles."
        ],
        "checkText": "ATK 6 DEF 3\n* This teen wonders why it isn't\n  named 'Ice Hat'.",
        "sprites": {
            "idle": ["Battle/Enemies/02 - Snowdin/Icecap/spr_icecap_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Steal Hat", "effect": "steal", "text": "* You stole Ice Cap's hat.\n* Ice Cap is bare!", "mercyIncrease": 100},
            {"name": "Ignore", "effect": "ignore", "text": "* You ignore Ice Cap.", "mercyIncrease": 10}
        ]
    },
    
    "gyftrot": {
        "name": "Gyftrot",
        "hp": 108,
        "attack": 7,
        "defense": 3,
        "gold": 15,
        "exp": 8,
        "spareThreshold": 0,
        "dialogue": [
            "* Gyftrot appears!",
            "* Gyftrot is sighing.",
            "* Gyftrot is annoyed.",
            "* Smells like pine trees."
        ],
        "checkText": "ATK 7 DEF 3\n* Wonders why people are so\n  horrible to each other.",
        "sprites": {
            "idle": ["Battle/Enemies/02 - Snowdin/Gyftrot/spr_gyftrot_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Undecorate", "effect": "undecorate", "text": "* You remove the decorations.\n* Gyftrot feels much better!", "mercyIncrease": 50},
            {"name": "Decorate", "effect": "decorate", "text": "* You add more decorations.\n* Gyftrot sighs even louder...", "mercyIncrease": 0}
        ]
    },
    
    "jerry": {
        "name": "Jerry",
        "hp": 100,
        "attack": 7,
        "defense": 1,
        "gold": 1,
        "exp": 1,
        "spareThreshold": 0,
        "dialogue": [
            "* Jerry clings to you!",
            "* Jerry eats powdery food\n  and licks its hands proudly.",
            "* Jerry ditches its friend to\n  talk to you.",
            "* Smells like... Jerry."
        ],
        "checkText": "ATK 7 DEF 1\n* Everybody knows Jerry.\n* Attack when it's not looking.",
        "sprites": {
            "idle": ["Battle/Enemies/02 - Snowdin/Jerry/spr_jerry_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Ditch", "effect": "ditch", "text": "* You ditch Jerry.\n* Everyone is relieved!", "mercyIncrease": 100}
        ]
    },
    
    # ===== WATERFALL =====
    "aaron": {
        "name": "Aaron",
        "hp": 98,
        "attack": 8,
        "defense": 0,
        "gold": 10,
        "exp": 7,
        "spareThreshold": 0,
        "dialogue": [
            "* Aaron appears!",
            "* Aaron is flexing.",
            "* Aaron is admiring himself.",
            "* Smells like musk."
        ],
        "checkText": "ATK 8 DEF 0\n* This seahorse has a lot of\n  HP. Don't just hack away...",
        "sprites": {
            "idle": ["Battle/Enemies/03 - Waterfall/Aaron/spr_aaron_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Flex", "effect": "flex", "text": "* You flex your muscles.\n* Aaron is impressed!", "mercyIncrease": 40},
            {"name": "Flirt", "effect": "flirt", "text": "* You flirt with Aaron.\n  Aaron's face gets redder...", "mercyIncrease": 40}
        ]
    },
    
    "woshua": {
        "name": "Woshua",
        "hp": 70,
        "attack": 7,
        "defense": 1,
        "gold": 8,
        "exp": 5,
        "spareThreshold": 0,
        "dialogue": [
            "* Woshua appears!",
            "* Woshua is judging your\n  cleanliness.",
            "* Woshua is scrubbing furiously.",
            "* Smells like disinfectant."
        ],
        "checkText": "ATK 7 DEF 1\n* This humble germaphobe seeks\n  to cleanse the whole world.",
        "sprites": {
            "idle": ["Battle/Enemies/03 - Waterfall/Woshua/spr_woshua_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Clean", "effect": "clean", "text": "* You let Woshua clean you.\n* Woshua is satisfied!", "mercyIncrease": 100},
            {"name": "Joke", "effect": "joke", "text": "* You make a dirty joke.\n* Woshua is disgusted!", "mercyIncrease": 0}
        ]
    },
    
    "moldbygg": {
        "name": "Moldbygg",
        "hp": 80,
        "attack": 8,
        "defense": 0,
        "gold": 10,
        "exp": 8,
        "spareThreshold": 0,
        "dialogue": [
            "* Moldbygg wavers forward.",
            "* Moldbygg is oozing.",
            "* Moldbygg burbles.",
            "* Smells like vanilla."
        ],
        "checkText": "ATK 8 DEF 0\n* Huge, hulking, unscary.\n* Looking for love.",
        "sprites": {
            "idle": ["Battle/Enemies/03 - Waterfall/Moldbygg/spr_moldbygg_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Lie Down", "effect": "lie", "text": "* You lie on the ground.\n* Moldbygg lies on top of you!", "mercyIncrease": 50},
            {"name": "Unhug", "effect": "unhug", "text": "* You push Moldbygg off.\n* Moldbygg gets the hint.", "mercyIncrease": 50}
        ]
    },
    
    "shyren": {
        "name": "Shyren",
        "hp": 66,
        "attack": 7,
        "defense": 0,
        "gold": 9,
        "exp": 4,
        "spareThreshold": 0,
        "dialogue": [
            "* Shyren hums a melody.",
            "* Shyren trebles with fear.",
            "* Shyren is humming.",
            "* Smells like music."
        ],
        "checkText": "ATK 7 DEF 0\n* A talented musician\n  but she's too shy to sing.",
        "sprites": {
            "idle": ["Battle/Enemies/03 - Waterfall/Shyren/spr_shyren_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Hum", "effect": "hum", "text": "* You hum along with Shyren.\n* Shyren grows confident!", "mercyIncrease": 30},
            {"name": "Sing", "effect": "sing", "text": "* You sing to Shyren.\n* Shyren is happy!", "mercyIncrease": 50}
        ]
    },
    
    # ===== HOTLAND/CORE =====
    "vulkin": {
        "name": "Vulkin",
        "hp": 66,
        "attack": 9,
        "defense": 0,
        "gold": 10,
        "exp": 6,
        "spareThreshold": 0,
        "dialogue": [
            "* Vulkin erupts!",
            "* Vulkin is warming up.",
            "* Vulkin wants to be popular.",
            "* Smells like hot springs."
        ],
        "checkText": "ATK 9 DEF 0\n* Hotheaded. Tries to calm\n  people down with hugs.",
        "sprites": {
            "idle": ["Battle/Enemies/04 - Hotland/Vulkin/spr_vulkin_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Encourage", "effect": "encourage", "text": "* You encourage Vulkin.\n* Vulkin is pumped up!", "mercyIncrease": 30},
            {"name": "Hug", "effect": "hug", "text": "* You hug Vulkin.\n* Vulkin is cooled down!", "mercyIncrease": 50}
        ]
    },
    
    "tsunderplane": {
        "name": "Tsunderplane",
        "hp": 95,
        "attack": 9,
        "defense": 4,
        "gold": 10,
        "exp": 7,
        "spareThreshold": 0,
        "dialogue": [
            "* Tsunderplane flies in!",
            "* Tsunderplane is tsun-tsun.",
            "* Tsunderplane is wavering.",
            "* Smells like airplane food."
        ],
        "checkText": "ATK 9 DEF 4\n* Seems mean, but does it secretly\n  like you?",
        "sprites": {
            "idle": ["Battle/Enemies/04 - Hotland/Tsunderplane/spr_tsunderplane_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Approach", "effect": "approach", "text": "* You approach Tsunderplane.\n* I-it's not like I like you!", "mercyIncrease": 30},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Tsunderplane.\n* B-baka...!", "mercyIncrease": 50}
        ]
    },
    
    "pyrope": {
        "name": "Pyrope",
        "hp": 110,
        "attack": 10,
        "defense": 0,
        "gold": 12,
        "exp": 10,
        "spareThreshold": 0,
        "dialogue": [
            "* Pyrope bursts in!",
            "* Pyrope is jumping around.",
            "* Pyrope is heating up.",
            "* Smells like fireworks."
        ],
        "checkText": "ATK 10 DEF 0\n* This hotheaded youngster\n  is itching for a fight.",
        "sprites": {
            "idle": ["Battle/Enemies/04 - Hotland/Pyrope/spr_pyrope_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Heat Up", "effect": "heat", "text": "* You encourage Pyrope.\n* Pyrope burns brighter!", "mercyIncrease": 30},
            {"name": "Cool Down", "effect": "cool", "text": "* You cool Pyrope down.\n* Pyrope feels better!", "mercyIncrease": 50}
        ]
    },
    
    "muffet": {
        "name": "Muffet",
        "hp": 1250,
        "attack": 10,
        "defense": 0,
        "gold": 350,
        "exp": 100,
        "spareThreshold": 0,
        "dialogue": [
            "* Muffet traps you!",
            "* Muffet giggles.",
            "* Muffet is checking her\n  account balance.",
            "* Smells like cobwebs and donuts."
        ],
        "checkText": "ATK 10 DEF 0\n* If she invites you to her\n  parlor, excuse yourself.",
        "sprites": {
            "idle": ["Battle/Characters/Muffet/spr_muffet_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pay", "effect": "pay", "text": "* You pay Muffet.\n* Muffet lets you go!", "mercyIncrease": 100},
            {"name": "Struggle", "effect": "struggle", "text": "* You struggle in the web.", "mercyIncrease": 10}
        ]
    },
    
    # ===== CORE =====
    "final_froggit": {
        "name": "Final Froggit",
        "hp": 100,
        "attack": 10,
        "defense": 5,
        "gold": 15,
        "exp": 10,
        "spareThreshold": 0,
        "dialogue": [
            "* Final Froggit hops in!",
            "* Final Froggit is pondering\n  the universe.",
            "* Final Froggit ribbits wisely.",
            "* Smells like ancient wisdom."
        ],
        "checkText": "ATK 10 DEF 5\n* This frog has lived a long time\n  and has sage advice.",
        "sprites": {
            "idle": ["Battle/Enemies/05 - Core/Final Froggit/spr_finalfroggit_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Final Froggit.\n* It nods knowingly.", "mercyIncrease": 40},
            {"name": "Mystify", "effect": "mystify", "text": "* You tell Final Froggit something\n  mystical. It's satisfied.", "mercyIncrease": 100}
        ]
    },
    
    "whimsalot": {
        "name": "Whimsalot",
        "hp": 95,
        "attack": 10,
        "defense": 2,
        "gold": 12,
        "exp": 8,
        "spareThreshold": 0,
        "dialogue": [
            "* Whimsalot swoops in!",
            "* Whimsalot is confident.",
            "* Whimsalot is flying strong.",
            "* Smells like confidence."
        ],
        "checkText": "ATK 10 DEF 2\n* Upgraded. Optimistic.\n  Still scared of you.",
        "sprites": {
            "idle": ["Battle/Enemies/05 - Core/Whimsalot/spr_whimsalot_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Console", "effect": "console", "text": "* You console Whimsalot.\n* Whimsalot calms down.", "mercyIncrease": 50},
            {"name": "Terrorize", "effect": "terrorize", "text": "* You terrorize Whimsalot.\n* Whimsalot flies away!", "mercyIncrease": 100}
        ]
    },
    
    "astigmatism": {
        "name": "Astigmatism",
        "hp": 110,
        "attack": 10,
        "defense": 4,
        "gold": 15,
        "exp": 10,
        "spareThreshold": 0,
        "dialogue": [
            "* Astigmatism drew near!",
            "* Astigmatism is staring.",
            "* Astigmatism is judging you.",
            "* Smells like eye drops."
        ],
        "checkText": "ATK 10 DEF 4\n* Upgraded. Now has a more\n  sophisticated sense of fashion.",
        "sprites": {
            "idle": ["Battle/Enemies/05 - Core/Astigmatism/spr_astigmatism_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pick On", "effect": "pickon", "text": "* You pick on Astigmatism.", "mercyIncrease": 30},
            {"name": "Don't Pick On", "effect": "dontpickon", "text": "* You don't pick on Astigmatism.\n* It respects you.", "mercyIncrease": 50}
        ]
    },
    
    "knight_knight": {
        "name": "Knight Knight",
        "hp": 230,
        "attack": 10,
        "defense": 8,
        "gold": 30,
        "exp": 15,
        "spareThreshold": 0,
        "dialogue": [
            "* Knight Knight blocks the way!",
            "* Knight Knight is guarding.",
            "* Knight Knight stands firm.",
            "* Smells like steel and roses."
        ],
        "checkText": "ATK 10 DEF 8\n* This heavy knight fears nothing.\n  Loves its pet cat more than life.",
        "sprites": {
            "idle": ["Battle/Enemies/05 - Core/Knight Knight/spr_knightknight_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Sing", "effect": "sing", "text": "* You sing a lullaby.\n* Knight Knight falls asleep!", "mercyIncrease": 100}
        ]
    },
    
    "madjick": {
        "name": "Madjick",
        "hp": 190,
        "attack": 10,
        "defense": 5,
        "gold": 25,
        "exp": 12,
        "spareThreshold": 0,
        "dialogue": [
            "* Madjick casts a spell!",
            "* Madjick is concentrating.",
            "* Madjick is muttering\n  incantations.",
            "* Smells like magic dust."
        ],
        "checkText": "ATK 10 DEF 5\n* This magical mercenary wields\n  strange powers.",
        "sprites": {
            "idle": ["Battle/Enemies/05 - Core/Madjick/spr_madjick_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Clear Mind", "effect": "clearmind", "text": "* You clear your mind.\n* Madjick's magic is disturbed!", "mercyIncrease": 50}
        ]
    }
}

def create_enemy_json(enemy_id, enemy_data):
    """Create a JSON file for an enemy"""
    # Add default attack patterns if none specified
    if "attackPatterns" not in enemy_data:
        enemy_data["attackPatterns"] = [
            {
                "name": "Default Attack",
                "duration": 4000,
                "waves": [
                    {
                        "time": 0,
                        "type": "projectiles",
                        "count": 5,
                        "speed": 2,
                        "size": 15,
                        "side": "top"
                    },
                    {
                        "time": 1500,
                        "type": "projectiles",
                        "count": 4,
                        "speed": 2.5,
                        "size": 15,
                        "side": "left"
                    },
                    {
                        "time": 2500,
                        "type": "projectiles",
                        "count": 4,
                        "speed": 2.5,
                        "size": 15,
                        "side": "right"
                    }
                ]
            }
        ]
    
    filename = os.path.join(OUTPUT_DIR, f"{enemy_id}.json")
    with open(filename, 'w') as f:
        json.dump(enemy_data, f, indent=4)
    print(f"Created {filename}")

def main():
    """Generate all enemy JSON files"""
    print(f"Generating {len(ENEMIES)} enemy files...")
    
    for enemy_id, enemy_data in ENEMIES.items():
        create_enemy_json(enemy_id, enemy_data)
    
    print(f"\nComplete! Generated {len(ENEMIES)} enemy files in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
