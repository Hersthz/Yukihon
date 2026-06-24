/**
 * Browser text-to-speech for Japanese via the Web Speech API.
 * Client-side and free — no backend/API key. Gracefully no-ops where unsupported.
 */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speak Japanese `text` aloud. Returns false if speech synthesis isn't available.
 * Prefers a Japanese voice when the browser exposes one; otherwise the ja-JP lang
 * hint lets the engine pick an appropriate voice.
 */
export function speakJapanese(text: string): boolean {
  if (!text || !isSpeechSupported()) {
    return false;
  }

  const synth = window.speechSynthesis;
  synth.cancel(); // stop anything already playing

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.9;

  const japaneseVoice = synth
    .getVoices()
    .find((voice) => voice.lang?.toLowerCase().startsWith("ja"));
  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }

  synth.speak(utterance);
  return true;
}
