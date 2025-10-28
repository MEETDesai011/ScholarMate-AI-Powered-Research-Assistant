// background.js - handles API calls using actual Chrome AI APIs or a fallback
// Implementation now respects user's AI Mode selection (Built-in, Cloud, Hybrid).
// THIS VERSION IS MODIFIED TO USE THE BASE LanguageModel API.

// --- 1. External AI Configuration for Gemini (Hardcoded Key) ---
const API_KEY = "AIzaSyBgBUveng4gSgFnbt1duLF_WAMSHJURKRI"; 
const EXTERNAL_API_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"; 
const MODEL_NAME = "gemini-2.5-flash"; 
// ---------------------------------------------

const DEFAULT_AI_MODE = 'hybrid';

function getAiMode() {
    return new Promise((resolve) => {
        // Retrieve the AI mode stored by the popup script, defaulting to 'hybrid'
        chrome.storage.local.get(['aiMode'], (result) => {
            resolve(result.aiMode || DEFAULT_AI_MODE);
        });
    });
}

// Helper to execute built-in chrome.ai functions
// THIS IS THE MODIFIED FUNCTION
async function executeBuiltIn(action, text, sendResponse) {
    // Check for the base API, not the specific tasks
    if (!chrome.ai || !chrome.ai.LanguageModel) {
        const help = {
            message: "Built-in chrome.ai (LanguageModel API) is unavailable.",
            steps: [
                "Verify you are using Chrome Canary.",
                "Go to chrome://flags and enable #prompt-api-for-gemini-nano.",
                "Go to chrome://components and wait for 'On-Device Model' to download."
            ],
            note: "The extension is configured to use built-in AI, which requires experimental browser features."
        };
        sendResponse({ success: false, error: help });
        return false;
    }
    
    try {
        let systemInstruction = "";
        switch (action) {
          case "summarize":
            systemInstruction = "You are an expert research assistant. Summarize the following text briefly and concisely. Focus on the main argument and key findings.";
            break;
          case "translate":
            systemInstruction = "You are an expert translator. Translate the following text into Spanish. Return only the translated text.";
            break;
          case "proofread":
            systemInstruction = "You are an expert editor and proofreader. Proofread and correct any grammatical or spelling errors in the following text, and improve clarity and academic tone. Return only the final, corrected text.";
            break;
          default:
            sendResponse({ success: false, error: "Unknown action" });
            return false;
        }

        // Use the API that we know is working
        const session = await chrome.ai.LanguageModel.create();
        const fullPrompt = systemInstruction + "\n\nTEXT TO PROCESS: " + text;
        const result = await session.prompt(fullPrompt);

        sendResponse({ success: true, result });
        return true;

    } catch (err) {
        console.error(`Error with chrome.ai (LanguageModel API) ${action}:`, err);
        const help = {
            message: `Built-in AI (LanguageModel) failed: ${err.message}`,
            steps: [
                "This error means the base API failed. Try restarting Chrome Canary.",
                "Ensure the model is downloaded in chrome://components."
            ],
            note: `The error was: ${err.message}`
        };
        sendResponse({ success: false, error: help });
        return false; // Indicate failure to allow hybrid mode to fall back
    }
}

// Helper to execute Cloud (Gemini) fallback
async function executeCloud(action, text, sendResponse) {
    try {
        const result = await callExternalAIFallback(action, text);
        sendResponse({ success: true, result: `⚠️ FALLBACK USED (Gemini):\n\n${result}` });
        return true;
    } catch (err) {
        console.error(`Error with External AI Fallback ${action}:`, err);
        const help = {
            message: `Cloud AI processing failed: ${err.message || "An unknown error occurred in the Gemini fallback."}`,
            steps: [
                "Verify your Gemini API Key is correct and active.",
                "Ensure you have added 'https://generativelanguage.googleapis.com/*' to 'host_permissions' in manifest.json.",
                "Check the browser's service worker console for detailed API errors."
            ],
            note: "The Gemini fallback requires a correctly configured key to function."
        };
        sendResponse({ success: false, error: help });
        return false;
    }
}

// Core Gemini API call function (This remains the same)
async function callExternalAIFallback(action, text) {
  let systemInstruction = "";
  
  switch (action) {
    case "summarize":
      systemInstruction = "You are an expert research assistant. Summarize the following text briefly and concisely. Focus on the main argument and key findings.";
      break;
    case "translate":
      systemInstruction = "You are an expert translator. Translate the following text into Spanish. Return only the translated text.";
      break;
    case "proofread":
      systemInstruction = "You are an expert editor and proofreader. Proofread and correct any grammatical or spelling errors in the following text, and improve clarity and academic tone. Return only the final, corrected text.";
      break;
    default:
      throw new Error("Unknown action for fallback API.");
  }
  
  const payload = {
    contents: [
      { role: "user", parts: [{ text: systemInstruction + "\n\nTEXT TO PROCESS: " + text }] } 
    ],
    generationConfig: { 
      temperature: 0.1, 
    }
  };

  const url = `${EXTERNAL_API_URL_BASE}?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(`Gemini API call failed with status ${response.status}: ${errorBody.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!result) {
      const blockReason = data.candidates?.[0]?.finishReason;
      if (blockReason) {
         throw new Error(`API response blocked. Reason: ${blockReason}`);
      }
      throw new Error("API returned an unexpected or empty response structure.");
  }
  return result.trim();
}

// Message Listener (This remains the same)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (!msg || !msg.action) {
      sendResponse({ success: false, error: "Invalid message" });
      return;
    }

    const action = msg.action;
    const text = msg.text || "";
    const aiMode = await getAiMode();

    if (aiMode === 'builtin') {
        // Mode 1: Built-in Only
        await executeBuiltIn(action, text, sendResponse);
        
    } else if (aiMode === 'cloud') {
        // Mode 2: Cloud Only (Gemini)
        await executeCloud(action, text, sendResponse);

    } else { // aiMode === 'hybrid' or default
        // Mode 3: Hybrid (Built-in -> Cloud Fallback)
        const builtInSuccess = await executeBuiltIn(action, text, (response) => {
            if (response.success) {
                sendResponse(response);
            } else {
                return false; 
            }
        });

        if (!builtInSuccess) {
            await executeCloud(action, text, sendResponse);
        }
    }
  })();
  return true; 
});