const hideHowToPlay = () => {
    const infoDiv = document.getElementById('how-to-play');
    infoDiv.className = 'hidden';
}

const showHowToPlay = () => {
    const infoDiv = document.getElementById('how-to-play');
    infoDiv.className = 'instructions';
    wikiStore.setHasSeenRules();
};

const hideNavigating = () => {
    const busyDiv = document.getElementById('busy');
    busyDiv.className = 'hidden';
}

const showNavigating = () => {
    const busyDiv = document.getElementById('busy');
    busyDiv.className = 'busy';
}

const removeChildren = (parent) => {
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }

}