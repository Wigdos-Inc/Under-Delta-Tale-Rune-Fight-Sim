#!/usr/bin/env python3
"""
Generate Deltarune enemy JSON files from sprite folders
"""

import json
import os

# Deltarune Chapter 1 Enemies
ch1_enemies = [
    {
        "name": "Rudinn", "hp": 200, "attack": 6, "defense": 0,
        "folder": "Rudinn + Rudinn Ranger",
        "dialogue": ["* Rudinn blocks the way!", "* Rudinn is posing dramatically.", "* Smells like bubblegum."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Rudinn.", "mercyIncrease": 20}
        ]
    },
    {
        "name": "Hathy", "hp": 180, "attack": 5, "defense": 0,
        "folder": "Hathy + Head Hathy",
        "dialogue": ["* Hathy blocks the way!", "* Hathy adjusts its crown.", "* Smells like royalty."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Bow", "effect": "bow", "text": "* You bow to Hathy.", "mercyIncrease": 30}
        ]
    },
    {
        "name": "Jigsawry", "hp": 220, "attack": 7, "defense": 1,
        "folder": "Jigsawry",
        "dialogue": ["* Jigsawry attacks!", "* Jigsawry is fitting together.", "* Smells like cardboard."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Jigsawry's puzzle.", "mercyIncrease": 25}
        ]
    },
    {
        "name": "Ponman", "hp": 240, "attack": 8, "defense": 2,
        "folder": "Ponman",
        "dialogue": ["* Ponman trots forward!", "* Ponman neighs proudly.", "* Smells like hay."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You pet Ponman.", "mercyIncrease": 30}
        ]
    },
    {
        "name": "Bloxer", "hp": 280, "attack": 9, "defense": 2,
        "folder": "Bloxer",
        "dialogue": ["* Bloxer blocks your path!", "* Bloxer is training.", "* Smells like a gym."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Spar", "effect": "spar", "text": "* You spar with Bloxer.", "mercyIncrease": 30}
        ]
    },
    {
        "name": "Starwalker", "hp": 300, "attack": 10, "defense": 3,
        "folder": "Starwalker",
        "dialogue": ["* These birds are pissing me off...", "* I'm the original                  Starwalker.", "* Smells like stardust."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Original", "effect": "original", "text": "* You acknowledge the original        Starwalker.", "mercyIncrease": 50}
        ]
    }
]

# Deltarune Chapter 2 Enemies
ch2_enemies = [
    {
        "name": "Virovirokun", "hp": 250, "attack": 8, "defense": 1,
        "folder": "Virovirokun",
        "dialogue": ["* Virovirokun is loading...", "* Virovirokun downloaded something.", "* Smells like malware."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Clean", "effect": "clean", "text": "* You clean Virovirokun.", "mercyIncrease": 30}
        ]
    },
    {
        "name": "Ambyu-Lance", "hp": 270, "attack": 9, "defense": 2,
        "folder": "Ambyu Lance",
        "dialogue": ["* Ambyu-Lance speeds forward!", "* Ambyu-Lance sirens loudly.", "* Smells like antiseptic."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Call", "effect": "call", "text": "* You call for help. Ambyu-Lance is pleased.", "mercyIncrease": 40}
        ]
    },
    {
        "name": "Werewire", "hp": 300, "attack": 10, "defense": 2,
        "folder": "Werewire",
        "dialogue": ["* Werewire prowls closer!", "* Werewire howls at the moon.", "* Smells like copper."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You pet Werewire.", "mercyIncrease": 30}
        ]
    },
    {
        "name": "Tasque", "hp": 230, "attack": 8, "defense": 1,
        "folder": "Tasque",
        "dialogue": ["* Tasque obeys orders!", "* Tasque meows electronically.", "* Smells like cat food."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You pet Tasque. It purrs.", "mercyIncrease": 35}
        ]
    },
    {
        "name": "Maus", "hp": 200, "attack": 7, "defense": 0,
        "folder": "Maus",
        "dialogue": ["* Maus clicks around!", "* Maus is squeaking.", "* Smells like circuits."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Click", "effect": "click", "text": "* You click on Maus.", "mercyIncrease": 25}
        ]
    },
    {
        "name": "Swatchling", "hp": 350, "attack": 11, "defense": 3,
        "folder": "Swatchling",
        "dialogue": ["* Swatchling appears!", "* Swatchling adjusts their palette.", "* Smells like paint."],
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Compliment", "effect": "compliment", "text": "* You compliment Swatchling's colors.", "mercyIncrease": 40}
        ]
    }
]

def generate_enemy_json(enemy, chapter, output_dir):
    """Generate enemy JSON file"""
    filename = f"{enemy['name'].lower().replace(' ', '_').replace('-', '_')}.json"
    filepath = os.path.join(output_dir, filename)
    
    # Determine sprite path
    if chapter == "ch1":
        sprite_base = f"Deltarune Sprites/Characters/Enemies/Ch1/{enemy['folder']}/"
    else:
        sprite_base = f"Deltarune Sprites/Characters/Enemies/Ch2/{enemy['folder']}/"
    
    data = {
        "name": enemy["name"],
        "hp": enemy["hp"],
        "attack": enemy["attack"],
        "defense": enemy["defense"],
        "gold": 10,
        "exp": 15,
        "spareThreshold": 100,
        "dialogue": enemy["dialogue"],
        "checkText": f"ATK {enemy['attack']} DEF {enemy['defense']}\\n* A Darkner from {chapter.upper()}.",
        "sprites": {
            "idle": f"{sprite_base}idle_0.png"
        },
        "acts": enemy["acts"],
        "attackPatterns": [
            {
                "name": "Default Attack",
                "duration": 4000,
                "waves": [
                    {
                        "time": 0,
                        "type": "projectiles",
                        "count": 5,
                        "speed": 2.5,
                        "size": 15,
                        "side": "top"
                    },
                    {
                        "time": 1500,
                        "type": "projectiles",
                        "count": 4,
                        "speed": 3,
                        "size": 15,
                        "side": "left"
                    }
                ]
            }
        ]
    }
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)
    
    print(f"Generated: {filepath}")

def main():
    # Create output directories
    output_dir = "data/enemies/deltarune"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating Deltarune enemies...")
    
    # Generate Ch1 enemies
    for enemy in ch1_enemies:
        generate_enemy_json(enemy, "ch1", output_dir)
    
    # Generate Ch2 enemies
    for enemy in ch2_enemies:
        generate_enemy_json(enemy, "ch2", output_dir)
    
    print(f"\nGenerated {len(ch1_enemies) + len(ch2_enemies)} Deltarune enemies!")

if __name__ == "__main__":
    main()
