#!/usr/bin/env python3
"""
Generate Deltarune boss JSON files
"""

import json
import os

# Deltarune Bosses
bosses = [
    {
        "name": "Jevil",
        "chapter": "Ch1",
        "folder": "Jevil/Body",
        "hp": 3500,
        "attack": 12,
        "defense": 10,
        "dialogue": [
            "* CHAOS, CHAOS!",
            "* I CAN DO ANYTHING!",
            "* Jevil laughs maniacally.",
            "* Smells like chaos."
        ],
        "checkText": "ATK 12 DEF 10\\n* The Joker Card. Can do anything.",
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pirouette", "effect": "pirouette", "text": "* You pirouette. Jevil is amused!", "mercyIncrease": 10},
            {"name": "Hypnosis", "effect": "hypnosis", "text": "* You hypnotize Jevil...", "mercyIncrease": 15}
        ],
        "attackPatterns": [
            {
                "name": "Chaos Carousel",
                "duration": 6000,
                "waves": [
                    {"time": 0, "type": "carousel", "count": 8, "speed": 3, "pattern": "circular"},
                    {"time": 2000, "type": "carousel", "count": 12, "speed": 3.5, "pattern": "spiral"},
                    {"time": 4000, "type": "devilsknife", "count": 4, "speed": 4}
                ]
            }
        ]
    },
    {
        "name": "King",
        "chapter": "Ch1",
        "folder": "King/Ch1",
        "hp": 4000,
        "attack": 13,
        "defense": 8,
        "dialogue": [
            "* The King of Spades attacks!",
            "* King laughs wickedly.",
            "* King readies his weapon.",
            "* Smells like tyranny."
        ],
        "checkText": "ATK 13 DEF 8\\n* The King of the Card Kingdom.",
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pacify", "effect": "pacify", "text": "* You try to calm King down...", "mercyIncrease": 0}
        ],
        "attackPatterns": [
            {
                "name": "Spade Attack",
                "duration": 5500,
                "waves": [
                    {"time": 0, "type": "spades", "count": 8, "speed": 3, "side": "top"},
                    {"time": 1500, "type": "spades", "count": 10, "speed": 3.5, "side": "all"},
                    {"time": 3500, "type": "spades", "count": 15, "speed": 4, "side": "all"}
                ]
            }
        ]
    },
    {
        "name": "Spamton NEO",
        "chapter": "Ch2",
        "folder": "Spamton NEO/Parts",
        "hp": 5000,
        "attack": 14,
        "defense": 10,
        "dialogue": [
            "* NOW'S YOUR CHANCE TO BE A [Big Shot]!",
            "* SPAMTON NEO attacks!",
            "* You hear ringing phones.",
            "* Smells like hyperlink blocked."
        ],
        "checkText": "ATK 14 DEF 10\\n* NOW'S YOUR CHANCE TO BE A [Big Shot]",
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "[Call]", "effect": "call", "text": "* You try to call someone...", "mercyIncrease": 5},
            {"name": "[Cut Cable]", "effect": "cut", "text": "* You cut a cable.", "mercyIncrease": 20}
        ],
        "attackPatterns": [
            {
                "name": "Pipis Attack",
                "duration": 6000,
                "waves": [
                    {"time": 0, "type": "pipis", "count": 5, "speed": 2.5},
                    {"time": 2000, "type": "big_shot", "count": 3, "speed": 4},
                    {"time": 4000, "type": "pipis", "count": 8, "speed": 3}
                ]
            }
        ]
    },
    {
        "name": "Queen",
        "chapter": "Ch2",
        "folder": "Queen/Portraits",
        "hp": 4500,
        "attack": 13,
        "defense": 9,
        "dialogue": [
            "* Queen Attacks Lmao",
            "* Queen adjusts her glass.",
            "* Queen is typing.",
            "* Smells like battery acid."
        ],
        "checkText": "ATK 13 DEF 9\\n* The Queen of the Cyber World.",
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Queen's management style.", "mercyIncrease": 15}
        ],
        "attackPatterns": [
            {
                "name": "Acid Attack",
                "duration": 5500,
                "waves": [
                    {"time": 0, "type": "acid", "count": 6, "speed": 3, "side": "top"},
                    {"time": 2000, "type": "acid", "count": 8, "speed": 3.5, "side": "all"},
                    {"time": 4000, "type": "acid", "count": 10, "speed": 4, "side": "all"}
                ]
            }
        ]
    },
    {
        "name": "Tasque Manager",
        "chapter": "Ch2",
        "folder": "Tasque Manager/Ch2",
        "hp": 3800,
        "attack": 12,
        "defense": 8,
        "dialogue": [
            "* Tasque Manager cracks her whip!",
            "* Tasque Manager gives orders.",
            "* Everything is orderly.",
            "* Smells like order."
        ],
        "checkText": "ATK 12 DEF 8\\n* Manages all the Tasques.",
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You try to pet Tasque Manager...", "mercyIncrease": 10},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment her management.", "mercyIncrease": 20}
        ],
        "attackPatterns": [
            {
                "name": "Tasque Swarm",
                "duration": 5000,
                "waves": [
                    {"time": 0, "type": "tasques", "count": 4, "speed": 3},
                    {"time": 1500, "type": "whip", "count": 6, "speed": 4},
                    {"time": 3000, "type": "tasques", "count": 6, "speed": 3.5}
                ]
            }
        ]
    },
    {
        "name": "Sweet Cap'n Cakes",
        "chapter": "Ch2",
        "folder": "Sweet Cap_n Cakes/Sweet",
        "hp": 3600,
        "attack": 11,
        "defense": 7,
        "dialogue": [
            "* Sweet, Cap'n, and K_K attack in harmony!",
            "* They're making music.",
            "* The beat drops.",
            "* Smells like batteries and sugar."
        ],
        "checkText": "ATK 11 DEF 7\\n* Three musical entrepreneurs.",
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Dance", "effect": "dance", "text": "* You dance to the music!", "mercyIncrease": 30},
            {"name": "Applaud", "effect": "applaud", "text": "* You applaud their performance.", "mercyIncrease": 25}
        ],
        "attackPatterns": [
            {
                "name": "Musical Notes",
                "duration": 5500,
                "waves": [
                    {"time": 0, "type": "notes", "count": 8, "speed": 3, "pattern": "musical"},
                    {"time": 2000, "type": "notes", "count": 12, "speed": 3.5, "pattern": "musical"},
                    {"time": 4000, "type": "notes", "count": 10, "speed": 4, "pattern": "musical"}
                ]
            }
        ]
    }
]

def generate_boss_json(boss, output_dir):
    """Generate boss JSON file"""
    name_clean = boss['name'].lower().replace(' ', '_').replace("'", '').replace('-', '_')
    filename = f"{name_clean}.json"
    filepath = os.path.join(output_dir, filename)
    
    sprite_base = f"Deltarune Sprites/Characters/Bosses/{boss['chapter']}/{boss['folder']}/"
    
    data = {
        "name": boss["name"],
        "hp": boss["hp"],
        "attack": boss["attack"],
        "defense": boss["defense"],
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": boss["dialogue"],
        "checkText": boss["checkText"],
        "sprites": {
            "idle": f"{sprite_base}idle_0.png"
        },
        "acts": boss["acts"],
        "attackPatterns": boss["attackPatterns"]
    }
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"Generated: {filepath}")

def main():
    # Create output directory
    output_dir = "data/enemies/deltarune/bosses"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating Deltarune bosses...")
    
    for boss in bosses:
        generate_boss_json(boss, output_dir)
    
    print(f"\nGenerated {len(bosses)} Deltarune bosses!")

if __name__ == "__main__":
    main()
