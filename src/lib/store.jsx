import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};

/* ---------------- Theme ---------------- */
const ThemeCtx = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => { document.documentElement.dataset.theme = theme; ls.set('prep.theme', theme); }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);

/* ---------------- Progress (known / review / bookmarks / notes) ---------------- */
const ProgressCtx = createContext(null);
export function ProgressProvider({ children }) {
  const [marks, setMarks] = useState(() => ls.get('prep.marks', {}));
  const [stars, setStars] = useState(() => ls.get('prep.stars', {}));
  const [notes, setNotes] = useState(() => ls.get('prep.notes', {}));
  useEffect(() => ls.set('prep.marks', marks), [marks]);
  useEffect(() => ls.set('prep.stars', stars), [stars]);
  useEffect(() => ls.set('prep.notes', notes), [notes]);

  const setMark = useCallback((id, v) => setMarks((m) => { const n = { ...m }; if (n[id] === v) delete n[id]; else n[id] = v; return n; }), []);
  const toggleStar = useCallback((id) => setStars((s) => { const n = { ...s }; if (n[id]) delete n[id]; else n[id] = true; return n; }), []);
  const setNote = useCallback((id, t) => setNotes((s) => { const n = { ...s }; if (t) n[id] = t; else delete n[id]; return n; }), []);
  const reset = useCallback(() => { setMarks({}); setStars({}); setNotes({}); }, []);

  const value = useMemo(() => ({ marks, stars, notes, setMark, toggleStar, setNote, reset }), [marks, stars, notes, setMark, toggleStar, setNote, reset]);
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}
export const useProgress = () => useContext(ProgressCtx);

/* ---------------- Speech (read aloud) ---------------- */
const SpeechCtx = createContext(null);

function pickDefault(voices) {
  const en = voices.filter((v) => /^en/i.test(v.lang));
  return (
    en.find((v) => /en[-_]IN/i.test(v.lang)) ||
    en.find((v) => /natural|neural|google|samantha|aria|jenny/i.test(v.name)) ||
    en.find((v) => /en[-_]US/i.test(v.lang)) ||
    en[0] ||
    voices[0]
  );
}

export function SpeechProvider({ children }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  const [voices, setVoices] = useState([]);
  const [settings, setSettings] = useState(() => ({ voiceURI: '', rate: 1, autoRead: true, answerSecs: 30, ...ls.get('prep.voice', {}) }));
  const [speakingId, setSpeakingId] = useState(null);
  const token = useRef(0);

  useEffect(() => {
    if (!supported) return undefined;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);
  useEffect(() => ls.set('prep.voice', settings), [settings]);

  const stop = useCallback(() => {
    token.current += 1;
    if (supported) window.speechSynthesis.cancel();
    setSpeakingId(null);
  }, [supported]);

  const speak = useCallback((text, id, onEnd) => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();
    const mine = ++token.current;
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.voiceURI === settings.voiceURI) || pickDefault(voices);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = settings.rate;
    u.onend = () => { if (token.current === mine) { setSpeakingId(null); onEnd?.(); } };
    u.onerror = () => { if (token.current === mine) setSpeakingId(null); };
    setSpeakingId(id);
    window.speechSynthesis.speak(u);
  }, [supported, voices, settings.voiceURI, settings.rate]);

  const toggle = useCallback((text, id) => { if (speakingId === id) stop(); else speak(text, id); }, [speakingId, speak, stop]);
  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const value = useMemo(() => ({ supported, voices, settings, update, speak, stop, toggle, speakingId }), [supported, voices, settings, update, speak, stop, toggle, speakingId]);
  return <SpeechCtx.Provider value={value}>{children}</SpeechCtx.Provider>;
}
export const useSpeech = () => useContext(SpeechCtx);
