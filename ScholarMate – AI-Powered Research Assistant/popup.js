// popup.js - UI interactions and messaging with background worker
const inputEl = document.getElementById("inputText");
const outputEl = document.getElementById("output");
const summarizeBtn = document.getElementById("summarizeBtn");
const translateBtn = document.getElementById("translateBtn");
const proofreadBtn = document.getElementById("proofreadBtn");
const grabSelectionBtn = document.getElementById("grabSelectionBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

// New elements for settings
const settingsLink = document.getElementById("settingsLink");
const settingsPanel = document.getElementById("settingsPanel");
const aiModeSelect = document.getElementById("aiModeSelect");
const themeRadios = document.querySelectorAll('input[name="theme"]');
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const settingsStatus = document.getElementById("settingsStatus");

const DEFAULT_SETTINGS = {
    theme: 'light',
    aiMode: 'hybrid' // built-in -> cloud
};

// --- Settings Persistence & Theme Application ---

function saveSettings() {
    const newSettings = {
        theme: document.querySelector('input[name="theme"]:checked').value,
        aiMode: aiModeSelect.value
    };
    chrome.storage.local.set(newSettings, () => {
        settingsStatus.innerText = "Settings saved.";
        setTimeout(() => (settingsStatus.innerText = ""), 2000);
    });
}

function loadSettings() {
    chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
        // Apply Theme
        document.body.className = settings.theme === 'dark' ? 'dark-mode' : '';
        document.getElementById(`theme${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}`).checked = true;

        // Apply AI Mode
        aiModeSelect.value = settings.aiMode;
    });
}

// Load settings on startup
loadSettings();

// Event listeners for saving settings
aiModeSelect.addEventListener('change', saveSettings);
themeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        saveSettings();
        // Immediately apply theme change
        document.body.className = radio.value === 'dark' ? 'dark-mode' : '';
    });
});


// Settings visibility toggle
settingsLink.addEventListener("click", (e) => {
    e.preventDefault();
    settingsPanel.style.display = settingsPanel.style.display === "none" ? "block" : "none";
});
closeSettingsBtn.addEventListener("click", () => {
    settingsPanel.style.display = "none";
});

// --- Main Extension Logic ---

grabSelectionBtn.addEventListener("click", async () => {
  inputEl.value = "";
  outputEl.innerText = "Getting selected text...";
  try {
    const selected = await getSelectedTextFromPage();
    inputEl.value = selected || "";
    outputEl.innerText = selected ? "Selected text loaded." : "No selection found on the page.";
  } catch (err) {
    outputEl.innerText = "Error getting selection: " + err.message;
  }
});

summarizeBtn.addEventListener("click", () => sendActionToBackground("summarize"));
translateBtn.addEventListener("click", () => sendActionToBackground("translate"));
proofreadBtn.addEventListener("click", () => sendActionToBackground("proofread"));

copyBtn.addEventListener("click", () => {
  const text = outputEl.innerText || "";
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerText = "Copied!";
    setTimeout(() => (copyBtn.innerText = "Copy Output"), 1200);
  }).catch(() => alert("Copy failed"));
});

clearBtn.addEventListener("click", () => {
  inputEl.value = "";
  outputEl.innerText = "";
});

// messaging to background service worker
function sendActionToBackground(action) {
  const text = inputEl.value.trim();
  if (!text) {
    outputEl.innerText = "Please paste text or grab a selection first.";
    return;
  }
  outputEl.innerText = "Processing...";
  chrome.runtime.sendMessage({ action, text }, (response) => {
    if (!response) {
      outputEl.innerText = "No response from background script.";
      return;
    }
    if (response.success) {
      outputEl.innerText = response.result || JSON.stringify(response.data, null, 2);
    } else {
      // Support structured error help objects from the background script.
      const err = response.error;
      if (err && typeof err === 'object' && err.steps) {
        // Render a friendly, escaped HTML list of steps so users can follow next actions.
        outputEl.innerHTML = '';
        const title = document.createElement('div');
        title.innerText = `Error: ${err.message || 'AI processing failed.'}`;
        title.style.fontWeight = '600';
        outputEl.appendChild(title);

        const ol = document.createElement('ol');
        ol.style.marginTop = '8px';
        err.steps.forEach((s) => {
          const li = document.createElement('li');
          li.innerText = s;
          ol.appendChild(li);
        });
        outputEl.appendChild(ol);

        if (err.note) {
          const note = document.createElement('div');
          note.style.marginTop = '8px';
          note.style.fontSize = '90%';
          note.style.opacity = '0.9';
          note.innerText = err.note;
          outputEl.appendChild(note);
        }
      } else {
        outputEl.innerText = "Error: " + (err || "Unknown");
      }
    }
  });
}

// get selected text from active tab using scripting (no host_permissions required)
async function getSelectedTextFromPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("Active tab not found");
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      return window.getSelection().toString();
    }
  });
  return results?.[0]?.result || "";
}
