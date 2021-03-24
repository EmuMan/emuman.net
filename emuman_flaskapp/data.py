art_pieces = [
    {
        "file": "desert_scene.png",
        "description": "A quick desert scene I made in Blender, with touch-ups in photoshop."
    },
    {
        "file": "cherry_blossom.png",
        "description": "A quick cherry-blossom-inspired tree that I threw together."
    },
    {
        "file": "gemstones.png",
        "description": "An array of physically accurate gemstones inspired by Steven Universe, rendered using LuxCore."
    }
]

songtober_2020_songs = [
    {
        "day": 1,
        "prompt": "Fish",
        "file": "1.mp3",
        "description": "The main feature of this is the kind of arpeggiated chords in the background through the whole thing. I was kind of going for a \"bloop\" sound, and it sorta worked I guess? The wah-sounding thing at the beginning was supposed to be a little fishy as well, I don’t know why I made that correlation but hey I tried. The bells at the end were supposed to be underwater-y and smooth and stuff. I also drowned the whole thing in reverb (maybe a bit too much) and cut a lot of the high frequencies to add a little bit to the underwater feel."
    },
    {
        "day": 2,
        "prompt": "Wisp",
        "file": "2.mp3",
        "description": "This one is more of a soundscape than anything, which is kinda cool I guess. It's like the song you'd expect to hear when you encounter a mysterious floating glow-y smoke-y thing in the woods at night or something. I used a whole tone scale to try to convey a sort of fantasy vibe for the whole thing. I actually based this off of an old sample I found of a vocal thing that I re-tuned to a single note and then put a crap ton of reverb on. I ran it through some granular synthesis, which is basically playing the sample from different points randomly to create like a whole bunch of the sound but all at different points in time, and then I played it really low and yeah. I hadn't really touched granular synthesis so it was pretty fun. The rest is mostly just ambient wind and chime noise I got off of a website and some extra noise to make the lead sound more breath-y."
    },
    {
        "day": 3,
        "prompt": "Bulky",
        "file": "3.mp3",
        "description": "My first thought was basically that this bass would sound pretty bulky (in my eyes), so I kinda formed everything else around it. It turned out more sneaky than I would have liked, although it still has some of that chunky quality I think. Maybe something bulky sneaking around? I don't know. Other than that I'm actually okay with how it turned out. Also sorry if the bass is too loud or quiet, it's pretty headphone-dependent unfortunately and I went on the louder side."
    },
    {
        "day": 4,
        "prompt": "Radio",
        "file": "4.mp3",
        "description": "So the first thing I thought of when I heard \"radio\" was a sort of sampled lo-fi, retro aesthetic, but like, crunchier. So I kinda went with that here, and it worked out I think. The voice is from this video that I happened to remember."
    },
    {
        "day": 5,
        "prompt": "Blade",
        "file": "5.mp3",
        "description": "For this one I basically downloaded a few different sword sounds and used some percussion loops both from libraries and mine to create the kind of tribal groove going on behind. I also thought it got a little boring near the middle so I decided to add some dramatic orchestra parts to increase the energy. Not terribly well mixed, but oh well."
    },
    {
        "day": 6,
        "prompt": "Rodent",
        "file": "6.mp3",
        "description": "I had been thinking about it for a while. I mean how in the world am I supposed to make a song about rodents??? So I basically just took a kinda squeak-sounding lead and a fast-paced tempo to indicate something scurrying around, maybe running away from something, and went from there. And now I regret everything. I'm also fairly certain that I just completely copied the melody of some other random song out there. Either that or this is the most generic cartoon-y chase music ever written."
    }
]

discord_bots = [
    {
        "name": "corn",
        "pfp": "corn.png",
        "prefix": "c!",
        "descriptions": [
            {
                "text": "corn is one of the first Discord bots I've ever made, but it's still one of my favorites. The rules are simple:",
                "list": [
                    "If a message has the word \"corn\" in it (must be in order, repeated letters are okay) with only punctuation/spaces separating the letters (e.g. \"<b>corn</b>\", \"<b>coooorn</b>\", \"<b>c</b>-<b>o</b>/<b>r</b>.<b>n</b>\", \"epi<b>c or n</b>ot\"), then corn will respond with \"hello corn\".",
                    "If a message has the word \"corn\" in it (must be in order) BUT there are other characters in between (e.g. \"<b>co</b>ol bu<b>rn</b>ing\", \"<b>c</b>ars <b>o</b>n <b>r</b>aw <b>n</b>oodles\", but not \"<b>c</b>ars <b>o</b>f New Je<b>r</b>sey\"), then corn reacts with the 🌽 emoji.",
                    "If an image has corn in it, then corn will react with a corn emoji (this utilizes the Clarifai API, which isn't 100% accurate, but it's pretty good).",
                    "Sometimes corn will give you... another response."
                ]
            },
            {
                "text": "Some other commmands you can give it:",
                "list": [
                    "<code>c!cool_corn &lt;caption&gt;</code> - generates a very cool picture with a given caption.",
                    "<code>c!link</code> - gives the link to add corn to your server."
                ]
            }
        ]
    }
]

spigot_plugins = [
    {
        "name": "InstaDeath",
        "description": "Basically, everything kills you in one hit. Your health will stay at 1/2 of a heart the whole time, and there's nothing you can do about it. Unlike most instant death plugins, the rest of the healthbar is even still there just to make you feel worse about your situation. Armor won't save you either, no matter how small the amount of damage you take is it will kill you. Instantly.",
        "file": "instadeath-1.0.0.jar"
    }
]

misc_apps = [
    {
        "name": "Blender MIDI Utils (Animusic inspired)",
        "descriptions": [
            "If you've ever heard of Animusic, you probably have a pretty good idea of what this does. It basically allows you to take MIDI input and convert it into Blender keyframes, allowing you to easily create Animusic-like animations. Here is a small <a class=\"inline-link\" href=\"https://youtu.be/Duti3pvmtCU\" target=\"_blank\">demo</a> showcasing its capabilities as of now (admittedly not much, but I'm working on it).",
            "If you want to try it out for yourself, you can find the source code and documentation <a class=\"inline-link\" href=\"https://github.com/EmuMan/blender-midi-utils\">here</a>."
        ]
    },
    {
        "name": "Reddit Sheets",
        "descriptions": [
            "Reddit Sheets is a Reddit client built to run in Google Sheets using multiple different API interactions through a Python script. It was conceived when I wanted a good unblocked Reddit client for school use, but I also wanted it to be 1) easily disguised and 2) future-proof.",
            "Unfortunately, since Reddit Sheets uses both the Reddit and Google APIs, both of which have request limits (and would give you basic access to my account), I cannot just go around giving away a link to the sheets page willy-nilly. However, if you would like to set this up for yourself, you can find the source code <a class=\"inline-link\" href=\"https://github.com/EmuMan/reddit-sheets\" target=\"_blank\">here</a>. There are also instructions to help you get started (well there aren't any now but there will be soon)."
        ]
    }
]