const DAY = 1000 * 60 * 60 * 24;
const START = new Date(2022, 1, 6);

function getGameID() {
    const now = new Date();
    return Math.floor((now - START) / DAY);
}


function createLink(destination) {
    const target = destination === wikiStore.getTarget()?.title;
    const visited = wikiStore.getVisited(destination) != null;
    return `<div class="link${target ? ' link-target' : (visited ? ' link-visited' : '')}" onclick="goTo('${destination}');">${destination}</div>`
}

function showPosition(info) {
    const nameDiv = document.getElementById('current-place-name');
    const descriptionDiv = document.getElementById('current-place-description');
    const linksDiv = document.getElementById('current-place-links');
    if (info == null) {
        nameDiv.innerHTML = '!! OOPS A DEAD END !!';
        descriptionDiv.innerHTML = 'Step back to one of the othe options.';
        linksDiv.innerHTML = '';
        return;
    }
    nameDiv.innerHTML = info.title;
    descriptionDiv.innerHTML = info.summary;

    const target = wikiStore.getTarget();    
    if (target == info.title) {
        linksDiv.innerHTML = '';
    } else {
        linksDiv.innerHTML = info.links
            .sort((a, b) => a > b ? 1 : (a === b ? 0 : -1))
            .map(destination => createLink(destination)).join('');
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
    nameDiv.innerHTML = info.title;
    descriptionDiv.innerHTML = info.summary;
}

function showHistory() {
    const visitedDiv = document.getElementById('visited');
    const counterSpan = document.getElementById('pages-counter');
    const history = wikiStore.getHistory();
    visitedDiv.innerHTML = history 
        .map(destination => createLink(destination)).join('');
    counterSpan.innerHTML = `${history.length}`
}

function goTo(destination) {
    axios
        .post(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}/page`, { page: destination })
        .then(function (response) {
            showHistory();
            if (response.data != null) {
                wikiStore.setVisited(response.data);
            }
            showPosition(response.data);
        })
        .catch(function () {
            showHistory();
            showPosition(null);
        });
}

function setup() {
    wikiStore.clearVisited();
    wikiStore.setGameName(`GAME: ${getGameID()}`);
    showHistory();
    axios
        .get(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}`)
        .then(function (response) {
            const { start, target } = response.data ?? {};
            if (start != null) wikiStore.setVisited(start);
            if (target != null) wikiStore.setTarget(target);
            showPosition(start);            
            showTarget(target);
        })
        .catch(function () {
            showPosition(null);
            showTarget(null);
        });
}