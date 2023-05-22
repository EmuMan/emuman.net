import random
import json
import os, sys
import time

from flask import render_template, request, send_from_directory, redirect
from emuman_flaskapp import app
from emuman_flaskapp.data import art_pieces, songtober_2020_songs, misc_apps, original_songs, corn_features
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
    
@app.route("/corn")
def corn():
    return render_template("corn.html", features=corn_features)


@app.route("/")
def index():
    return render_template("index.html", reveal=True)

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

@app.route('/phone_number_tool')
def phone_number_tool():
    return render_template('phone_number_tool.html')

@app.route('/egt_simulator')
def egt_simulator():
    return render_template('gi_egt_simulator.html')
