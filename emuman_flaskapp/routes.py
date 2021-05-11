import random
import json
import os, sys
from flask import render_template, url_for, flash, redirect, request
from emuman_flaskapp import app
from emuman_flaskapp.data import art_pieces, songtober_2020_songs, discord_bots, spigot_plugins, misc_apps, original_songs
from emuman_flaskapp.test_1f1t_data import teams
from emuman_flaskapp.raot_data import faq_entries

@app.route("/")
def index():
    return render_template("index.html")
    
@app.route("/discordbots")
def discordbots():
    return render_template("discordbots.html", title="Discord Bots", bots=discord_bots)

@app.route("/spigotplugins")
def spigotplugins():
    return render_template("spigotplugins.html", title="Spigot Plugins", plugins=spigot_plugins)
    
@app.route("/miscprogramming")
def miscprogramming():
    return render_template("miscprogramming.html", title="Misc Programming", applications=misc_apps)
    
@app.route("/art")
def art():
    return render_template("art.html", title="Art", art_rows=[art_pieces[i:i + 3] for i in range(0, len(art_pieces), 3)])

@app.route("/music")
def music():
    return render_template("music.html", title="Music", songs=original_songs)

@app.route("/songtober/2020")
def songtober_2020():
    return render_template("songtober_2020.html", title="Songtober 2020", songs=songtober_2020_songs)

@app.route("/cbrenders")
def cbrenders():
    season = int(request.args.get("season", default=1, type=int))
    if season < 1:
        season = 1
    elif season > 6:
        season = 6
    return render_template("cbrenders.html", season=season)

@app.route("/about")
def about():
    return render_template("about.html", title="About Me")

@app.route("/1f1t_test")
def test_1f1t():
    return render_template("1f1t_index.html", start_day=True)

@app.route("/1f1t_test/custom_aspects")
def test_1f1t_ca():
    return render_template("1f1t_custom_aspects.html", title="Custom Aspects")

@app.route("/1f1t_test/teams")
def test_1f1t_teams():
    entries = []
    for team, info in teams.items():
        entry = {}
        entry["acronym"] = "".join([word[0] for word in team.split(" ")]).upper()
        entry["name"] = team
        entry["leaders"] = ", ".join(info["leaders"]) if len(info["leaders"]) > 0 else ""
        entries.append(entry)
    return render_template("1f1t_teams.html", title="Teams", entries=entries)

@app.route("/1f1t_test/teams/<acronym>")
def test_1f1t_teams_specific(acronym):
    for team, info in teams.items():
        if "".join([word[0] for word in team.split(" ")]).lower() == acronym.lower():
            return render_template("1f1t_teams_specific.html", team=team, acronym=acronym.upper(), info=info)
    return redirect(url_for("test_1f1t_teams"))

@app.route("/1f1t_test/seasons")
def test_1f1t_seasons():
    return render_template("1f1t_seasons.html", title="Seasons")

@app.route("/1f1t_test/contributors")
def test_1f1t_contributors():
    return render_template("1f1t_contributors.html", title="Contributors")

@app.route("/1f1t_test/map")
def test_1f1t_map():
    return render_template("1f1t_map.html", title="Map View")

@app.route("/raot")
def test_raot():
    return render_template("raot_index.html")

@app.route("/raot/leaderboards")
def test_raot_leaderboards():
    race_map = request.args.get('map', default="cube", type=str)
    if race_map not in ("cube", "spin", "cave"):
        race_map = "cube"
    raot_leaderboard_entries = [{"rank": i, "player": "EmuMan", "distance": "very far", "date": "01/01/2021"} for i in range(1, 20)]
    return render_template("raot_leaderboards.html", title="Leaderboards", map=race_map, entries=raot_leaderboard_entries)

@app.route("/raot/faq")
def test_raot_faq():
    return render_template("raot_faq.html", title="FAQ", entries=faq_entries)

@app.route("/raot/competitive")
def test_raot_competitive():
    return render_template("raot_competitive.html", title="Competitive")