// Default state: enabled
let isEnabled = true;

// Save state to storage on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ enabled: true });
    console.log('✅ Nx Speed installed');
});

// Get state from storage
chrome.storage.local.get(['enabled'], function(result) {
    if (result.enabled !== undefined) {
        isEnabled = result.enabled;
        updateIcon(isEnabled);
    }
});

// Update icon function
function updateIcon(enabled) {
    const iconPath = enabled ? 'icon-active.png' : 'icon-inactive.png';
    chrome.action.setIcon({
        path: {
            16: iconPath,
            48: iconPath,
            128: iconPath
        }
    }).catch((error) => {
        console.log('⚠️ Icon not found, using default');
    });
    
    const title = enabled ? 'Nx Speed: ON ✅' : 'Nx Speed: OFF ❌';
    chrome.action.setTitle({ title: title });
}

// Listen to icon click
chrome.action.onClicked.addListener((tab) => {
    isEnabled = !isEnabled;
    chrome.storage.local.set({ enabled: isEnabled });
    updateIcon(isEnabled);
    
    try {
        chrome.tabs.sendMessage(tab.id, { 
            action: 'toggle',
            enabled: isEnabled 
        }).catch(() => {});
    } catch (error) {}
});

// Listen to messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getStatus') {
        chrome.storage.local.get(['enabled'], function(result) {
            sendResponse({ enabled: result.enabled !== false });
        });
        return true;
    }
});

console.log('✅ Nx Speed background service worker started!');