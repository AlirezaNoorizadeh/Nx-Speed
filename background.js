// ============ Nx Speed - Background Service Worker ============
// State is kept ONLY in chrome.storage.local. Every context (background,
// every content script in every tab) reacts to storage.onChanged, so
// there is a single source of truth and no manual tab-by-tab messaging.

// Set the default state only on first install, never on update/reload,
// so an existing user's OFF preference isn't silently reset.
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.storage.local.set({ enabled: true });
    }
});

function updateIcon(enabled) {
    const iconPath = enabled ? 'icon-active.png' : 'icon-inactive.png';
    chrome.action.setIcon({
        path: {
            16: iconPath,
            48: iconPath,
            128: iconPath
        }
    }).catch(() => {
        // Icon file missing/not yet available — safe to ignore.
    });

    chrome.action.setTitle({
        title: enabled ? 'Nx Speed: ON' : 'Nx Speed: OFF'
    });
}

// Set the correct icon whenever the service worker wakes up
// (install, browser startup, or being re-spawned by Chrome).
chrome.storage.local.get(['enabled'], (result) => {
    updateIcon(result.enabled !== false);
});

// Toggle on icon click — this ONLY writes to storage.
// Every tab's content script updates itself via storage.onChanged.
chrome.action.onClicked.addListener(async () => {
    const { enabled } = await chrome.storage.local.get(['enabled']);
    const newEnabled = !(enabled !== false);
    await chrome.storage.local.set({ enabled: newEnabled });
});

// Keep the toolbar icon in sync with storage changes made from anywhere.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) {
        updateIcon(changes.enabled.newValue !== false);
    }
});
