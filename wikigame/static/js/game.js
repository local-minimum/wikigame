function createLink(destination) {
    return `<div class="link" onclick="goTo('${destination}');">${destination}</div>`
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
    linksDiv.innerHTML = info.links.map(destination => createLink(destination)).join('');
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

function goTo(destination) {
    axios
        .post(`api/${language}/game/${gameName}/page`, { page: destination })
        .then(function (response) {
            showPosition(response);
        })
        .catch(function () {
            showPosition(null);
        });
}


function setup() {
    const language = 'en';
    const gameName = 'test';
    axios
        .get(`api/${language}/game/${gameName}`)
        .then(function (response) {
            showPosition(response.start);
            showTarget(response.target);
        })
        .catch(function () {
            showPosition(null);
            showTarget(null);
        });
}