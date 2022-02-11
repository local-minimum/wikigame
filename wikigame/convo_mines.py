from collections import Counter
from functools import lru_cache
from random import Random

from wikigame.wiki import get_page_info
from .game import get_target 


@lru_cache(maxsize=200)
def get_game_board(wiki, gamename, game_size=20, bombs=3, links=30):
    pages = []
    page_titles = set()
    seen_links = Counter()
    r = Random()
    r.seed(hash(wiki.language + gamename))

    # collect pages
    page = get_target(wiki, gamename)
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
        r.shuffle(common)
        seen_links[common[0]] = -1
        page = get_page_info(wiki, gamename, common[0], max_links=100)  # get extra links building it up

    # limit links but keep connectivity
    for page in pages:
        must_keep = [l for l in page['links'] if l in page_titles]
        optionals = [l for l in page['links'] if l not in page_titles]
        r.shuffle(optionals)
        keepers = (must_keep + optionals)[:links]
        r.shuffle(keepers)
        page['links'] = keepers


    indices = list(range(len(pages)))
    r.shuffle(indices)
    starts = indices[bombs:]
    if len(starts) < 2:
        raise ValueError('Not enough non-bombs')
    r.shuffle(starts)
    
    return {
        "pages": pages,
        "bombs": indices[:bombs],
        "start": starts[0],
    }
        
