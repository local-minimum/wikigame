from json import load, dump
from collections import Counter
from functools import lru_cache
import logging
from random import Random

from wikigame.wiki import get_page_info
from .game import get_target 

ALLISH_LINKS = 5000
_LOCATION = '/persistance/mines.json'
_KNOWN_GAMES = {}


def init_game():
    try:
        with open(_LOCATION, 'r') as fh:
            for key, value in load(fh):
                _KNOWN_GAMES[tuple(key)] = value
    except FileNotFoundError:
        pass


def _record_mines_game(wiki, game_name, mines_game):
    key = (wiki.language, game_name)
    _KNOWN_GAMES[key] = mines_game 
    with open(_LOCATION, 'w') as fh:
        dump(list(_KNOWN_GAMES.items()), fh)


def filter_links(page_links, reserved, max_links, rng):
    priority = [l for l in page_links if l in reserved]
    optionals = [l for l in page_links if l not in reserved]
    rng.shuffle(optionals)
    keepers = (priority + optionals)[:max_links]
    rng.shuffle(keepers)
    return keepers


def get_rng(wiki, game_name):
    rng = Random()
    rng.seed(hash(wiki.language + game_name))
    return rng


def get_mines_game(wiki, game_name, game_size=20, bombs=3, max_links=30):
    if (mines_game:=_KNOWN_GAMES.get((wiki.language, game_name))) is not None:
        return mines_game
    pages = []
    page_titles = set()
    seen_links = Counter()
    rng = get_rng(wiki, game_name)

    # collect pages
    page = get_target(wiki, game_name)
    logging.warning(f'Convo mines {game_name} seeded by "{page["title"]}" ({wiki.language})')
    while len(pages) < game_size:
        if page is not None:
            pages.append(page)
            page_titles.add(page['title'])
            for l in page['links']:
                if seen_links[l] >= 0:
                    seen_links[l] += 1
        
        common, _ = zip(*seen_links.most_common())
        if len(common) == 0:
            break
        common = list(common)
        rng.shuffle(common)
        seen_links[common[0]] = -1
        page = get_page_info(wiki, game_name, common[0], max_links=ALLISH_LINKS)

    # limit links but keep connectivity
    for page in pages:
        page['links'] = filter_links(page['links'], page_titles, max_links, rng) 

    # shuffle
    rng.shuffle(pages)
    indices = list(range(len(pages)))
    rng.shuffle(indices)
    starts = indices[bombs:]
    if len(starts) < 2:
        raise ValueError('Not enough non-bombs')
    rng.shuffle(starts)

    logging.warning(f'Game {game_name} will have nodes: {page_titles}')
    mines_game = {
        "pages": pages,
        "bombs": indices[:bombs],
        "start": starts[0],
    }
    _record_mines_game(wiki, game_name, mines_game)
    return mines_game
        

@lru_cache(maxsize=2000)
def get_mines_page(wiki, game_name, page_name, pages, max_links=30):
    page = get_page_info(wiki, game_name, page_name, max_links=ALLISH_LINKS)
    if page is None:
        return None
    rng = get_rng(wiki, game_name)
    page['links'] = filter_links(page['links'], pages, max_links, rng)
    return page
