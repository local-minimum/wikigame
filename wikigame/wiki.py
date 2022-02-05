import random
import logging
from functools import lru_cache
from sqlite3 import NotSupportedError
from urllib.parse import unquote

import wikipediaapi
import requests

_BASE_URL = 'https://{language}.wikipedia.org/wiki/'
_MAX_LINKS = 20
_ALLOWED_LANGUAGES = {
    'en', 'sv', 'de', 'fr',
}

@lru_cache(maxsize=20)
def get_wiki(language):
    if language in _ALLOWED_LANGUAGES:
        return wikipediaapi.Wikipedia(language)
    raise NotSupportedError()


def _truncate_summary(summary):
    max_len = 200
    if len(summary) <= max_len:
        return summary
    *_, remain = summary[:max_len][::-1].split(' ', 1)
    remain = remain[::-1]
    if remain[-1] not in ('.', '!', '?'):
        return remain + '…'
    return remain


def filter_links(game_name, page_name, links, target=None):
    links = [
        n.split(':', 1) for n in links
    ]
    links = [':'.join([prefix] + rest)
            for prefix, *rest in links
            if not (prefix and rest)  # links that have prefixes are not allowed
    ]
    r = random.Random()
    r.seed(hash(game_name + page_name))
    r.shuffle(links)
    if page_name in links:
        links.remove(page_name)
    if target in links:
        links.remove(target)
        links = links[:(_MAX_LINKS - 1)] + [target]
        r.shuffle(links)
    return links[:_MAX_LINKS]


@lru_cache(maxsize=2000)
def get_page_info(wiki, game_name, page_name, target=None):
    page = wiki.page(page_name)
    if not page.exists():
        logging.error(f'Could not find page "{page_name}"')
        return None
    return {
        "title": page.title,
        "summary":  _truncate_summary(page.summary),
        "links": filter_links(game_name, page_name, page.links.keys(), target)
    }


def get_random_page_name(wiki):
    base = _BASE_URL.format(language=wiki.language)
    response = requests.get(f'{base}Special:Random')
    if (not response.ok):
        return None
    
    return unquote(response.url[len(base):])


if __name__ == "__main__":
    # Demo
    w = get_wiki('en')
    for _ in range(10):
        p = get_random_page_name(w)
        print(get_page_info('game', w, p))