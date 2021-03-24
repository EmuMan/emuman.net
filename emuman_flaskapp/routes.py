import random
import json
import os, sys
from flask import render_template, url_for, flash, redirect
from emuman_flaskapp import app
from emuman_flaskapp.data import art_pieces, songtober_2020_songs, discord_bots, spigot_plugins, misc_apps

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
    return render_template("music.html", title="Music")

@app.route("/songtober/2020")
def songtober_2020():
    return render_template("songtober_2020.html", title="Songtober 2020", songs=songtober_2020_songs)

@app.route("/about")
def about():
    return render_template("about.html", title="About Me")