from flask import Flask

app = Flask(__name__)
app.config["SECRET_KEY"] = "64d3bc803c85485e5a8e1467322a424e"

from emuman_flaskapp import routes