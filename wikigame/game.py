from collections import defaultdict
from functools import lru_cache
from json import dump, load
from glob import glob
import logging

from wikigame.wiki import get_en_page_in_language, get_page_info, get_random_page_name

_LOCATION = '/persistance/games.json'
_TARGETS_PATH = '/data/*.list'
_KNOWN_GAMES = {}


def load_targets():
    counted_targets = {}
    used_targets = defaultdict(int)
    for (lang, _, t) in _KNOWN_GAMES:
        if t != 'target' or lang != 'en':
            continue
        used_targets[t] += 1

    for path in glob(_TARGETS_PATH):
        with open(path, 'r') as fh:
            targets = [w.strip() for w in fh if w.strip()]

        for t in targets:
            if t not in counted_targets:
                counted_targets[t] = used_targets[t]
    return counted_targets


def init_game():
    try:
        with open(_LOCATION, 'r') as fh:
            for key, value in load(fh):
                _KNOWN_GAMES[tuple(key)] = value
        load_targets()
    except FileNotFoundError:
        pass


def _record_chosen(wiki, gamename, which, page):
    language = wiki.language
    key = (language, gamename, which)
    _KNOWN_GAMES[key] = page
    with open(_LOCATION, 'w') as fh:
        dump(list(_KNOWN_GAMES.items()), fh)
    

def get_nice_target():
    counted_targets = load_targets()
    lowest = min(v for v in counted_targets.values())
    options = {k for k, v in counted_targets.items() if v == lowest}
    option = options.pop()
    return option


@lru_cache(maxsize=200)
def get_target(wiki, gamename):
    if (page:=_KNOWN_GAMES.get((wiki.language, gamename, "target"))) is not None:
        return get_page_info(wiki, gamename, page)
    i = 0
    while True:
        en_page = get_nice_target()
        info = get_en_page_in_language(wiki, gamename, en_page) 
        if len(info['links']) > 30:
            break
        i += 1
        if i > 30:
            raise ValueError()
    if info is not None: 
        _record_chosen(wiki, gamename, "target", info['title'])
        logging.warning(f'Decided on "{info["title"]}" target for {gamename} ({wiki.language})')
    return info


@lru_cache(maxsize=200)
def get_start(wiki, gamename):
    target = get_target(wiki, gamename)['title']
    if (page:=_KNOWN_GAMES.get((wiki.language, gamename, "start"))) is not None:
        return get_page_info(wiki, gamename, page, target)
    i = 0
    while True:
        page = get_random_page_name(wiki)
        info = get_page_info(wiki, gamename, page, target) 
        if len(info['links']) > 15 and target not in info['links']:
            break
        i += 1
        if i > 20:
            raise ValueError()
    _record_chosen(wiki, gamename, "start", info['title'])
    logging.warning(f'Decided on "{info["title"]}" start for {gamename} ({wiki.language})')
    return get_page_info(wiki, gamename, info['title'], target)


def get_game_page(wiki, gamename, page):
    target = get_target(wiki, gamename)
    if target is None:
        return None
    info = get_page_info(wiki, gamename, page, target['title'])
    if info is None:
        return None 
    return info