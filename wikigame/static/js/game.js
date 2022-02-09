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

function showHistory() {
    const target = wikiStore.getTarget()?.title;
    const visitedDiv = document.getElementById('visited');
    const counterSpan = document.getElementById('pages-counter');
    const history = wikiStore.getHistory();
    removeChildren(visitedDiv);
    const reachedTarget = history.some(destination => destination.title === target);
    history 
        .forEach(destination => {
            const link = createLink(destination, reachedTarget);
            visitedDiv.appendChild(link);
        });
    const n = history.length;
    counterSpan.innerHTML = `${n} click${n !== 1 ? 's' : ''}`
    if (reachedTarget) showCongratulations();
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

function setup() {
    hideCongratulations();
    showNavigating();
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
            wikiStore.setVisited(start);
            hideNavigating();
        })
        .catch(function () {
            showPosition(null);
            showTarget(null);
            hideNavigating();
        });
}