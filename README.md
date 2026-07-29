# ⚡ Nx Speed

> **A lightweight browser extension that puts playback speed control on every audio and video, on every site.**

<p align="center">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Platform-Chromium%20%7C%20Edge-4285F4?logo=googlechrome&logoColor=white" alt="Platform Support">
  <img src="https://img.shields.io/badge/Manifest-V3-orange" alt="Manifest V3">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black" alt="Vanilla JS">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  </a>
</p>

---

Nx Speed drops a small floating control onto any page with audio or video and lets you speed it up, slow it down, or jump back to 1x — no matter what site you're on. Built for people who'd rather listen and watch at their own pace.

---

## 🚀 Getting Started

### Project Structure

```
manifest.json     # Extension configuration (Manifest V3)
background.js     # Service worker — tracks on/off state, updates the toolbar icon
content.js        # Injected into every page — draws the control and drives playback speed
```

## Installation

This extension isn't published on a store yet — you load it directly from source.

#### Load Unpacked (Chrome, Edge, Brave, or any Chromium browser)

```bash
git clone https://github.com/AlirezaNoorizadeh/nx-speed.git
```

1. Open `chrome://extensions` (or `edge://extensions` on Edge)
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the cloned `nx-speed` folder
4. Pin the icon from the extensions toolbar for quick access

> **Note:** No special permissions setup needed — the extension only uses `storage` and runs on all pages so it can find media anywhere.

---

## 🌟 Core Features

### On-Page Speed Control

* ⚡ **Floating Controller** — a compact pill with ◀◀ ◀ ⚡ ▶ ▶▶ buttons that appears once media starts playing
* 🎯 **Auto-Detect Media** — finds and tracks whichever `<audio>` or `<video>` element is currently playing
* 🖱️ **Scroll to Adjust** — mouse wheel over the controller for quick ±0.5x (±0.1x with Shift)
* ⌨️ **Keyboard Shortcuts** — Arrow Up/Down/Left/Right to nudge speed while media plays
* 🎨 **Color-Coded Speed** — the display shifts from purple (slow) → blue (1x) → orange → red (fast) so you can tell your speed at a glance
* 🔔 **Toast Feedback** — a brief on-screen confirmation every time speed changes

### Reliable Toggle State

* 🔄 **Synced Across Tabs** — turning the extension on/off from the toolbar icon updates every open tab instantly and consistently, via `chrome.storage.onChanged` rather than per-tab messaging
* 🧼 **Clean Enable/Disable** — event listeners and polling are fully torn down when disabled, so toggling repeatedly never leaks memory or duplicates behavior
* 🛡️ **Shadow DOM Isolation** — the widget renders inside a Shadow DOM so host-page CSS can never distort it, and its own styles never leak onto the page

---

## 🛠️ Technical Implementation

### Architecture

* **Manifest V3** service worker background script (no persistent background page)
* **Single source of truth** — all state lives in `chrome.storage.local`; every context (background worker, every tab's content script) reacts to `storage.onChanged`
* **Zero build step** — plain HTML/CSS/JS, nothing to compile or bundle
* **Zero external requests** — no analytics, no telemetry, no network calls of any kind

### Permissions Used

| Permission | Why it's needed |
|---|---|
| `storage` | Remembers whether the extension is on or off between browser sessions |
| `host_permissions: <all_urls>` | Lets the content script find and control media on any site the user visits |

---

## 🎮 How to Use

### 1. Play Any Media

1. Open any page with audio or video and start playback
2. The floating controller fades in automatically near the bottom-right

### 2. Adjust Speed

3. Tap ▶ / ◀ for ±0.1x, or ▶▶ / ◀◀ for ±0.5x
4. Tap the speed display (⚡) to snap back to 1.0x
5. Scroll over the controller, or use arrow keys, for the same effect

### 3. Toggle the Extension

6. Click the toolbar icon to turn the controller on or off
7. The change applies to every open tab immediately

---

## 🚦 Requirements

* Any Chromium-based browser (Chrome, Edge, Brave, Opera, Vivaldi)
* Developer mode enabled for loading unpacked, until a store listing exists

---

## 🔧 Troubleshooting

### Common Issues

1. **Controller doesn't appear** — make sure media is actually playing (`currentTime > 0`); the controller only shows for active playback
2. **Buttons look disabled (dim)** — no media is currently playing on the page; they light up automatically once playback starts
3. **Speed didn't change after clicking the icon** — this should no longer happen; if it does, please open an issue with your browser version

---

## 📜 License [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

This project is licensed under the MIT License.

---

> A small, focused extension that does one thing — media speed control — and does it everywhere.
