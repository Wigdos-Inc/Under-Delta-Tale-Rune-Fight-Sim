#!/usr/bin/env python3
"""
Generate all Undertale boss JSON files
These are major boss encounters with unique mechanics
"""

import json
import os

OUTPUT_DIR = "/workspaces/Under-Delta-Tale-Rune-Fight-Sim/data/enemies/bosses"
os.makedirs(OUTPUT_DIR, exist_ok=True)

BOSSES = {
    "toriel": {
        "name": "Toriel",
        "hp": 440,
        "attack": 6,
        "defense": 1,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Toriel prepares a magical attack.",
            "* Toriel is acting aloof.",
            "* Toriel is looking through you.",
            "* Smells like butterscotch pie."
        ],
        "checkText": "ATK 6 DEF 1\n* Knows best for you.",
        "sprites": {
            "idle": [
                "Battle/Characters/Toriel/spr_toriel_talk_0.png"
            ]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Talk", "effect": "talk", "text": "* You talk to Toriel.\n* She doesn't want to listen.", "mercyIncrease": 10},
            {"name": "Spare", "effect": "spare", "text": "* You spared Toriel.", "mercyIncrease": 5}
        ],
        "attackPatterns": [
            {
                "name": "Fire Magic",
                "duration": 5000,
                "waves": [
                    {"time": 0, "type": "projectiles", "count": 8, "speed": 2, "size": 20, "side": "top"},
                    {"time": 1000, "type": "projectiles", "count": 8, "speed": 2, "size": 20, "side": "bottom"},
                    {"time": 2000, "type": "projectiles", "count": 8, "speed": 2, "size": 20, "side": "left"},
                    {"time": 3000, "type": "projectiles", "count": 8, "speed": 2, "size": 20, "side": "right"}
                ]
            }
        ]
    },
    
    "papyrus": {
        "name": "Papyrus",
        "hp": 680,
        "attack": 8,
        "defense": 2,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Papyrus is preparing a\n  non-bone attack.",
            "* Papyrus is rattling his bones.",
            "* Papyrus is cooking.",
            "* Smells like bones."
        ],
        "checkText": "ATK 8 DEF 2\n* Likes to say 'Nyeh Heh Heh!'",
        "sprites": {
            "idle": ["Battle/Characters/Papyrus/spr_papyrus_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You tell Papyrus he's cool.\n* NYEH HEH HEH!!!", "mercyIncrease": 20},
            {"name": "Flirt", "effect": "flirt", "text": "* You flirt with Papyrus.\n* His attack dropped!", "mercyIncrease": 30}
        ],
        "attackPatterns": [
            {
                "name": "Bone Attack",
                "duration": 4500,
                "waves": [
                    {"time": 0, "type": "bones", "count": 3, "speed": 3, "orientation": "horizontal"},
                    {"time": 1000, "type": "bones", "count": 3, "speed": 3, "orientation": "vertical"},
                    {"time": 2000, "type": "bones", "count": 4, "speed": 3.5, "orientation": "horizontal"},
                    {"time": 3000, "type": "bones", "count": 4, "speed": 3.5, "orientation": "vertical"}
                ]
            }
        ]
    },
    
    "undyne": {
        "name": "Undyne",
        "hp": 1500,
        "attack": 10,
        "defense": 0,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Undyne attacks!",
            "* Undyne is smiling.",
            "* Undyne points heroically\n  at you.",
            "* Smells like anime."
        ],
        "checkText": "ATK 10 DEF 0\n* The heroine that NEVER gives up.",
        "sprites": {
            "idle": ["Battle/Characters/Undyne/spr_undynebattle_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Challenge", "effect": "challenge", "text": "* You tell Undyne you'll fight her.", "mercyIncrease": 0},
            {"name": "Plead", "effect": "plead", "text": "* You plead with Undyne.", "mercyIncrease": 10}
        ],
        "attackPatterns": [
            {
                "name": "Spear Rain",
                "duration": 5000,
                "waves": [
                    {"time": 0, "type": "projectiles", "count": 10, "speed": 3, "size": 15, "side": "top"},
                    {"time": 1500, "type": "projectiles", "count": 10, "speed": 3, "size": 15, "side": "top"},
                    {"time": 3000, "type": "projectiles", "count": 12, "speed": 3.5, "size": 15, "side": "top"}
                ]
            }
        ]
    },
    
    "mettaton": {
        "name": "Mettaton EX",
        "hp": 1000,
        "attack": 10,
        "defense": 255,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Mettaton poses dramatically!",
            "* Mettaton is checking his\n  ratings.",
            "* Mettaton adjusts his hair.",
            "* Smells like a television studio."
        ],
        "checkText": "ATK 10 DEF 255\n* Lights! Camera! Action!",
        "sprites": {
            "idle": ["Battle/Characters/Mettaton EX/spr_mettatonbattle_pose_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pose", "effect": "pose", "text": "* You strike a pose!\n* The ratings went up!", "mercyIncrease": 20},
            {"name": "Boast", "effect": "boast", "text": "* You boast about your abilities!\n* The ratings went up!", "mercyIncrease": 20},
            {"name": "Yellow", "effect": "yellow", "text": "* You turn the switch to yellow!", "mercyIncrease": 100}
        ],
        "attackPatterns": [
            {
                "name": "Leg Attack",
                "duration": 5000,
                "waves": [
                    {"time": 0, "type": "projectiles", "count": 8, "speed": 3, "size": 20, "side": "left"},
                    {"time": 2000, "type": "projectiles", "count": 8, "speed": 3, "size": 20, "side": "right"}
                ]
            }
        ]
    },
    
    "asgore": {
        "name": "Asgore",
        "hp": 3500,
        "attack": 10,
        "defense": 1,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Asgore prepares a magic attack.",
            "* Asgore is filled with regret.",
            "* Asgore gazes at you.",
            "* Smells like golden flowers."
        ],
        "checkText": "ATK 10 DEF 1\n* The king of the monsters.",
        "sprites": {
            "idle": ["Battle/Characters/Asgore/Head/spr_asgore_head_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Talk", "effect": "talk", "text": "* You talk to Asgore.\n* He looks away.", "mercyIncrease": 0},
            {"name": "Mercy", "effect": "mercy", "text": "* You beg for mercy.", "mercyIncrease": 0}
        ],
        "attackPatterns": [
            {
                "name": "Trident Swipe",
                "duration": 6000,
                "waves": [
                    {"time": 0, "type": "projectiles", "count": 12, "speed": 3, "size": 25, "side": "top"},
                    {"time": 2000, "type": "projectiles", "count": 12, "speed": 3, "size": 25, "side": "bottom"},
                    {"time": 4000, "type": "projectiles", "count": 15, "speed": 3.5, "size": 25, "side": "top"}
                ]
            }
        ]
    },
    
    "sans": {
        "name": "Sans",
        "hp": 1,
        "attack": 1,
        "defense": 1,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* sans is judging your sins.",
            "* sans is winking.",
            "* ...  ",
            "* Smells like  bad times."
        ],
        "checkText": "ATK 1 DEF 1\n* The easiest enemy.\n* Can only deal 1 damage.",
        "sprites": {
            "idle": ["Battle/Characters/Sans/spr_sansbattle_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Spare", "effect": "spare", "text": "* Sans spares you...", "mercyIncrease": 0}
        ],
        "attackPatterns": [
            {
                "name": "Gaster Blaster",
                "duration": 5000,
                "waves": [
                    {"time": 0, "type": "bones", "count": 5, "speed": 4, "orientation": "horizontal"},
                    {"time": 1000, "type": "bones", "count": 5, "speed": 4, "orientation": "vertical"},
                    {"time": 2000, "type": "bones", "count": 6, "speed": 5, "orientation": "horizontal"},
                    {"time": 3000, "type": "bones", "count": 6, "speed": 5, "orientation": "vertical"}
                ]
            }
        ]
    },
    
    "flowey": {
        "name": "Flowey",
        "hp": 1000,
        "attack": 8,
        "defense": 10,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Flowey laughs maniacally.",
            "* Flowey is thinking about\n  killing everyone.",
            "* Flowey winks at you.",
            "* Smells like flowers."
        ],
        "checkText": "ATK 8 DEF 10\n* Truly evil.",
        "sprites": {
            "idle": ["Battle/Characters/Flowey/General/spr_floweyboss_scared.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Struggle", "effect": "struggle", "text": "* You struggle...", "mercyIncrease": 0}
        ],
        "attackPatterns": [
            {
                "name": "Friendliness Pellets",
                "duration": 4500,
                "waves": [
                    {"time": 0, "type": "circle", "startRadius": 10, "endRadius": 100, "duration": 80},
                    {"time": 1500, "type": "circle", "startRadius": 10, "endRadius": 100, "duration": 80},
                    {"time": 3000, "type": "circle", "startRadius": 10, "endRadius": 100, "duration": 80}
                ]
            }
        ]
    },
    
    "asriel": {
        "name": "Asriel Dreemurr",
        "hp": 9999,
        "attack": 10,
        "defense": 9999,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Asriel prepares to use his\n  full power.",
            "* Asriel is smiling.",
            "* Asriel readies CHAOS SABER.",
            "* Smells like... hopes and dreams."
        ],
        "checkText": "ATK ∞ DEF ∞\n* The absolute GOD of Hyperdeath!",
        "sprites": {
            "idle": ["Battle/Characters/Asriel Dreemurr/God of Hyperdeath/spr_godhyperdeath_form_0.png"]
        },
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Dream", "effect": "dream", "text": "* You think of your dreams.", "mercyIncrease": 10},
            {"name": "Hope", "effect": "hope", "text": "* You think of hope.", "mercyIncrease": 10},
            {"name": "Save", "effect": "save", "text": "* You saved Asriel.", "mercyIncrease": 50}
        ],
        "attackPatterns": [
            {
                "name": "Chaos Saber",
                "duration": 6000,
                "waves": [
                    {"time": 0, "type": "projectiles", "count": 15, "speed": 4, "size": 30, "side": "top"},
                    {"time": 1500, "type": "projectiles", "count": 15, "speed": 4, "size": 30, "side": "bottom"},
                    {"time": 3000, "type": "projectiles", "count": 15, "speed": 4, "size": 30, "side": "left"},
                    {"time": 4500, "type": "projectiles", "count": 15, "speed": 4, "size": 30, "side": "right"}
                ]
            }
        ]
    }
}

def create_boss_json(boss_id, boss_data):
    """Create a JSON file for a boss"""
    filename = os.path.join(OUTPUT_DIR, f"{boss_id}.json")
    with open(filename, 'w') as f:
        json.dump(boss_data, f, indent=4)
    print(f"Created {filename}")

def main():
    """Generate all boss JSON files"""
    print(f"Generating {len(BOSSES)} boss files...")
    
    for boss_id, boss_data in BOSSES.items():
        create_boss_json(boss_id, boss_data)
    
    print(f"\nComplete! Generated {len(BOSSES)} boss files in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
