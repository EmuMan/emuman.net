import random
import json
import os, sys
import time

from flask import render_template, url_for, redirect, request, send_from_directory, make_response
from emuman_flaskapp import app
from emuman_flaskapp.data import art_pieces, songtober_2020_songs, discord_bots, spigot_plugins, misc_apps, original_songs
from emuman_flaskapp.test_1f1t_data import teams, features
from emuman_flaskapp.raot_data import faq_entries
from emuman_flaskapp.utils import urlify, replace_links, portion, cols2rows

app.jinja_env.globals.update(replace_links=replace_links)
app.jinja_env.globals.update(urlify=urlify)
app.jinja_env.globals.update(portion=portion)
app.jinja_env.globals.update(cols2rows=cols2rows)


@app.route("/robots.txt")
@app.route("/sitemap.xml")
@app.route("/favicon.ico")
def static_from_root():
    return send_from_directory(app.static_folder, request.path[1:])

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', error=True, title="Page Not Found"), 404

@app.after_request
def add_cors_headers(response):
    # https://stackoverflow.com/questions/42681311/flask-access-control-allow-origin-for-multiple-urls
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Headers', 'Cache-Control')
    response.headers.add('Access-Control-Allow-Headers', 'X-Requested-With')
    response.headers.add('Access-Control-Allow-Headers', 'Authorization')
    #response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    return response


@app.route("/streamredirect")
def stream_redirect():
    return render_template("redirect.html")


@app.route("/cpe-123")
def cpe123():
    return render_template('cpe_123_final_project.html')


@app.route("/")
def index():
    return render_template("index.html", reveal=True)
    
@app.route("/discordbots")
def discordbots():
    return render_template("discordbots.html", title="Discord Bots", bots=discord_bots)

@app.route("/spigotplugins")
def spigotplugins():
    return render_template("spigotplugins.html", title="Spigot Plugins", plugins=spigot_plugins)
    
@app.route("/miscprogramming")
def miscprogramming():
    return render_template("miscprogramming.html", title="Misc Programming", applications=misc_apps)

@app.route("/programming")
def programming():
    return render_template("programming.html", title="Programming", applications=misc_apps)
    
@app.route("/art")
def art():
    return render_template("art.html", title="Art", art=art_pieces)

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

@app.route("/for_roark")
def for_roark():
    return render_template("for_roark.html", title="For Roark")

@app.route("/fake_grubhub")
def fake_grubhub():
    restaurant = request.args.get('restaurant', default="Sunday Brunch", type=str)
    order = request.args.get('order', default=931, type=int)
    return render_template("fake_grubhub.html", title="Fake Grubhub", restaurant=restaurant, order=order, time=time.strftime('%I:%M%p', time.localtime()))

@app.route('/fake_screener')
def fake_screener():
    name = request.args.get('name', default='Name', type=str)
    email = request.args.get('email', default='Email', type=str)
    return render_template('fake_screener.html', title='Fake Screener', name=name, email=email)

@app.route('/phone_number_tool')
def phone_number_tool():
    return render_template('phone_number_tool.html')

@app.route('/egt_simulator')
def egt_simulator():
    return render_template('gi_egt_simulator.html')

@app.route("/1f1t")
def test_1f1t():
    return render_template("1f1t_index.html", start_day=True)

@app.route("/1f1t/features")
def test_1f1t_features():
    # maybe cache/preload all of this at some point?
    return render_template("1f1t_features.html", title="Features", features=features)

@app.route('/1f1t/features/<feature>')
def test_1f1t_feature(feature):
    # again, caching would be cool here
    for category in features:
        for f in category['entries']:
            if str(feature).lower() == urlify(f['name']).lower():
                return render_template('1f1t_features_specific.html', title=f['name'], feature=f)
    return redirect(url_for('test_1f1t_features'))

@app.route("/1f1t/teams")
def test_1f1t_teams():
    entries = []
    for team, info in teams.items():
        entry = {}
        entry["acronym"] = "".join([word[0] for word in team.split(" ")]).upper()
        entry["name"] = team
        entry["leaders"] = ", ".join(info["leaders"]) if len(info["leaders"]) > 0 else ""
        entries.append(entry)
    return render_template("1f1t_teams.html", title="Teams", entries=entries)

@app.route("/1f1t/teams/<acronym>")
def test_1f1t_teams_specific(acronym):
    for team, info in teams.items():
        if "".join([word[0] for word in team.split(" ")]).lower() == acronym.lower():
            return render_template("1f1t_teams_specific.html", team=team, acronym=acronym.upper(), info=info)
    return redirect(url_for("test_1f1t_teams"))

@app.route("/1f1t/seasons")
def test_1f1t_seasons():
    return render_template("1f1t_seasons.html", title="Seasons")

@app.route("/1f1t/contributors")
def test_1f1t_contributors():
    return render_template("1f1t_contributors.html", title="Contributors")

@app.route("/1f1t/map")
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