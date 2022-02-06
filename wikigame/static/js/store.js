window.wikiStore = {
    _LANGUAGE: 'en',
    getLanguage: function getLanguage() { return this._LANGUAGE; },

    _GAME_NAME: 'default',
    getGameName: function getGameName() { return this._GAME_NAME; },
    setGameName: function setGameName(value) { this._GAME_NAME = value },
};