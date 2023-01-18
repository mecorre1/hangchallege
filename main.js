
    

    const scenarios = {
        repeaters : {
        ready: 1,
        hang: 7,
        shortBreak: 3,
        longBreak: 180,
        longBreakInterval: 6,
        sets: 5
      },
        maxHangs : {
        ready:1,
          hang: 10,
        shortBreak: 120,
        longBreak: 180,
        longBreakInterval: 5,
        sets: 5
      },
        
    };
    var timer = scenarios['repeaters'];

let interval;

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

const scenarioButtons = document.querySelector('#js-scenario-buttons');
scenarioButtons.addEventListener('click', handleScenario);

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector(`[data-scenario="repeaters"]`).click();
});

const progressBar = document.querySelector('#js-progress');

//trigger startTimer when clicking start button
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  const { action } = mainButton.dataset;
  if (action === 'start') {
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    startTimer();
    timer.reps = 0;
  }
  else if (action == 'stop') {
    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    stopTimer();
  }

});

//trigger pause and start when clicking pause button
const mainButtonPause = document.getElementById('js-btn-pause');
mainButtonPause.addEventListener('click', () => {
  const { action } = mainButtonPause.dataset;
  if (action === 'pause') {
    mainButtonPause.dataset.action = 'pause';
    mainButtonPause.textContent = 'pause';
    pauseTimer();
  }
  else if (action == 'resume') {
    mainButtonPause.dataset.action = 'resume';
    mainButtonPause.textContent = 'resume';
    startTimer();
  }

});

function handleScenario(event){
    const {scenario} = event.target.dataset;

    if(!scenario) return

    timer = scenarios[scenario]
    
    stopTimer();
    switchMode('ready');

    document
        .querySelectorAll('button[data-scenario]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-scenario="${scenario}"]`).classList.add('active');
}


function handleMode(event) {
    const {
        mode
    } = event.target.dataset;

    if (!mode) return;


    switchMode(mode);
}

function switchMode(mode) {
    timer.remainingTime = {
        total: timer[mode],
        minutes: 0,
        seconds: timer[mode],
    };

    timer.mode = mode;

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;

    updateClock();
}

function startTimer() {
    mainButtonPause.classList.remove('hidden');
    mainButtonPause.textContent = 'pause';
    mainButtonPause.dataset.action = 'pause';

    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;
  
    interval = setInterval(function() {
      timer.remainingTime = getRemainingTime(endTime);
      updateClock();
  
      total = timer.remainingTime.total;
      if (total <= 0) {
        clearInterval(interval);
        switch (timer.mode) {
          case 'ready':
            switchMode('hang')
            startTimer()
            break;
          case 'hang':
            switchMode('shortBreak')
            startTimer()
            break;
          case 'shortBreak':
            switchMode('ready')
            startTimer()
            timer.reps++;
            break;
          default:
            break;
        }
      }
    }, 1000);
  }

function updateClock() {
    const {
        remainingTime
    } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;
    
    updateProgress();
}

function updateProgress() {
  progressBar.value = 1 - timer.remainingTime.total/timer[timer.mode]

}

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;
  
    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);
  
    return {
      total,
      minutes,
      seconds,
    };
  }

  function stopTimer() {
    clearInterval(interval);

    document.querySelector(`[data-mode="ready"]`).click();

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
    mainButtonPause.classList.add('hidden');
    mainButtonPause.dataset.action = 'pause';
    mainButtonPause.textContent = 'pause';
  }

  function pauseTimer() {
    clearInterval(interval);
    mainButtonPause.dataset.action = 'resume';
    mainButtonPause.textContent = 'resume';
    mainButtonPause.classList.remove('active');
  }