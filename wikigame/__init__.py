__version__ = '0.1.0'


from crypt import methods
import logging
from flask import Flask, redirect, request, send_from_directory, jsonify
from wikigame.game import get_game_page, get_start, get_target, init_game

from wikigame.wiki import get_page_info, get_wiki

app = Flask(__name__)
init_game()


@app.route('/fonts/<path:path>')
def send_fonts(path):
    return send_from_directory('static/fonts', path)


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)


@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)


@app.route('/', strict_slashes=True)
@app.route('/index.html')
def send_home():
    logging.warning([request.url, request.path, request.base_url])
    if (
        not request.base_url.endswith('/')
        and not request.base_url.endswith('/index.html')
    ):
        redirect('./index.html')
    return send_from_directory('static', 'index.html')


@app.route('/api/<language>/game/<gamename>')
def start_game(language, gamename):
    wiki = get_wiki(language)
    target = get_target(wiki, gamename)
    start = get_start(wiki, gamename)
    return jsonify(target=target, start=start)


@app.route('/api/<language>/game/<gamename>/page', methods=["POST"])
def check_page(language, gamename):
    data = request.get_json()
    wiki = get_wiki(language)
    info = get_game_page(wiki, gamename, data['page'])
    if info is None:
        return jsonify(None)
    return jsonify(**info)

