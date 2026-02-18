const mainTimer =  document.getElementById('main-timer');
const subTimer =  document.getElementById('sub-timer');
const startStopBtn =  document.getElementById('start-stop');
const resetBtn = document.getElementById('reset');
// const gauge = document.getElementById('gauge-container');
const themeBtn = document.getElementById('theme-toggle');
// 알람소리
const alarmSound = new Audio('alarm.mp3');
// 페이지 로드시 저장된 테마 확인
const savedTheme = localStorage.getItem('theme'); 
const savedSseionCheck = localStorage.getItem('session');

// 시간 설정
const workInput = document.getElementById('work-input');
const restInput = document.getElementById('rest-input');
const applyBtn = document.getElementById('apply');
const settingBtn = document.getElementById('setting');

let isWorking = true;
let workTime = localStorage.getItem('workTime') ? Number(localStorage.getItem('workTime')) : 25 * 60;
let restTime = localStorage.getItem('restTime') ? Number(localStorage.getItem('restTime')) : 5 * 60;
let workColor = '#ecf0f1';
let restColor = 'green';

let totalTime = workTime;
let remainingTime = totalTime;
let timerId = null;


// 세션 창
const sessionCheck = document.getElementById('session-visible-check');
const sessionShow = document.querySelector('.session-wrapper');

// 페이지 로드시 저장된 테마 확인/세션
if (savedTheme === 'dark') {
    document.body.classList.add('theme-toggle');
}
if (savedSseionCheck === 'show') {
    sessionShow.classList.remove('hidden');
}

updateDisplay();
updateSubTimer();


// 총 공부시간
const totalStudyDisplay = document.getElementById('total-study-time');
let totalStudyTime = localStorage.getItem('totalStudyTime') ? Number(localStorage.getItem('totalStudyTime')): 0;

updateTotalStudyDisplay();

function updateTotalStudyDisplay() {
    let hours = Math.floor(totalStudyTime /3600);
    let minutes = Math.floor((totalStudyTime % 3600)/ 60);
    let seconds = totalStudyTime % 60;

    const result = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    totalStudyDisplay.innerText = result;
}

// 횟수 카운트
const countDisplay = document.getElementById('count'); 
let saveCount = localStorage.getItem('sessionCount');
let sessionCount = (saveCount && !isNaN(saveCount)) ? Number(saveCount) : 0;

countDisplay.innerText = sessionCount;

//기록 초기화
const resetCountBtn = document.getElementById('reset-count');

resetCountBtn.addEventListener('click', () => {
    if (confirm("현재 기록을 초기화 할까요?")) {
        sessionCount = 0;
        countDisplay.innerText = sessionCount;
        localStorage.setItem('sessionCount',0);

        totalStudyTime = 0;
        localStorage.setItem('totalStudyTime',0);

        updateTotalStudyDisplay();
    }
});

// 음량 조절
let volumeContainer = document.getElementById('volume-container');
let volumeControl = document.getElementById('volume-control');

let savedVolume = localStorage.getItem('userVolume') !== null ? Number(localStorage.getItem('userVolume')) : 0.5;
alarmSound.volume = savedVolume;
volumeControl.value = savedVolume;

updateVolumeIcon(savedVolume);

// 음량 아이콘 업데이트
function updateVolumeIcon(volume) {
    const icon = volumeContainer.querySelector('i');

    if (volume == 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}

// 음량 조절
volumeControl.addEventListener('input', (e) => {
    const volume = e.target.value;
    alarmSound.volume = volume;
    updateVolumeIcon(volume);
    localStorage.setItem('userVolume', volume);    
});

volumeControl.addEventListener('change', () => {
    playPreview();
})

function playPreview() {
    alarmSound.pause();
    alarmSound.currentTime = 0;

    alarmSound.play().catch(e => console.log("재생 에러:", e));
}

// 알람 중첩 방지
function playPreview() {
    
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    alarmSound.play().then(() => {
        setTimeout(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        }, 200);
    }).catch(e => console.log("재생 에러:", e));
}

// 타이머 시간 업데이트 함수
function formatTime(num) {
    let minutes = Math.floor( num / 60);
    let seconds = num % 60;
    
    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
    
}

// 테마 전환
const themeCheck = document.getElementById('theme-toggle-check');

if (savedTheme === 'dark') {
    themeCheck.checked = true;
    document.body.classList.add('theme-toggle');
}

themeCheck.addEventListener('change', () => {
    const isNowDark = themeCheck.checked;

    if (isNowDark) {
        document.body.classList.toggle('theme-toggle');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('theme-toggle');
        localStorage.setItem('theme', 'light');
    }
});

// 세션 창

if (savedSseionCheck === 'hidden') {
    sessionCheck.checked = true;
    sessionShow.classList.add('hidden');
}

sessionCheck.addEventListener('change', () => {
    const isNowVisible = sessionCheck.checked;

    if (isNowVisible) {
        sessionShow.classList.toggle('hidden');
        localStorage.setItem('session', 'hidden');
    } else {
        sessionShow.classList.remove('hidden');
        localStorage.setItem('session', 'show');
    }
});


function updateDisplay() {
    const result = formatTime(remainingTime);
    
    mainTimer.innerText = result; 

    const modeLabel = isWorking ? "집중" : "휴식";
    document.title = `(${result}) ${modeLabel} 중 - 꽁모도로`;
}

function updateSubTimer() {
    let nextMode = isWorking ? restTime: workTime;
    
    subTimer.innerText = `${formatTime(nextMode)}`;
}

// 타이머 시작 함수
function startTimer() {
    document.getElementById('timer-container').classList.add('prevent-burn-in');
    if (timerId !== null || workTime === 0) return;
    document.activeElement.blur();

    timerId = setInterval(() => {
        remainingTime--;
    
        if (isWorking) {
            totalStudyTime++
            updateTotalStudyDisplay();

            localStorage.setItem('totalStudyTime', totalStudyTime);
        }

        let progress = (remainingTime/totalTime) * 100;

        if (isWorking) {
            gauge.style.background = `conic-gradient(${workColor} 0% ${progress}%, lightgray ${progress}% 100%)`;
        } else {
            gauge.style.background = `conic-gradient(${restColor} 0% ${progress}%, lightgray ${progress}% 100%)`;
        }

        updateDisplay();

        if (remainingTime <= 0) {
            stopTimer();
            alarmSound.play();
            switchMode();
            startTimer();
        }
    },1000);
}

function stopTimer() {
    document.activeElement.blur();
    document.getElementById('timer-container').classList.remove('prevent-burn-in');

    if (timerId === null) return;

    clearInterval(timerId);

    timerId = null;

}

// 시작/정지 버튼
startStopBtn.addEventListener('click', () => {
    if (timerId === null) {
        startTimer();
        startStopBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    } else {
        stopTimer();
        startStopBtn.innerHTML = `<i class="fas fa-play"></i>`;
    }
});

// 타이머 초기화 함수
function resetTimer() {
    stopTimer();

    remainingTime = totalTime;
    updateDisplay();
    updateSubTimer();

    gauge.style.background = `conic-gradient(${workColor} 0% 100%, lightgray 100% 100%)`;
    startStopBtn.innerHTML = `<i class="fas fa-play"></i>`;
}

// 초기화 버튼
resetBtn.addEventListener('click', () => {
    resetTimer();
})

// 모드 전환
function switchMode() {
    if (isWorking === true) {
        sessionCount++;
        console.log("현재 모드:", isWorking, "세션수:", sessionCount);
        countDisplay.innerText = sessionCount;
        localStorage.setItem('sessionCount', sessionCount);
        console.log("카운트 증가",sessionCount);
    }

    isWorking = !isWorking;

    if (isWorking) {
        remainingTime = workTime;
        totalTime = workTime;
        mainTimer.style.color = workColor;
        gauge.style.background = `conic-gradient(${workColor} 0% 100%, lightgray 100% 100%)`;

    } else {
        remainingTime = restTime;
        totalTime = restTime;
        mainTimer.style.color = restColor;
        gauge.style.background = `conic-gradient(${restColor} 0% 100%, lightgray 100% 100%)`;
    }

    updateDisplay();
    updateSubTimer();
}



// 설정
settingBtn.addEventListener('click', (e) => {
    let settingModal = document.getElementById('setting-modal');
    
    if (settingModal.style.display === 'block') {
        settingModal.style.display = 'none';
    } else {
        settingModal.style.display = 'block';
    }
    e.stopPropagation()
});

applyBtn.addEventListener('click', () => {
    if (workInput.value === "" || restInput.value === "") return;
    
    if (workInput.value >= 60 || restInput.value >= 60) {
            alert("60 이하의 숫자만 입력 가능합니다.");
            return 0;
        }

    workTime = Number(workInput.value) * 60;
    restTime = Number(restInput.value) * 60;

    totalTime = isWorking ? workTime : restTime;
    resetTimer();

    // 설정시간 고정
    localStorage.setItem('workTime', workTime);
    localStorage.setItem('restTime', restTime);
});

// 확인버튼
const okBtn = document.getElementById('okbtn');
okBtn.addEventListener('click', ()=>{    
    document.getElementById('setting-modal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('setting-modal');

    if (e.target !== modal && e.target !== settingBtn && !modal.contains(e.target)) {
        modal.style.display = 'none';
    }
});

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        // 인풋에서 작동방지
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        event.preventDefault();

        if (timerId === null) {
            startTimer();
        } else {
            stopTimer();
        }
    }
});