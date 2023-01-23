const scenarios = {
  repeaters: {
    ready: 1,
    hang: 7,
    shortBreak: 3,
    longBreak: 180,
    longBreakInterval: 6,
    sets: 5,
    scenario:'repeaters'
  },
  maxHangs: {
    ready: 1,
    hang: 10,
    shortBreak: 120,
    longBreak: 180,
    longBreakInterval: 5,
    sets: 5,
    scenario:'maxHangs'
  },
  densityHangs: {
    //we will start a bit yolo and the refine
    ready: 1, //ready will match half of hang after the first hang and will be reset after de 3
    hang: 0, // start at 0. Up count is used.
    shortBreak: 0, //shortBreak is hang/2
    longBreak: 5,
    longBreakHangThreshold: 10, //if hang < longBreakHangThreshold longBreak is triggered
    longBreakRepThreshold: 5, //if sets >= longBreakSetThreshold longBreak is triggered
    maxSetsPerHold : 2,
    scenario:'densityHangs'
  }

};
var timer = scenarios['repeaters'];
timer.progress = [];

let interval; //timer interval, reset at each stop, paused at paused, resumes at resume.

const results = document.querySelector('#hang-time-results');

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
    timer.sets = 0;
    timer.totalSets = 0;
    timer.progress = [];
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
  } else if (action === 'resume') {
    mainButtonPause.dataset.action = 'resume';
    mainButtonPause.textContent = 'resume';
    startCountDownTimer();
  }
});

//trigger breakTimer when clicking of fell button or tapping the space bar
const mainButtonFell = document.getElementById('js-btn-fell');
mainButtonFell.addEventListener('click', () => {
  const {
    action
  } = mainButtonFell.dataset;
  if (action === 'break') {
    breakTimer();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === ' ' && !mainButtonFell.classList.contains('hidden')) {
    e.preventDefault();
    breakTimer();
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
  const endTime = Date.parse(new Date()) + timer[mode] * 1000;

  timer.remainingTime = getRemainingTime(endTime);
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

  timer.sense = 'down';

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
      nextInterval();
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
  }, 1000);
}

function nextInterval(){
  if(timer.scenario == 'densityHangs') {
    let totalTime = timer.totalTime;
    switch (timer.mode) {
      case 'ready':
        switchMode('hang')
        startCountUpTimer()
        mainButtonFell.classList.remove('hidden');
        break;
      case 'hang':
        backupProgress();
        //longBreakHangThreshold -1 (time to press key)
        if(totalTime < (timer.longBreakHangThreshold-1) || timer.reps >= timer.longBreakRepThreshold){
          switchMode('longBreak')  
          timer.sets++;
          timer.totalSets++;
        }
        else{
          timer.shortBreak = parseInt(totalTime / 2) - (1+timer.ready);
          switchMode('shortBreak')  
        }
        startCountDownTimer()
        mainButtonFell.classList.add('hidden');
        
        break;
      case 'shortBreak':
        switchMode('ready')
        startCountDownTimer()
        timer.reps++;
        break;
      case 'longBreak':
        switchMode('ready')
        startCountDownTimer()
        timer.reps++;
        break;
      default:
        break;
    }
  }
  else {
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
  try {
    if(timer.sense == 'up'){
      progressBar.value = timer.time.seconds / 60;
    }
    else{
      progressBar.value = 1 - timer.remainingTime.total / timer[timer.mode]
    }
    
  } catch (error) {
    console.log(error + 'when updating progress bar.');
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

function breakTimer() {
  clearInterval(interval);
  nextInterval();
}

function backupProgress() {
  if(!timer.progress[timer.totalSets]){
    timer.progress[timer.totalSets] = [];
  }
  timer.progress[timer.totalSets].push(timer.totalTime);
  
  //display results
  results.textContent = '';
  let array = timer.progress;
	let resultTable = document.createElement('table');
  resultTable.innerHTML = `<table border="1">
		${array.map((row) => (`
			<tr>
				${Object.values(row).map((value) => (
					`<td>${value}</td>`
				)).join('')}
			</tr>
		`)).join('')}
	</table>
`;
results.appendChild(resultTable);
}

