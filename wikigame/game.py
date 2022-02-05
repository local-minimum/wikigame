from functools import lru_cache
from json import dump, load

from wikigame.wiki import get_page_info, get_random_page_name

_KNOWN_GAMES = {}


def init_game():
    try:
        with open('/games.json', 'r') as fh:
            for key, value in load(fh):
                _KNOWN_GAMES[tuple(key)] = value
    except FileExistsError:
        pass


def _record_chosen(wiki, gamename, which, page):
    language = wiki.language
    key = (language, gamename, which)
    _KNOWN_GAMES[key] = page
    with open('/games.json', 'w') as fh:
        dump(list(_KNOWN_GAMES.items()), fh)
    


@lru_cache(maxsize=200)
def get_target(wiki, gamename):
    if (page:=_KNOWN_GAMES.get((wiki.language, gamename, "target"))) is not None:
        return get_page_info(wiki, gamename, page)
    i = 0
    while True:
        page = get_random_page_name(wiki)
        info = get_page_info(wiki, gamename, page) 
        if len(info['links']) > 10:
            break
        i += 1
        if i > 20:
            raise ValueError()
    _record_chosen(wiki, gamename, "target", page)
    return info


@lru_cache(maxsize=200)
def get_start(wiki, gamename, target):
    if (page:=_KNOWN_GAMES.get((wiki.language, gamename, "start"))) is not None:
        return get_page_info(wiki, gamename, page)
    i = 0
    while True:
        page = get_random_page_name(wiki)
        info = get_page_info(wiki, gamename, page, target) 
        if len(info['links']) > 10 and target not in info['links']:
            break
        i += 1
        if i > 20:
            raise ValueError()
    _record_chosen(wiki, gamename, "start", page)
    return info
