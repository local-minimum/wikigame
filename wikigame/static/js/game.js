const DAY = 1000 * 60 * 60 * 24;
const START = new Date(2022, 1, 6);

function getGameID() {
    const now = new Date();
    return Math.floor((now - START) / DAY);
}

function createLink(destination, disabled=false) {
    const target = destination === wikiStore.getTarget()?.title;
    const visited = wikiStore.getVisited(destination) != null;
    const node = document.createTextNode(destination);
    const div = document.createElement('div');
    div.className = `link${target ? ' link-target' : (visited ? ' link-visited' : '')}`; 
    div.onclick = () => (disabled ? null : goTo(destination));
    div.appendChild(node);
    return div;
}

function showPosition(info) {
    const nameDiv = document.getElementById('current-place-name');
    const descriptionDiv = document.getElementById('current-place-description');
    const linksDiv = document.getElementById('current-place-links');
    removeChildren(linksDiv);
    if (info == null) {
        nameDiv.innerHTML = '!! OOPS A DEAD END !!';
        descriptionDiv.innerHTML = 'Step back to one of the othe options.';
        return;
    }
    removeChildren(nameDiv);
    nameDiv.appendChild(document.createTextNode(info.title));
    removeChildren(descriptionDiv);
    descriptionDiv.appendChild(document.createTextNode(info.summary));

    const target = wikiStore.getTarget();    
    if (target.title == info.title) {
        // Show happiness?
    } else {
        info.links
            .sort((a, b) => a.localeCompare(b))
            .forEach(destination => {
                const link = createLink(destination);
                linksDiv.appendChild(link);
            });
    }
}

function showTarget(info) {
    const nameDiv = document.getElementById('target-place-name');
    const descriptionDiv = document.getElementById('target-place-description');
    if (info == null) {
        nameDiv.innerHTML = '!! OOPS GAME CORRUPT !!';
        descriptionDiv.innerHTML = 'Sorry about that try again tomorrow.';
        return;
    }
    removeChildren(nameDiv);
    removeChildren(descriptionDiv);
    nameDiv.appendChild(document.createTextNode(info.title));
    descriptionDiv.appendChild(document.createTextNode(info.summary));
}

function renderAHistory(contentId, counterId, history) {
    const target = wikiStore.getTarget()?.title;
    const historyDiv = document.getElementById(contentId);
    const counterSpan = document.getElementById(counterId);
    removeChildren(historyDiv);
    const reachedTarget = history.some(destination => destination === target);
    history 
        .forEach(destination => {
            const link = createLink(destination, reachedTarget);
            historyDiv.appendChild(link);
        });
    const n = Math.max(0, history.length - 1);
    counterSpan.innerHTML = `(${n} click${n !== 1 ? 's' : ''})`
    return reachedTarget;
}

function showHistory() {
    const history = wikiStore.getHistory();
    const reachedTarget = renderAHistory('visited', 'pages-counter', history);
    if (reachedTarget) {
        showCongratulations();
        if (wikiStore.getHasChallenge()) {
            hideChallengerInfo();
            showChallengerResults();
        }
    }
}

function goTo(destination) {
    showNavigating();
    axios
        .post(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}/page`, { page: destination })
        .then(function (response) {
            if (response.data != null) {
                wikiStore.setVisited(response.data);
            }
            showHistory();
            showPosition(response.data);
            hideNavigating();
        })
        .catch(function () {
            showHistory();
            showPosition(null);
            hideNavigating();
        });
}

function setup(setGameName=true) {
    showNavigating();
    hideCongratulations();
    hideChallenger();
    wikiStore.setHasChallenge(false);
    wikiStore.clearVisited();
    if (setGameName) wikiStore.setGameName(`GAME: ${getGameID()}`);
    axios
        .get(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}`)
        .then(function (response) {
            const { start, target } = response.data ?? {};
            if (start != null) {
                wikiStore.setVisited(start);
                wikiStore.setStart(start);
            }
            if (target != null) wikiStore.setTarget(target);
            
            showPosition(start);            
            showTarget(target);
            showHistory();
            hideNavigating();
        })
        .catch(function () {
            showPosition(null);
            showTarget(null);
            showHistory();
            hideNavigating();
        });
}

const setCustomGame = () => {
    const inp = document.getElementById('custom-target');
    const target = inp.value.trim();
    showNavigating();
    wikiStore.setHasChallenge(false);
    hideChallenger();

    axios
        .post(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}/page`, { page: target })
        .then(function (response) {
            if (response.data != null) {
                wikiStore.clearVisited();
                wikiStore.setTarget(response.data);
                const start = wikiStore.getStart();
                showPosition(start);
                wikiStore.setVisited(start)
                showTarget(response.data);
                hideCustom();
                hideNavigating();
            } else {
                showCustomError('Could not locate a page with that name.');
                hideNavigating();
            }
        })
        .catch(function () {
            showCustomError('An error occurred looking for the page.');
            hideNavigating();
        });
}

const createChallengeLink = () => {
    const query = {
        gameName: wikiStore.getGameName(),
        target: wikiStore.getTarget().title,
        language: wikiStore.getLanguage(),
        challenge: btoa(JSON.stringify(wikiStore.getHistory())),
    }
    const baseUrl = window.location.href.split('?')[0];
    const url = new URL(baseUrl);
    Object.entries(query).forEach(([key, value]) => url.searchParams.append(key, value));
    return url;
}

const challenge = () => {
    const url = createChallengeLink();
    const share = `Try to beat my run: ${url}`;
    navigator.clipboard.writeText(share);
    const shareBtn = document.getElementById('share-challenge');
    if (shareBtn == null) return;
    shareBtn.innerHTML = "Copied!"
    window.setTimeout(() => {
        shareBtn.innerHTML = 'Share Challenge';
    }, 1000);    
}

const preSetupFromParams = () => {
    const params = new URL(window.location).searchParams;
    const gameName = params.get('gameName');
    const challenge = params.get('challenge');
    if (challenge != null) {
        const challengeHistory = JSON.parse(atob(challenge));
        wikiStore.setHasChallenge(true);
        prepareChallengerResults(challengeHistory);
    }
    if (gameName != null) {
        wikiStore.setGameName(gameName);        
    } else {
        wikiStore.setHasChallenge(false);
        hideChallenger();
    }
    const language = params.get('language');
    if (language != null) {
        wikiStore.setLanguage(language);        
    } else {
        wikiStore.setHasChallenge(false);
        hideChallenger();
    }
    const target = params.get('target');
    if (target != null) {
        showNavigating();
        axios
            .post(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}/page`, { page: target })
            .then(function (response) {
                if (response.data != null) {
                    wikiStore.clearVisited();
                    wikiStore.setTarget(response.data);
                    showTarget(response.data);
                    axios
                        .get(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}`)
                        .then(function (response) {
                            const { start } = response.data ?? {};
                            if (start != null) {
                                wikiStore.setVisited(start);
                                wikiStore.setStart(start);
                                showPosition(start);
                                showChallenger();
                                showHistory();
                            } else {
                                showPosition(null);
                                showHistory();
                            }
                            hideNavigating();
                        })
                        .catch(function () {
                            showPosition(null);
                            showHistory();
                            hideNavigating();
                        });
                } else {
                    showTarget(null);
                    showHistory();
                    hideNavigating();
                }
            })
            .catch(function () {
                showTarget(null);
                showHistory();
                hideNavigating();
            });

    } else {
        wikiStore.setHasChallenge(false);
        hideChallenger();
        setup(gameName == null);
    }
}