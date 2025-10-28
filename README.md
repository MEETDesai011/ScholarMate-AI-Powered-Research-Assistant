# ScholarMate - AI Research Assistant

![Extension Icon](icons/icon128.png)
**Tagline:** “Summarize. Translate. Perfect — Smarter Research, Faster.”

ScholarMate is a Chrome extension designed to accelerate research and writing by integrating powerful AI tools directly into the browser. It allows users to summarize, translate, and proofread any selected text with a single click.

---

## 🚀 Key Features

* **One-Click Actions:** Instantly **Summarize** articles, **Translate** text, or **Proofread** your writing.
* **Grab Selection:** Use the "Grab selection" button to instantly capture highlighted text from your active webpage.
* **Hybrid AI Processing:** Features an advanced settings panel to choose your preferred AI engine:
    * **Hybrid (Default):** Attempts to use the fast, on-device `chrome.ai.LanguageModel` (Gemini Nano) first. If it fails, it automatically falls back to the powerful Cloud AI (Gemini 2.5 Flash).
    * **Built-in AI Only:** Exclusively uses the on-device `chrome.ai.LanguageModel`.
    * **Cloud AI Only:** Exclusively uses the external Gemini 2.5 Flash API.
* **Light & Dark Mode:** Includes a theme toggle in the settings for a personalized experience. Your preference is saved locally.
* **Helpful Error Handling:** If the built-in AI fails, the extension provides clear, actionable steps for the user (e.g., how to enable Chrome flags).
* **Simple UI:** A clean interface with "Copy Output" and "Clear" buttons for an efficient workflow.

---

## 🛠️ How to Install (for Testing)

Since this extension is not yet on the Chrome Web Store, you can load it locally:

1.  **Download:** Download or clone this repository to your local machine.
2.  **Open Extensions Page:** Open Google Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** Turn on the "Developer mode" toggle in the top-right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button.
5.  **Select Folder:** Select the entire `ScholarMate – AI-Powered Research Assistant` folder (the one containing `manifest.json`).
6.  **Done!** The "ScholarMate" icon should now appear in your Chrome toolbar.

---

## 🔧 Built With

* **Core:** JavaScript (ES6+), HTML5, CSS3
* **Chrome APIs (Manifest V3)**:
    * `chrome.ai.LanguageModel` (for on-device Gemini Nano)
    * `chrome.storage` (for saving settings)
    * `chrome.scripting` (for grabbing selected text)
* **Cloud AI:** Google Gemini 2.5 Flash API

---

## 📄 License

This project is intended to be licensed under the MIT License. (As noted in `ToDo_List.md`, you should add a `LICENSE` file to the repository).
