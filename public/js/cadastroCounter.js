let counterEl = document.querySelector(".code-time-counter");

const now = new Date();
let timeExp = new Date();
timeExp.setMinutes(now.getMinutes() + 5);

function atualizaCounter() {
    if ((timeExp - now) > 0) {
        let timeAtual = new Date(timeExp - now);
    
        counterEl.innerHTML = `${((timeAtual.getMinutes()).toString()).padStart(2, '0')}:${((timeAtual.getSeconds()).toString()).padStart(2, '0')}`;
        timeExp.setSeconds(timeExp.getSeconds() - 1);
    }
    else {
        counterEl.innerHTML = `00:00`;
        clearInterval(counterInterval);
    }
}

atualizaCounter();

let counterInterval = setInterval(atualizaCounter, 1000);