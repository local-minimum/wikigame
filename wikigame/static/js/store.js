window.wikiStore = {
    _LANGUAGE: 'en',
    getLanguage: function getLanguage() { return this._LANGUAGE; },
    setLanguage: function setLanguage(lang) { this._LANGUAGE = lang; },

    _GAME_NAME: 'game: -42',
    getGameName: function getGameName() { return this._GAME_NAME; },
    setGameName: function setGameName(value) { this._GAME_NAME = value; },

    _START: null,
    getStart: function getStart() { return this._START; },
    setStart: function setStart(start) { this._START = start; },

    _TARGET: null,
    getTarget: function getTarget() { return this._TARGET; },
    setTarget: function setTarget(target) { this._TARGET = target; },

    _VISITED: {},
    _HISTORY: [],
    clearVisited: function clearVisited() { this._VISITED = {}; this._HISTORY = []; },
    getVisited: function getVisited(location) { return this._VISITED[location]; },
    setVisited: function setVisited(location) { 
        this._VISITED[location.title] = location;
        if (!this._HISTORY.some(l => l === location.title)) {
            this._HISTORY.push(location.title);
        }
    },
    getHistory: function getHistory() {
        return this._HISTORY;
    },

    _SEEN_RULES: 'seen_rules',
    getHasSeenRules: function getHasSeenRules() { return localStorage.getItem(this._SEEN_RULES) != null },
    setHasSeenRules: function setHasSeenRules() { localStorage.setItem(this._SEEN_RULES, 'yes'); },
};