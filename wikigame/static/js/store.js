window.wikiStore = {
    _LANGUAGE: 'en',
    getLanguage: function getLanguage() { return this._LANGUAGE; },

    _GAME_NAME: 'default',
    getGameName: function getGameName() { return this._GAME_NAME; },
    setGameName: function setGameName(value) { this._GAME_NAME = value; },

    _TARGET: null,
    getTarget: function getTarget() { return this._TARGET; },
    setTarget: function setTarget(target) { this._TARGET = target; },

    _VISITED: {},
    clearVisited: function clearVisited() { this._VISITED = {}; },
    getVisited: function getVisited(location) { return this._VISITED[location]; },
    setVisited: function setVisited(location) { this._VISITED[location.title] = location },
};