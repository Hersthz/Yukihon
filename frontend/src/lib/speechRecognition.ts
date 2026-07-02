// Thin wrapper over the browser Web Speech API (SpeechRecognition) for Japanese voice input.
// Chrome/Edge only; returns null where unsupported so callers can fall back gracefully.

interface SpeechResultAlt {
  transcript: string;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechResultAlt>>;
}
export interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

const getCtor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const isSpeechRecognitionSupported = () => getCtor() !== null;

/** Create a one-shot recognizer for the given language, or null if unsupported. */
export const createRecognition = (lang = "ja-JP"): RecognitionLike | null => {
  const Ctor = getCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  return recognition;
};

/** Extract the best transcript from a recognition result event. */
export const firstTranscript = (event: SpeechRecognitionEventLike): string =>
  event.results?.[0]?.[0]?.transcript ?? "";
