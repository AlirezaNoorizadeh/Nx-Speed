// ============ Nx Speed - Audio/Video Speed Controller ============

let isEnabled = true;
let container = null;
let speedDisplay = null;
let btnNextFast, btnNext, btnPrev, btnPrevFast = null;
let currentSpeed = 1;
let targetElement = null;
let isMediaPlaying = false;

// ============ Get status from background ============
try {
    chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
        if (response && response.enabled !== undefined) {
            isEnabled = response.enabled;
            if (isEnabled) {
                createUI();
            }
        }
    });
} catch (error) {
    isEnabled = true;
    createUI();
}

// ============ Listen to messages from background ============
try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'toggle') {
            isEnabled = message.enabled;
            if (isEnabled) {
                createUI();
            } else {
                removeUI();
            }
        }
    });
} catch (error) {}

// ============ Functions ============

function removeUI() {
    const oldContainer = document.querySelector('.custom-speed-btn');
    if (oldContainer) oldContainer.remove();
    const oldToast = document.querySelector('.custom-speed-toast');
    if (oldToast) oldToast.remove();
    container = null;
}

// ============ Enable/Disable buttons ============
function setButtonsEnabled(enabled) {
    const buttons = [btnPrevFast, btnPrev, btnNext, btnNextFast];
    const opacity = enabled ? '1' : '0.3';
    const pointerEvents = enabled ? 'auto' : 'none';
    
    buttons.forEach(btn => {
        if (btn) {
            btn.style.opacity = opacity;
            btn.style.pointerEvents = pointerEvents;
            btn.style.cursor = enabled ? 'pointer' : 'default';
        }
    });
    
    if (speedDisplay) {
        if (enabled) {
            speedDisplay.style.opacity = '1';
            speedDisplay.style.cursor = 'pointer';
        } else {
            speedDisplay.style.opacity = '0.5';
            speedDisplay.style.cursor = 'default';
        }
    }
}

// ============ Check playing status ============
function checkPlayingStatus() {
    const allMedia = document.querySelectorAll('audio, video');
    let isPlaying = false;
    
    for (let element of allMedia) {
        if (!element.paused && !element.ended && element.currentTime > 0) {
            isPlaying = true;
            targetElement = element;
            break;
        }
    }
    
    isMediaPlaying = isPlaying;
    setButtonsEnabled(isPlaying);
    
    if (isPlaying && targetElement) {
        const color = getSpeedColor(targetElement.playbackRate || 1);
        speedDisplay.textContent = '⚡ ' + (targetElement.playbackRate || 1).toFixed(1) + 'x';
        speedDisplay.style.background = color.bg;
        speedDisplay.style.boxShadow = `0 0 25px ${color.shadow}`;
    } else {
        speedDisplay.textContent = '⏸️ 1.0x';
        speedDisplay.style.background = '#555';
        speedDisplay.style.boxShadow = 'none';
    }
    
    return isPlaying;
}

// ============ Media event listeners ============
function setupMediaListeners() {
    document.addEventListener('play', function(e) {
        if (e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO')) {
            targetElement = e.target;
            checkPlayingStatus();
        }
    }, true);
    
    document.addEventListener('pause', function(e) {
        if (e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO')) {
            setTimeout(checkPlayingStatus, 100);
        }
    }, true);
    
    document.addEventListener('ended', function(e) {
        if (e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO')) {
            setTimeout(checkPlayingStatus, 100);
        }
    }, true);
    
    setInterval(checkPlayingStatus, 2000);
}

function createUI() {
    if (document.querySelector('.custom-speed-btn')) return;
    
    container = document.createElement('div');
    container.className = 'custom-speed-btn';
    container.style.cssText = `
        position:fixed;
        bottom:60px;
        right:20px;
        z-index:99999;
        background:rgba(0,0,0,0.85);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        border-radius:50px;
        padding:6px 10px;
        display:flex;
        align-items:center;
        gap:3px;
        box-shadow:0 8px 32px rgba(0,0,0,0.5);
        border:1px solid rgba(255,255,255,0.1);
        user-select:none;
        -webkit-tap-highlight-color:transparent;
        font-family:sans-serif;
        direction:ltr;
    `;

    const btnStyle = `
        background:rgba(255,255,255,0.08);
        color:#fff;
        border:none;
        border-radius:30px;
        padding:8px 10px;
        font-size:18px;
        transition:all 0.2s ease;
        display:flex;
        align-items:center;
        justify-content:center;
        min-width:36px;
        height:40px;
        font-weight:bold;
        font-family:sans-serif;
        touch-action:manipulation;
        opacity:0.3;
        pointer-events:none;
        cursor:default;
    `;

    btnPrevFast = document.createElement('button');
    btnPrevFast.textContent = '◀◀';
    btnPrevFast.style.cssText = btnStyle + 'font-size:16px;padding:8px 6px;letter-spacing:-2px;';
    btnPrevFast.title = 'Decrease 0.5x';

    btnPrev = document.createElement('button');
    btnPrev.textContent = '◀';
    btnPrev.style.cssText = btnStyle + 'font-size:20px;padding:8px 8px;';
    btnPrev.title = 'Decrease 0.1x';

    speedDisplay = document.createElement('div');
    speedDisplay.style.cssText = `
        min-width:70px;
        text-align:center;
        color:#fff;
        font-size:17px;
        font-weight:bold;
        font-family:sans-serif;
        padding:4px 10px;
        background:#555;
        border-radius:25px;
        letter-spacing:0.5px;
        transition:all 0.3s ease;
        cursor:default;
        box-shadow:none;
        opacity:0.5;
    `;
    speedDisplay.textContent = '⏸️ 1.0x';

    btnNext = document.createElement('button');
    btnNext.textContent = '▶';
    btnNext.style.cssText = btnStyle + 'font-size:20px;padding:8px 8px;';
    btnNext.title = 'Increase 0.1x';

    btnNextFast = document.createElement('button');
    btnNextFast.textContent = '▶▶';
    btnNextFast.style.cssText = btnStyle + 'font-size:16px;padding:8px 6px;letter-spacing:-2px;';
    btnNextFast.title = 'Increase 0.5x';

    container.appendChild(btnPrevFast);
    container.appendChild(btnPrev);
    container.appendChild(speedDisplay);
    container.appendChild(btnNext);
    container.appendChild(btnNextFast);

    document.body.appendChild(container);
    
    setupMediaListeners();
    attachEvents();
    setTimeout(checkPlayingStatus, 500);
}

function attachEvents() {
    btnPrevFast.onclick = function() {
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        updateSpeed(element, element.playbackRate - 0.5);
    };

    btnPrev.onclick = function() {
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        updateSpeed(element, element.playbackRate - 0.1);
    };

    speedDisplay.onclick = function() {
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        updateSpeed(element, 1);
    };

    btnNext.onclick = function() {
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        updateSpeed(element, element.playbackRate + 0.1);
    };

    btnNextFast.onclick = function() {
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        updateSpeed(element, element.playbackRate + 0.5);
    };

    container.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        const step = e.shiftKey ? 0.1 : 0.5;
        const delta = e.deltaY > 0 ? -step : step;
        let newSpeed = Math.round((element.playbackRate + delta) * 10) / 10;
        if (newSpeed > 4) newSpeed = 0.1;
        if (newSpeed < 0.1) newSpeed = 4;
        updateSpeed(element, newSpeed);
    }, { passive: false });

    container.oncontextmenu = function(e) {
        e.preventDefault();
        if (!isMediaPlaying) { showToast('⚠️ No media is playing!'); return; }
        const element = getTargetElement();
        if (!element) { showToast('⚠️ No audio/video found!'); return; }
        let newSpeed = Math.round((element.playbackRate - 0.5) * 10) / 10;
        if (newSpeed < 0.1) newSpeed = 4;
        updateSpeed(element, newSpeed);
    };
}

// ============ Get target element ============
function getTargetElement() {
    if (targetElement && !targetElement.paused && !targetElement.ended) {
        return targetElement;
    }
    
    const allMedia = document.querySelectorAll('audio, video');
    for (let element of allMedia) {
        if (!element.paused && !element.ended) {
            targetElement = element;
            return element;
        }
    }
    
    return null;
}

// ============ Get speed color ============
function getSpeedColor(speed) {
    if (speed === 1) return { bg: '#2196F3', shadow: 'rgba(33,150,243,0.4)' };
    if (speed < 1) return { bg: '#9C27B0', shadow: 'rgba(156,39,176,0.4)' };
    if (speed > 1 && speed <= 2) {
        const t = (speed - 1) / 1;
        const r = Math.round(33 + (76 - 33) * t);
        const g = Math.round(150 + (175 - 150) * t);
        const b = Math.round(243 - (243 - 80) * t);
        return { bg: `rgb(${r}, ${g}, ${b})`, shadow: `rgba(${r}, ${g}, ${b}, 0.4)` };
    } else if (speed > 2 && speed <= 3) {
        const t = (speed - 2) / 1;
        const r = Math.round(76 + (255 - 76) * t);
        const g = Math.round(175 + (235 - 175) * t);
        const b = Math.round(80 - (80 - 0) * t);
        return { bg: `rgb(${r}, ${g}, ${b})`, shadow: `rgba(${r}, ${g}, ${b}, 0.4)` };
    } else {
        const t = Math.min((speed - 3) / 1, 1);
        const r = Math.round(255 - (255 - 244) * t);
        const g = Math.round(235 - (235 - 67) * t);
        const b = Math.round(0 - (0 - 54) * t);
        return { bg: `rgb(${r}, ${g}, ${b})`, shadow: `rgba(${r}, ${g}, ${b}, 0.4)` };
    }
}

// ============ Update speed ============
function updateSpeed(element, newSpeed) {
    if (!element) return;
    
    if (newSpeed > 4) newSpeed = 0.1;
    if (newSpeed < 0.1) newSpeed = 4;
    newSpeed = Math.round(newSpeed * 10) / 10;
    element.playbackRate = newSpeed;
    currentSpeed = newSpeed;
    targetElement = element;
    
    const color = getSpeedColor(newSpeed);
    speedDisplay.textContent = '⚡ ' + newSpeed.toFixed(1) + 'x';
    speedDisplay.style.background = color.bg;
    speedDisplay.style.boxShadow = `0 0 25px ${color.shadow}`;
    container.style.borderColor = color.shadow;
    container.style.boxShadow = `0 8px 32px ${color.shadow.replace('0.4', '0.2')}`;
    
    const type = element.tagName === 'VIDEO' ? '🎬 Video' : '🎵 Audio';
    showToast(type + ' ⚡ ' + newSpeed.toFixed(1) + 'x');
}

// ============ Show toast message ============
function showToast(msg) {
    const old = document.querySelector('.custom-speed-toast');
    if (old) old.remove();
    
    const toast = document.createElement('div');
    toast.className = 'custom-speed-toast';
    toast.textContent = msg;
    toast.style.cssText = `
        position:fixed;
        bottom:125px;
        left:50%;
        transform:translateX(-50%);
        background:rgba(0,0,0,0.85);
        color:#fff;
        padding:8px 20px;
        border-radius:20px;
        font-size:16px;
        z-index:99999;
        font-family:sans-serif;
        direction:ltr;
        pointer-events:none;
        box-shadow:0 4px 15px rgba(0,0,0,0.3);
        animation:fadeInUp 0.2s ease;
        font-weight:bold;
    `;
    
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes fadeInUp {
                from { opacity:0; transform:translateX(-50%) translateY(10px); }
                to { opacity:1; transform:translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1200);
}

// ============ Keyboard shortcuts ============
document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (!isMediaPlaying) return;
    
    const element = getTargetElement();
    if (!element) return;
    
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        let newSpeed = Math.round((element.playbackRate + 0.1) * 10) / 10;
        if (newSpeed > 4) newSpeed = 0.1;
        updateSpeed(element, newSpeed);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        let newSpeed = Math.round((element.playbackRate - 0.1) * 10) / 10;
        if (newSpeed < 0.1) newSpeed = 4;
        updateSpeed(element, newSpeed);
    }
});

// ============ Click on media to select ============
document.addEventListener('click', function(e) {
    const element = e.target.closest('audio, video');
    if (element) {
        targetElement = element;
        setTimeout(checkPlayingStatus, 200);
    }
});

// ============ Initial load ============
if (document.readyState === 'complete') {
    if (isEnabled) setTimeout(createUI, 300);
} else {
    document.addEventListener('DOMContentLoaded', function() {
        if (isEnabled) setTimeout(createUI, 300);
    });
}

console.log('✅ Nx Speed activated!');
console.log('🎯 Click on any <audio> or <video> to select it');
console.log('▶️ Buttons are disabled until media starts playing');
console.log('📋 Controls: ◀◀ ◀ ⚡ ▶ ▶▶');
console.log('   ◀◀ = -0.5x  |  ◀ = -0.1x  |  ⚡ = Reset 1x  |  ▶ = +0.1x  |  ▶▶ = +0.5x');
console.log('🔄 Cycle: 0.1x → 4x and back');