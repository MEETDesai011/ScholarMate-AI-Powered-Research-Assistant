# ScholarMate - Development Todo List ✅

## Setup
- [x] Create project folder `scholarmate-extension`
- [x] Create `manifest.json` with basic info (name, version, description, manifest_version = 3)
- [x] Add minimal permissions: `activeTab`, `scripting`, `storage`
- [x] Set `background.service_worker` to `background.js`
- [x] Set `action.default_popup` to `popup.html`

---

## UI (Popup)
- [x] Create `popup.html` with buttons: Summarize, Translate, Proofread
- [x] Add `popup.js` to handle button clicks
- [x] Connect popup to background via `chrome.runtime.sendMessage`

---

## Content Script
- [x] Create `content.js`
- [x] Capture selected text or full page text
- [x] Send text to background script

---

## Background Script
- [x] Create `background.js`
- [x] Listen for messages from popup/content
- [x] Call the right Chrome AI API (Summarizer, Translator, Proofreader)
- [x] Send processed result back to popup

---

## API Integration
- [ ] Summarizer API → summarize page/article
- [ ] Translator API → translate into chosen language
- [ ] Proofreader/Rewriter API → polish user’s notes

---

## Display Results
- [x] Show results nicely inside `popup.html`
- [x] Add option to copy result to clipboard
- [x] (Optional) Save results in `chrome.storage`

---

## Polish
- [x] Add extension icon
- [x] Test on multiple sites (articles, blogs, research papers)
- [ ] Write clear instructions in `README.md`

---

## Submission Checklist
- [ ] GitHub repo with MIT license + README
- [ ] Demo video (under 3 min, show usage)
- [ ] Public working version of extension (zip or published)
- [ ] Add tagline: “Summarize. Translate. Perfect — Smarter Research, Faster.”
