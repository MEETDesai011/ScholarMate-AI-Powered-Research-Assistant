// content_script.js - example (not used by default)
// This runs when injected and can send selected text to background or popup
(() => {
  const selected = window.getSelection().toString();
  chrome.runtime.sendMessage({ action: "pageSelection", text: selected });
})();