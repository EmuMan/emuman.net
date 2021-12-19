teams = {
    "Dig Team": {
        "leaders": [
            "happ1e"
        ],
        "members": [
            "DigsCraft098",
            "yenmaster",
            "pizzaninjax",
            "xSkady",
            "chunkiest_lad",
            "alteredino"
        ]
    },
    "Great Radical Refreshment": {
        "leaders": [
        ],
        "members": [
            "ptako",
            "Bicren",
            "Hector",
            "jxjxzimm",
            "pickles0906"
        ]
    },
    "Csomething Dsomething": {
        "leaders": [
            "Reckonnect"
        ],
        "members": [
            "Prince_jacky",
            "Erick"
        ]
    },
    "Environmental Federation": {
        "leaders": [
        ],
        "members": [
            "1f1n1ty",
            "Lahoop7"
        ]
    }
}

features = [
    ###########################################
    #################  ITEMS  #################
    ###########################################
    {
        'category': 'Items',
        'entries': [
            {
                'name': 'Test Item',
                'description': [
                    'This is one line of the item\'s description.',
                    'This is another line.'
                ],
                'image': 'test_item.png',
                'pixelart': True,
                'data': [
                    ['Speed', 55],
                    ['Location', 'Sold by {Test NPC}']
                ]
            }
        ]
    },

    ##########################################
    #################  NPCS  #################
    ##########################################
    {
        'category': 'NPCs',
        'entries': [
            {
                'name': 'Test NPC',
                'description': [
                    'Basically the same as items.',
                    'Put lines of description here.',
                    'This NPC only sells you {Test Item}s.'
                ],
                'image': 'test_npc.png',
                'pixelart': False,
                'data': [
                    ['Location', 'Skyloft'],
                    ['Other Stat', 'Yes']
                ]
            }
        ]
    }

]