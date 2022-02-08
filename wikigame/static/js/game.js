const DAY = 1000 * 60 * 60 * 24;
const START = new Date(2022, 1, 6);

function getGameID() {
    const now = new Date();
    return Math.floor((now - START) / DAY);
}


function createLink(destination) {
    const target = destination === wikiStore.getTarget()?.title;
    const visited = wikiStore.getVisited(destination) != null;
    const node = document.createTextNode(destination);
    const div = document.createElement('div');
    div.className = `link${target ? ' link-target' : (visited ? ' link-visited' : '')}`; 
    div.onclick = () => goTo(destination);
    div.appendChild(node);
    return div;
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
    removeChildren(linksDiv);
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
    nameDiv.innerHTML = info.title;
    descriptionDiv.innerHTML = info.summary;
}

function showHistory() {
    const visitedDiv = document.getElementById('visited');
    const counterSpan = document.getElementById('pages-counter');
    const history = wikiStore.getHistory();
    removeChildren(visitedDiv);
    history 
        .forEach(destination => {
            const link = createLink(destination);
            visitedDiv.appendChild(link);
        });
    counterSpan.innerHTML = `${history.length}`
}

function goTo(destination) {
    showNavigating();
    axios
        .post(`api/${wikiStore.getLanguage()}/game/${wikiStore.getGameName()}/page`, { page: destination })
        .then(function (response) {
            showHistory();
            if (response.data != null) {
                wikiStore.setVisited(response.data);
            }
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
            hideNavigating();
        })
        .catch(function () {
            showPosition(null);
            showTarget(null);
            hideNavigating();
        });
}