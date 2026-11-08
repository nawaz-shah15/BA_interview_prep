import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveDeck } from '../data';
import { CatChip, EmptyState, Icon, LevelChip, SpeakButton } from '../lib/ui';
import { go, href } from '../lib/router';
import { useProgress, useSpeech } from '../lib/store';

function shuffleSeeded(arr, seed) {
  const a = [...arr]; let s = seed || 1;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function Study({ kind, keyId, startId }) {
  const progress = useProgress();
  const { marks, stars, notes, setMark, toggleStar, setNote } = progress;
  const sp = useSpeech();
  const base = useMemo(() => resolveDeck(kind, keyId, progress), [kind, keyId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [filter, setFilter] = useState('all');
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [panel, setPanel] = useState(false);
  const [mock, setMock] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const startedRef = useRef(false);

  const deck = useMemo(() => {
    let l = base.list;
    if (filter === 'tricky') l = l.filter((q) => q.tricky);
    if (filter === 'review') l = l.filter((q) => marks[q.id] === 'review');
    if (filter === 'todo') l = l.filter((q) => marks[q.id] !== 'known');
    return seed ? shuffleSeeded(l, seed) : l;
  }, [base, filter, seed]); // eslint-disable-line react-hooks/exhaustive-deps

  // jump to the question the user clicked in a list
  useEffect(() => {
    if (!startId) return;
    const i = base.list.findIndex((q) => q.id === startId);
    if (i >= 0) setIndex(i);
  }, [startId, base]);
  useEffect(() => { setShowAnswer(false); }, [index, deck]);
  useEffect(() => { if (index > deck.length - 1) setIndex(Math.max(0, deck.length - 1)); }, [deck, index]);

  const q = deck[index];
  const last = deck.length - 1;

  const goTo = useCallback((i, read = true) => {
    const n = Math.min(Math.max(i, 0), last);
    setIndex(n);
    startedRef.current = true;
    if (read && sp.settings.autoRead && !mock && deck[n]) sp.speak(deck[n].q, deck[n].id);
  }, [last, deck, sp, mock]);

  // stop reading when leaving the page
  useEffect(() => () => sp.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mock interview: read -> wait for the answer -> next
  useEffect(() => {
    if (!mock || !q) return undefined;
    let cancelled = false; let timer;
    setCountdown(null);
    sp.speak(q.q, q.id, () => {
      if (cancelled) return;
      let left = sp.settings.answerSecs; setCountdown(left);
      timer = setInterval(() => {
        left -= 1; setCountdown(left);
        if (left <= 0) {
          clearInterval(timer); setCountdown(null);
          if (index < last) setIndex((i) => i + 1); else setMock(false);
        }
      }, 1000);
    });
    return () => { cancelled = true; clearInterval(timer); setCountdown(null); sp.stop(); };
  }, [mock, index, q?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // keyboard shortcuts
  useEffect(() => {
    const on = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') goTo(index + 1);
      else if (e.key === 'ArrowLeft') goTo(index - 1);
      else if (e.key === ' ') { e.preventDefault(); if (q) sp.toggle(q.q, q.id); }
      else if (e.key.toLowerCase() === 'k' && q) setMark(q.id, 'known');
      else if (e.key.toLowerCase() === 'r' && q) setMark(q.id, 'review');
      else if (e.key.toLowerCase() === 's' && q) toggleStar(q.id);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [index, q, goTo, sp, setMark, toggleStar]);

  if (!base.list.length) return <div className="page"><EmptyState title="No questions in this deck yet" hint="Bookmark or mark some questions first."><a className="btn" href={href(base.back)}>Go back</a></EmptyState></div>;

  const pct = deck.length ? Math.round(((index + 1) / deck.length) * 100) : 0;
  const mark = q ? marks[q.id] : null;
  const filters = [['all', 'All'], ['todo', 'Not known yet'], ['review', 'Needs review'], ['tricky', 'Tricky only']];

  return (
    <div className="study">
      <div className="study-top">
        <a className="back" href={href(base.back)}><Icon name="left" size={16} /> {base.sub || 'Back'}</a>
        <h1 className="study-title">{base.title}</h1>
        <div className="study-tools">
          <label className="select"><select value={filter} onChange={(e) => { setFilter(e.target.value); setIndex(0); }} aria-label="Deck filter">{filters.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <button className={`icon-btn ${seed ? 'on' : ''}`} onClick={() => { setSeed(seed ? 0 : Date.now() % 100000 + 1); setIndex(0); }} aria-pressed={!!seed} aria-label="Shuffle" title="Shuffle"><Icon name="shuffle" /></button>
          <button className={`icon-btn ${panel ? 'on' : ''}`} onClick={() => setPanel((p) => !p)} aria-expanded={panel} aria-label="Voice settings" title="Voice settings"><Icon name="sliders" /></button>
        </div>
      </div>

      {panel && (
        <div className="panel">
          {!sp.supported ? <p className="muted">Your browser does not support read-aloud. Try Chrome, Edge or Safari.</p> : (
            <>
              <label className="panel-row"><span>Voice</span>
                <select value={sp.settings.voiceURI} onChange={(e) => sp.update({ voiceURI: e.target.value })}>
                  <option value="">Auto (best English voice)</option>
                  {sp.voices.filter((v) => /^en/i.test(v.lang)).map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                </select></label>
              <label className="panel-row"><span>Speed <b>{sp.settings.rate.toFixed(1)}×</b></span>
                <input type="range" min="0.6" max="1.6" step="0.1" value={sp.settings.rate} onChange={(e) => sp.update({ rate: Number(e.target.value) })} /></label>
              <label className="panel-row"><span>Time to answer (mock mode)</span>
                <select value={sp.settings.answerSecs} onChange={(e) => sp.update({ answerSecs: Number(e.target.value) })}>{[10, 20, 30, 45, 60, 90, 120].map((n) => <option key={n} value={n}>{n} seconds</option>)}</select></label>
              <label className="panel-row check"><input type="checkbox" checked={sp.settings.autoRead} onChange={(e) => sp.update({ autoRead: e.target.checked })} /> <span>Read each question automatically when I move to it</span></label>
              <button className="btn btn-sm" onClick={() => sp.speak('Tell me about a requirement conflict you resolved as a business analyst.', 'test')}><Icon name="volume" size={14} /> Test voice</button>
            </>
          )}
        </div>
      )}

      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={index + 1}><span style={{ width: `${pct}%` }} /></div>
      <div className="study-count">Question <b>{deck.length ? index + 1 : 0}</b> of {deck.length}</div>

      {!q ? <EmptyState title="Nothing in this filter" hint="Switch the filter above to see more questions." /> : (
        <article className={`flash ${mark ? `is-${mark}` : ''}`} key={q.id}>
          <div className="flash-meta">
            <a className="chip chip-plain chip-link" href={href(`/company/${q.companyId}`)}>{q.company}</a>
            <LevelChip level={q.level} />
            <CatChip name={q.category} />
            {q.tricky && <span className="chip chip-tricky"><Icon name="zap" size={12} fill /> {q.type === 'Hands-on task' ? 'Hands-on task' : 'Tricky'}</span>}
          </div>
          <p className="flash-round">{q.round} · {q.role}</p>
          <h2 className="flash-q">{q.q}</h2>

          {mock && (
            <div className="mock-bar" aria-live="polite">
              {sp.speakingId === q.id ? <><span className="eq" aria-hidden="true"><i /><i /><i /><i /></span> Asking the question…</> : countdown != null ? <><Icon name="clock" size={16} /> Your turn — answer out loud · <b>{countdown}s</b></> : 'Getting ready…'}
            </div>
          )}

          <div className="flash-actions">
            {sp.supported && (
              <button className={`btn ${sp.speakingId === q.id ? 'btn-danger' : ''}`} onClick={() => sp.toggle(q.q, q.id)}>
                <Icon name={sp.speakingId === q.id ? 'stop' : 'volume'} size={16} /> {sp.speakingId === q.id ? 'Stop' : 'Read aloud'}
              </button>
            )}
            {q.answer && <button className="btn btn-ghost" onClick={() => setShowAnswer((s) => !s)}>{showAnswer ? 'Hide' : 'Show'} candidate's answer</button>}
            {q.answer && sp.supported && showAnswer && <SpeakButton text={q.answer} id={`${q.id}-a`} label="Read the answer" />}
          </div>
          {showAnswer && q.answer && <div className="qanswer"><strong>Candidate's answer</strong><p>{q.answer}</p></div>}

          <details className="notes">
            <summary>My notes{notes[q.id] ? ' ✎' : ''}</summary>
            <textarea value={notes[q.id] || ''} onChange={(e) => setNote(q.id, e.target.value)} placeholder="Write your own answer or key points here (saved on this device)…" rows={4} />
          </details>

          <div className="flash-mark">
            <button className={`btn btn-ghost ${mark === 'review' ? 'sel-review' : ''}`} onClick={() => setMark(q.id, 'review')} aria-pressed={mark === 'review'}><Icon name="repeat" size={15} /> Review later</button>
            <button className={`btn btn-ghost ${mark === 'known' ? 'sel-known' : ''}`} onClick={() => { setMark(q.id, 'known'); }} aria-pressed={mark === 'known'}><Icon name="check" size={15} /> I know this</button>
            <button className={`btn btn-ghost ${stars[q.id] ? 'sel-star' : ''}`} onClick={() => toggleStar(q.id)} aria-pressed={!!stars[q.id]}><Icon name="star" size={15} fill={!!stars[q.id]} /> {stars[q.id] ? 'Bookmarked' : 'Bookmark'}</button>
          </div>
        </article>
      )}

      <div className="study-nav">
        <button className="btn btn-ghost" onClick={() => goTo(index - 1)} disabled={index === 0}><Icon name="left" size={18} /> Previous</button>
        <button className={`btn ${mock ? 'btn-danger' : 'btn-accent'}`} onClick={() => { if (mock) { setMock(false); } else { setMock(true); } }} disabled={!sp.supported} title={sp.supported ? '' : 'Read-aloud is not supported in this browser'}>
          <Icon name={mock ? 'stop' : 'headphones'} size={16} /> {mock ? 'Stop mock' : 'Mock interview'}
        </button>
        <button className="btn" onClick={() => goTo(index + 1)} disabled={index >= last}>Next <Icon name="right" size={18} /></button>
      </div>
      <p className="hint">Shortcuts: <kbd>←</kbd> <kbd>→</kbd> navigate · <kbd>Space</kbd> read aloud · <kbd>K</kbd> known · <kbd>R</kbd> review · <kbd>S</kbd> bookmark</p>
      {index >= last && deck.length > 0 && <div className="done">🎉 End of deck. <button className="link-btn" onClick={() => goTo(0, false)}>Start over</button> or <button className="link-btn" onClick={() => go(base.back)}>go back</button>.</div>}
    </div>
  );
}
