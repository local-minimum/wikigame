const hideCongratulations = () => {
    const infoDiv = document.getElementById('congratulations');
    infoDiv.className = 'hidden';
};

const showCongratulations = () => {
    const infoDiv = document.getElementById('congratulations');
    infoDiv.className = '';
};

const hideHowToPlay = () => {
    const infoDiv = document.getElementById('how-to-play');
    infoDiv.className = 'hidden';
};

const showHowToPlay = () => {
    const infoDiv = document.getElementById('how-to-play');
    infoDiv.className = 'instructions';
    wikiStore.setHasSeenRules();
};

const hideNavigating = () => {
    const busyDiv = document.getElementById('busy');
    busyDiv.className = 'hidden';
};

const showNavigating = () => {
    const busyDiv = document.getElementById('busy');
    busyDiv.className = 'busy';
};

const removeChildren = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
};

const showLanguage = () => {
    const langDiv = document.getElementById('languages');
    langDiv.className = 'languages';
};

const hideLanguage = () => {
    const langDiv = document.getElementById('languages');
    langDiv.className = 'hidden';
};

const setLanguage = (language) => {
    wikiStore.setLanguage(language);
    hideLanguage();
    hideChallenger();
    setup();
};

const showCustom = () => {
    const customDiv = document.getElementById('custom-game');
    customDiv.className = 'custom-game';
    const customErrDiv = document.getElementById('custom-game-error');
    customErrDiv.innerHTML = '';
};

const hideCustom = () => {
    const customDiv = document.getElementById('custom-game');
    customDiv.className = 'hidden';
};

const showCustomError = (errorMsg) => {
    const customErrDiv = document.getElementById('custom-game-error');
    customErrDiv.innerHTML = errorMsg;
}

const showChallenger = () => {
    const challengerDiv = document.getElementById('challenger');
    challengerDiv.className = '';
};

const hideChallenger = () => {
    const challengerDiv = document.getElementById('challenger');
    challengerDiv.className = 'hidden';
};

const showChallengerInfo = () => {
    const challengerInfoDiv = document.getElementById('challenger-info');
    challengerInfoDiv.className = '';
};

const hideChallengerInfo = () => {
    const challengerInfoDiv = document.getElementById('challenger-info');
    challengerInfoDiv.className = 'hidden';
};

const showChallengerResults = () => {
    const challengerResultDiv = document.getElementById('challenger-results');
    challengerResultDiv.className = '';
};

const hideChallengerResults = () => {
    const challengerResultDiv = document.getElementById('challenger-results');
    challengerResultDiv.className = 'hidden';
};

const prepareChallengerResults = (challengerHistory) => {
    hideChallengerResults();
    showChallengerInfo();
    showChallenger();    
    renderAHistory('challenger-history', 'challenger-counter', challengerHistory);
}