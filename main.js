const scenarios = {
  repeaters: {
    ready: 1,
    hang: 7,
    shortBreak: 3,
    longBreak: 180,
    longBreakInterval: 6,
    sets: 5
  },
  maxHangs: {
    ready: 1,
    hang: 10,
    shortBreak: 120,
    longBreak: 180,
    longBreakInterval: 5,
    sets: 5
  },
  densityHangs: {
    //we will start a bit yolo and the refine
    ready: 1, //ready will match half of hang after the first hang and will be reset after de 3
    hang: -1, //-1 triggers upward counting 
    shortBreak: 0, //shortBreak is hang/2
    longBreak: 180,
    longBreakHangThreshold: 10, //if hang < longBreakHangThreshold longBreak is triggered
    longBreakSetThreshold: 3 //if sets >= longBreakSetThreshold longBreak is triggered
  }

};
var timer = scenarios['repeaters'];

let interval; //timer interval, reset at each stop, paused at paused, resumes at resume.

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
  const {
    action
  } = mainButton.dataset;
  if (action === 'start') {
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    startCountDownTimer();
    timer.reps = 0;
  } else if (action == 'stop') {
    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    stopTimer();
  }

});

//trigger pauseTimer and startTimer when clicking pause/resume button
const mainButtonPause = document.getElementById('js-btn-pause');
mainButtonPause.addEventListener('click', () => {
  const {
    action
  } = mainButtonPause.dataset;
  if (action === 'pause') {
    mainButtonPause.dataset.action = 'pause';
    mainButtonPause.textContent = 'pause';
    pauseTimer();
  } else if (action == 'resume') {
    mainButtonPause.dataset.action = 'resume';
    mainButtonPause.textContent = 'resume';
    startCountDownTimer();
  }
});

function handleScenario(event) {
  const {
    scenario
  } = event.target.dataset;

  if (!scenario) return

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

  updateClock(timer.remainingTime);
}

function startCountDownTimer() {
  mainButtonPause.classList.remove('hidden');
  mainButtonPause.textContent = 'pause';
  mainButtonPause.dataset.action = 'pause';

  let {
    total
  } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  interval = setInterval(function () {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock(timer.remainingTime);

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);
      switch (timer.mode) {
        case 'ready':
          switchMode('hang')
          startCountDownTimer()
          break;
        case 'hang':
          switchMode('shortBreak')
          startCountDownTimer()
          break;
        case 'shortBreak':
          switchMode('ready')
          startCountDownTimer()
          timer.reps++;
          break;
        default:
          break;
      }
    }
  }, 1000);
}

function startCountUpTimer() {
  mainButtonPause.classList.remove('hidden');
  mainButtonPause.textContent = 'pause';
  mainButtonPause.dataset.action = 'pause';

  timer.totalTime = 0;
  timer.sense = 'up';
  
  interval = setInterval(function () {
    timer.totalTime++;
    timer.time = {
      minutes : Number.parseInt(timer.totalTime / 60),
      seconds : timer.totalTime % 60
    };
    updateClock(timer.time);

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);
      switch (timer.mode) {
        case 'ready':
          switchMode('hang')
          startCountDownTimer()
          break;
        case 'hang':
          switchMode('shortBreak')
          startCountDownTimer()
          break;
        case 'shortBreak':
          switchMode('ready')
          startCountDownTimer()
          timer.reps++;
          break;
        default:
          break;
      }
    }
  }, 1000);
}

function updateClock(time) {
  const minutes = `${time.minutes}`.padStart(2, '0');
  const seconds = `${time.seconds}`.padStart(2, '0');

  const min = document.getElementById('js-minutes');
  const sec = document.getElementById('js-seconds');
  min.textContent = minutes;
  sec.textContent = seconds;

  updateProgress();
}

function updateProgress() {
  if(timer.sense == 'up'){
    progressBar.value = timer.time.seconds / 60;
  }
  else{

    progressBar.value = 1 - timer.remainingTime.total / timer[timer.mode]
  }

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