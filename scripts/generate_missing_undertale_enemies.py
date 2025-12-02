#!/usr/bin/env python3
"""
Generate missing Undertale enemy JSON files based on the fight info document.
This creates detailed enemy data with accurate attack patterns.
"""

import json
import os

# Missing Undertale enemies that need to be created
ENEMIES = {
    # Snowdin enemies
    "chilldrake": {
        "name": "Chilldrake",
        "hp": 44,
        "attack": 7,
        "defense": 0,
        "gold": 12,
        "exp": 6,
        "spareThreshold": 100,
        "dialogue": [
            "* Chilldrake saunters up!",
            "* Chilldrake is trying to be  \n  cool.",
            "* Chilldrake is thinking about  \n  its jokes.",
            "* Smells like popsicles."
        ],
        "checkText": "ATK 7 DEF 0\\n* Rebels against everything!!\\n  Looking for its friend Snowy.",
        "sprites": {"idle": ["Battle/Enemies/02 - Snowdin/Ice Drake/spr_icedrakebattle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Joke", "effect": "joke", "text": "* You tell a joke.\\n* Chilldrake laughs!", "mercyIncrease": 40},
            {"name": "Ignore", "effect": "ignore", "text": "* You ignore Chilldrake.\\n* It gets mad!", "mercyIncrease": 0}
        ],
        "attackPatterns": [{
            "name": "Ice Attack",
            "duration": 4500,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 4, "speed": 2.5, "size": 15, "side": "top"},
                {"time": 1500, "type": "projectiles", "count": 5, "speed": 3, "size": 15, "side": "left"},
                {"time": 3000, "type": "projectiles", "count": 4, "speed": 2.5, "size": 15, "side": "right"}
            ]
        }]
    },
    
    "doggo": {
        "name": "Doggo",
        "hp": 70,
        "attack": 8,
        "defense": 2,
        "gold": 30,
        "exp": 30,
        "spareThreshold": 100,
        "dialogue": [
            "* Doggo blocks the way!",
            "* Doggo is fast asleep.",
            "* Doggo is questioning your  \n  movements.",
            "* Smells like wet dog."
        ],
        "checkText": "ATK 8 DEF 2\\n* Easily excited by movement.\\n  Hopelessly near-sighted.",
        "sprites": {"idle": ["Battle/Enemies/02 - Snowdin/Doggo/spr_doggo_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You pet Doggo.\\n* He's so happy!", "mercyIncrease": 100}
        ],
        "attackPatterns": [{
            "name": "Blue Sword Sweep",
            "duration": 4000,
            "waves": [
                {"time": 500, "type": "blue_sweep", "speed": 2, "orientation": "horizontal"}
            ]
        }]
    },
    
    "dogamy_dogaressa": {
        "name": "Dogamy & Dogaressa",
        "hp": 108,
        "attack": 8,
        "defense": 4,
        "gold": 60,
        "exp": 60,
        "spareThreshold": 100,
        "dialogue": [
            "* This couple cannot be split up!",
            "* Dogamy and Dogaressa are  \n  thinking about dinner.",
            "* The dogs are practicing  \n  their marriage.",
            "* Smells like a sleepover."
        ],
        "checkText": "ATK 8 DEF 4\\n* Husband & wife team!\\n  Synchronicity is key.",
        "sprites": {"idle": ["Battle/Enemies/02 - Snowdin/Dogamy + Dogaressa/spr_marriedbattle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Roll Around", "effect": "roll", "text": "* You roll around.\\n* The dogs are amused!", "mercyIncrease": 30},
            {"name": "Pet", "effect": "pet", "text": "* You pet the dogs.\\n* They wag their tails!", "mercyIncrease": 70}
        ],
        "attackPatterns": [{
            "name": "Double Axes",
            "duration": 5000,
            "waves": [
                {"time": 0, "type": "axes", "count": 2, "speed": 3, "pattern": "heart"},
                {"time": 2000, "type": "heart_bullets", "count": 8, "speed": 2.5, "pattern": "ring"},
                {"time": 3500, "type": "axes", "count": 2, "speed": 3.5, "pattern": "heart"}
            ]
        }]
    },
    
    "lesser_dog": {
        "name": "Lesser Dog",
        "hp": 60,
        "attack": 8,
        "defense": 0,
        "gold": 25,
        "exp": 20,
        "spareThreshold": 100,
        "dialogue": [
            "* Lesser Dog appeared!",
            "* Lesser Dog is barking  \n  excitedly.",
            "* Lesser Dog wants to play.",
            "* Smells like dog treats."
        ],
        "checkText": "ATK 8 DEF 0\\n* Wields a deadly battle axe.\\n  Desperate for affection.",
        "sprites": {"idle": ["Battle/Enemies/02 - Snowdin/Lesser Dog/spr_lesserdogbattle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You pet Lesser Dog.\\n* It gets more excited!", "mercyIncrease": 25}
        ],
        "attackPatterns": [{
            "name": "Dog Bark",
            "duration": 4000,
            "waves": [
                {"time": 1000, "type": "bark", "count": 1, "speed": 4, "orientation": "vertical"}
            ]
        }]
    },
    
    "greater_dog": {
        "name": "Greater Dog",
        "hp": 105,
        "attack": 8,
        "defense": 4,
        "gold": 40,
        "exp": 80,
        "spareThreshold": 100,
        "dialogue": [
            "* Greater Dog shows up!",
            "* Greater Dog is watching you  \n  intently.",
            "* Greater Dog wants some pets.",
            "* Smells like puppy breath."
        ],
        "checkText": "ATK 8 DEF 4\\n* A very excitable dog.\\n  Unable to see enemies.",
        "sprites": {"idle": ["Battle/Enemies/02 - Snowdin/Greater Dog/spr_greatdog_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pet", "effect": "pet", "text": "* You pet Greater Dog.\\n* It's very happy!", "mercyIncrease": 33}
        ],
        "attackPatterns": [{
            "name": "Dog Attacks",
            "duration": 5000,
            "waves": [
                {"time": 0, "type": "dog_head", "speed": 2, "color": "blue_white"},
                {"time": 2500, "type": "annoying_dog", "speed": 3, "trigger": "movement"}
            ]
        }]
    },
    
    # Waterfall enemies
    "temmie": {
        "name": "Temmie",
        "hp": 5,
        "attack": 20,
        "defense": -20,
        "gold": 10,
        "exp": 0,
        "spareThreshold": 100,
        "dialogue": [
            "* hOI! i'm tEMMIE!",
            "* Temmie vibrates intensely.",
            "* Temmie is flexing.",
            "* Smells like Temmie Flakes."
        ],
        "checkText": "ATK 20 DEF -20\\n* The cutest thing ever!\\n  Also forgot enemy name...",
        "sprites": {"idle": ["Battle/Enemies/03 - Waterfall/Temmie/spr_temmiebattle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Talk", "effect": "talk", "text": "* You talk to Temmie.\\n* hOI!", "mercyIncrease": 30},
            {"name": "Flex", "effect": "flex", "text": "* You flex at Temmie.\\n* Temmie does not approve!", "mercyIncrease": 0}
        ],
        "attackPatterns": [{
            "name": "Temmie Flakes",
            "duration": 4000,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 6, "speed": 2, "size": 12, "side": "top"},
                {"time": 1500, "type": "projectiles", "count": 5, "speed": 2.5, "size": 12, "side": "left"}
            ]
        }]
    },
    
    "mad_dummy": {
        "name": "Mad Dummy",
        "hp": 200,
        "attack": 8,
        "defense": 7,
        "gold": 0,
        "exp": 0,
        "spareThreshold": 0,
        "dialogue": [
            "* Mad Dummy is blocking the way!",
            "* Mad Dummy is getting more mad.",
            "* Mad Dummy is screaming.",
            "* Smells like cotton and rage."
        ],
        "checkText": "ATK 8 DEF 7\\n* Too resilient to give up.\\n  A possessed training dummy.",
        "sprites": {"idle": ["Battle/Enemies/03 - Waterfall/Mad Dummy/spr_maddummy_body.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Cheer", "effect": "cheer", "text": "* You cheer.\\n* Mad Dummy is confused!", "mercyIncrease": 33}
        ],
        "attackPatterns": [{
            "name": "Dummy Army",
            "duration": 6000,
            "waves": [
                {"time": 0, "type": "dummy_swarm", "count": 5, "speed": 2},
                {"time": 2000, "type": "rockets", "count": 3, "speed": 3.5},
                {"time": 4000, "type": "knife", "count": 1, "speed": 4}
            ]
        }]
    },
    
    # Hotland enemies
    "royal_guards": {
        "name": "Royal Guards",
        "hp": 150,
        "attack": 9,
        "defense": 4,
        "gold": 100,
        "exp": 140,
        "spareThreshold": 100,
        "dialogue": [
            "* The Royal Guards appear!",
            "* 01 and 02 are on duty.",
            "* The guards stand proudly.",
            "* Smells like armor polish."
        ],
        "checkText": "ATK 9 DEF 4\\n* These two brothers work\\n  together as guards.",
        "sprites": {"idle": ["Battle/Enemies/04 - Hotland/Royal Guards/spr_02battle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Clean Armor", "effect": "clean", "text": "* You clean their armor.\\n* They appreciate it!", "mercyIncrease": 50}
        ],
        "attackPatterns": [{
            "name": "Guard Combo",
            "duration": 5500,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 6, "speed": 2.5, "size": 15, "side": "top"},
                {"time": 2000, "type": "star_bullets", "count": 5, "speed": 3},
                {"time": 3500, "type": "projectiles", "count": 7, "speed": 3, "size": 15, "side": "bottom"}
            ]
        }]
    },
    
    "so_sorry": {
        "name": "So Sorry",
        "hp": 1100,
        "attack": 9,
        "defense": -6,
        "gold": 300,
        "exp": 1,
        "spareThreshold": 100,
        "dialogue": [
            "* So Sorry appears!",
            "* So Sorry is drawing something.",
            "* So Sorry is apologizing.",
            "* Smells like art supplies."
        ],
        "checkText": "ATK 9 DEF -6\\n* This creature is definitely  \\n  'art' in motion.",
        "sprites": {"idle": ["Battle/Enemies/04 - Hotland/So Sorry/spr_sosorry_normal_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Draw", "effect": "draw", "text": "* You draw something nice.\\n* So Sorry is happy!", "mercyIncrease": 100}
        ],
        "attackPatterns": [{
            "name": "Art Attack",
            "duration": 7000,
            "waves": [
                {"time": 0, "type": "tail_slash", "count": 2, "speed": 3},
                {"time": 2000, "type": "paper_balls", "count": 8, "speed": 2.5},
                {"time": 4500, "type": "doodle_arms", "count": 4, "speed": 3}
            ]
        }]
    },
    
    # Hard Mode enemies
    "parsnik": {
        "name": "Parsnik",
        "hp": 50,
        "attack": 8,
        "defense": 7,
        "gold": 5,
        "exp": 5,
        "spareThreshold": 100,
        "dialogue": [
            "* Parsnik shows up!",
            "* Parsnik is posing dramatically.",
            "* Parsnik is being rebellious.",
            "* Smells like parsnips."
        ],
        "checkText": "ATK 8 DEF 7\\n* Hard Mode only.\\n* A rebellious root vegetable.",
        "sprites": {"idle": ["Battle/Enemies/01 - Ruins/Parsnik/spr_parsnikbattle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Devour", "effect": "devour", "text": "* You devour Parsnik.", "mercyIncrease": 100}
        ],
        "attackPatterns": [{
            "name": "Root Attack",
            "duration": 4000,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 5, "speed": 2.5, "size": 15, "side": "top"},
                {"time": 2000, "type": "projectiles", "count": 6, "speed": 3, "size": 15, "side": "bottom"}
            ]
        }]
    },
    
    "moldessa": {
        "name": "Moldessa",
        "hp": 52,
        "attack": 8,
        "defense": 5,
        "gold": 12,
        "exp": 6,
        "spareThreshold": 100,
        "dialogue": [
            "* Moldessa oozes up!",
            "* Moldessa is posing.",
            "* Moldessa wiggles provocatively.",
            "* Smells like a beauty salon."
        ],
        "checkText": "ATK 8 DEF 5\\n* Hard Mode only.\\n* A slime in its prime.",
        "sprites": {"idle": ["Battle/Enemies/01 - Ruins/Moldessa/spr_moldbyggbattle_hardmode_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Impress", "effect": "impress", "text": "* You pose. Moldessa is  \\n  impressed!", "mercyIncrease": 100}
        ],
        "attackPatterns": [{
            "name": "Slime Attack",
            "duration": 4500,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 6, "speed": 2, "size": 15, "side": "top"},
                {"time": 2000, "type": "exploding_slime", "count": 3, "speed": 2.5}
            ]
        }]
    },
    
    "migospel": {
        "name": "Migospel",
        "hp": 60,
        "attack": 8,
        "defense": 6,
        "gold": 8,
        "exp": 7,
        "spareThreshold": 100,
        "dialogue": [
            "* Migospel buzzed up!",
            "* Migospel is preaching.",
            "* Migospel is looking for  \\n  followers.",
            "* Smells like incense."
        ],
        "checkText": "ATK 8 DEF 6\\n* Hard Mode only.\\n* A missionary for monsters.",
        "sprites": {"idle": ["Battle/Enemies/01 - Ruins/Migospel/spr_migospbattle_hardmode_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pray", "effect": "pray", "text": "* You pray.\\n* Migospel is pleased!", "mercyIncrease": 100}
        ],
        "attackPatterns": [{
            "name": "Gospel Attack",
            "duration": 4500,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 5, "speed": 2.5, "size": 15, "side": "top"},
                {"time": 2000, "type": "projectiles", "count": 6, "speed": 3, "size": 15, "side": "left"}
            ]
        }]
    },
    
    "glyde": {
        "name": "Glyde",
        "hp": 220,
        "attack": 9,
        "defense": 5,
        "gold": 120,
        "exp": 100,
        "spareThreshold": 100,
        "dialogue": [
            "* Glyde glides in!",
            "* Glyde is selling wares.",
            "* Glyde is looking smug.",
            "* Smells like expensive cologne."
        ],
        "checkText": "ATK 9 DEF 5\\n* A wealthy art dealer.\\n* Trades in rare artifacts.",
        "sprites": {"idle": ["Battle/Enemies/02 - Snowdin/Glyde/spr_glydebattle_0.png"]},
        "acts": [
            {"name": "Check", "effect": "check"},
            {"name": "Pay", "effect": "pay", "text": "* You pay Glyde.\\n* Glyde is satisfied!", "mercyIncrease": 100}
        ],
        "attackPatterns": [{
            "name": "Glyde Attack",
            "duration": 5000,
            "waves": [
                {"time": 0, "type": "projectiles", "count": 6, "speed": 2.5, "size": 15, "side": "top"},
                {"time": 2000, "type": "projectiles", "count": 7, "speed": 3, "size": 15, "side": "left"},
                {"time": 3500, "type": "projectiles", "count": 6, "speed": 3, "size": 15, "side": "right"}
            ]
        }]
    }
}

def create_enemy_json(enemy_id, enemy_data):
    """Create a JSON file for an enemy."""
    filename = f"data/enemies/{enemy_id}.json"
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w') as f:
        json.dump(enemy_data, f, indent=4)
    
    print(f"Created {filename}")

def main():
    print("Generating missing Undertale enemy files...")
    print(f"Total enemies to create: {len(ENEMIES)}")
    
    for enemy_id, enemy_data in ENEMIES.items():
        create_enemy_json(enemy_id, enemy_data)
    
    print(f"\nSuccessfully created {len(ENEMIES)} enemy files!")

if __name__ == "__main__":
    main()
