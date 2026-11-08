import { useMemo, useState } from 'react';
import { LEVELS } from '../data';
import { CATEGORY_META } from '../data';
import { go, href } from './router';
import { useProgress, useSpeech } from './store';

/* ---------- Icons (feather-style, inline) ---------- */
const P = {
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  volume: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></>,
  stop: <rect x="5" y="5" width="14" height="14" rx="2" />,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  trend: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  left: <polyline points="15 18 9 12 15 6" />,
  right: <polyline points="9 18 15 12 9 6" />,
  check: <polyline points="20 6 9 17 4 12" />,
  repeat: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
  shuffle: <><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" /></>,
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  headphones: <><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></>,
  arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
  sliders: <><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
};
export function Icon({ name, size = 18, fill = false, className = '' }) {
  return (
    <svg className={`ico ${className}`} width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

/* ---------- small building blocks ---------- */
function hash(s) { let h = 0; for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
export function Avatar({ name, size = 44 }) {
  const h = hash(name) % 360;
  const initials = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, hsl(${h} 80% 56%), hsl(${(h + 48) % 360} 85% 62%))` }} aria-hidden="true">
      {initials}
    </span>
  );
}
export function LevelChip({ level }) {
  const l = LEVELS[level] ?? LEVELS['Not specified'];
  return <span className="chip chip-hue" style={{ '--h': l.hue }}>{l.label}</span>;
}
export function CatChip({ name, to = true }) {
  const m = CATEGORY_META[name] ?? { hue: 230, emoji: '•' };
  const body = <><span aria-hidden="true">{m.emoji}</span> {name}</>;
  return to ? <a className="chip chip-hue chip-link" style={{ '--h': m.hue }} href={href(`/category/${encodeURIComponent(name)}`)}>{body}</a> : <span className="chip chip-hue" style={{ '--h': m.hue }}>{body}</span>;
}
export function Highlight({ text, terms }) {
  if (!terms?.length) return text;
  const rx = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  return text.split(rx).map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));
}
export function EmptyState({ title, hint, children }) {
  return <div className="empty"><div className="empty-ico">🗂️</div><h3>{title}</h3>{hint && <p>{hint}</p>}{children}</div>;
}
export function PageHead({ eyebrow, title, sub, actions, children }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
        {children}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

/* ---------- speak button ---------- */
export function SpeakButton({ text, id, size = 17, label = 'Read aloud', className = '' }) {
  const { supported, toggle, speakingId } = useSpeech();
  if (!supported) return null;
  const on = speakingId === id;
  return (
    <button type="button" className={`icon-btn ${on ? 'on pulse' : ''} ${className}`} onClick={(e) => { e.stopPropagation(); toggle(text, id); }} aria-label={on ? 'Stop reading' : label} title={on ? 'Stop' : label} aria-pressed={on}>
      <Icon name={on ? 'stop' : 'volume'} size={size} />
    </button>
  );
}

/* ---------- a single question row ---------- */
export function QuestionItem({ q, index, deckPath, showCompany = true, terms, showCat = true }) {
  const { marks, stars, toggleStar, setMark } = useProgress();
  const [open, setOpen] = useState(false);
  const mark = marks[q.id];
  return (
    <li className={`qrow ${mark ? `is-${mark}` : ''}`}>
      <div className="qrow-main">
        <span className="qnum">{index + 1}</span>
        <div className="qbody">
          <button type="button" className="qtext" onClick={() => (deckPath ? go(`${deckPath}?q=${q.id}`) : setOpen((o) => !o))}>
            <Highlight text={q.q} terms={terms} />
          </button>
          <div className="qmeta">
            {showCompany && <a className="chip chip-plain chip-link" href={href(`/company/${q.companyId}`)}>{q.company}</a>}
            {showCompany && <LevelChip level={q.level} />}
            {showCat && <CatChip name={q.category} />}
            {q.tricky && <span className="chip chip-tricky"><Icon name="zap" size={12} fill /> {q.type === 'Hands-on task' ? 'Hands-on' : 'Tricky'}</span>}
            {q.answer && <button type="button" className="chip chip-ans" onClick={() => setOpen((o) => !o)}>{open ? 'Hide' : 'Show'} candidate's answer</button>}
          </div>
          {open && q.answer && <div className="qanswer"><strong>Candidate's answer</strong><p>{q.answer}</p></div>}
        </div>
        <div className="qactions">
          <SpeakButton text={q.q} id={q.id} />
          {deckPath && <button type="button" className="icon-btn" onClick={() => go(`${deckPath}?q=${q.id}`)} aria-label="Practice from this question" title="Practice from here"><Icon name="play" size={16} /></button>}
          <button type="button" className={`icon-btn ${stars[q.id] ? 'on gold' : ''}`} onClick={() => toggleStar(q.id)} aria-label="Bookmark" aria-pressed={!!stars[q.id]} title="Bookmark"><Icon name="star" size={17} fill={!!stars[q.id]} /></button>
          <button type="button" className={`icon-btn ${mark === 'known' ? 'on green' : ''}`} onClick={() => setMark(q.id, 'known')} aria-label="Mark as known" aria-pressed={mark === 'known'} title="I know this"><Icon name="check" size={17} /></button>
        </div>
      </div>
    </li>
  );
}

/* ---------- list with filters (used by many pages) ---------- */
export function QuestionBrowser({ questions, deckPath, showCompany = true, filters = ['category', 'company', 'level', 'type'], initialTricky = false, terms: extTerms, hideSearch = false, pageSize = 50 }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [company, setCompany] = useState('');
  const [level, setLevel] = useState('');
  const [type, setType] = useState('');
  const [tricky, setTricky] = useState(initialTricky);
  const [limit, setLimit] = useState(pageSize);

  const opts = useMemo(() => ({
    category: [...new Set(questions.map((q) => q.category))].sort(),
    company: [...new Set(questions.map((q) => q.company))].sort(),
    level: Object.keys(LEVELS).filter((l) => questions.some((q) => q.level === l)),
    type: [...new Set(questions.map((q) => q.type))].sort(),
  }), [questions]);

  const terms = useMemo(() => text.toLowerCase().split(/\s+/).filter(Boolean), [text]);
  const list = useMemo(() => questions.filter((q) =>
    (!category || q.category === category) && (!company || q.company === company) && (!level || q.level === level) && (!type || q.type === type) &&
    (!tricky || q.tricky) && terms.every((t) => q.hay.includes(t))), [questions, category, company, level, type, tricky, terms]);

  const reset = () => { setText(''); setCategory(''); setCompany(''); setLevel(''); setType(''); setTricky(false); setLimit(pageSize); };
  const dirty = text || category || company || level || type || tricky;
  const shown = list.slice(0, limit);
  const sel = (label, val, set, items, fmt = (x) => x) => (
    <label className="select"><span className="sr">{label}</span>
      <select value={val} onChange={(e) => { set(e.target.value); setLimit(pageSize); }} aria-label={label}>
        <option value="">{label}</option>
        {items.map((i) => <option key={i} value={i}>{fmt(i)}</option>)}
      </select>
    </label>
  );
  return (
    <section>
      <div className="toolbar">
        {!hideSearch && (
          <label className="field field-grow"><Icon name="search" size={16} />
            <input value={text} onChange={(e) => { setText(e.target.value); setLimit(pageSize); }} placeholder="Filter these questions…" aria-label="Filter these questions" />
          </label>
        )}
        {filters.includes('category') && opts.category.length > 1 && sel('All categories', category, setCategory, opts.category)}
        {filters.includes('company') && opts.company.length > 1 && sel('All companies', company, setCompany, opts.company)}
        {filters.includes('level') && opts.level.length > 1 && sel('All rounds', level, setLevel, opts.level, (l) => LEVELS[l].label)}
        {filters.includes('type') && opts.type.length > 1 && sel('All types', type, setType, opts.type)}
        <button type="button" className={`pill-toggle ${tricky ? 'on' : ''}`} onClick={() => { setTricky((t) => !t); setLimit(pageSize); }} aria-pressed={tricky}><Icon name="zap" size={14} fill={tricky} /> Tricky only</button>
        {dirty && <button type="button" className="link-btn" onClick={reset}>Clear</button>}
      </div>
      <div className="count">{list.length} question{list.length === 1 ? '' : 's'}</div>
      {list.length === 0 ? <EmptyState title="No questions match" hint="Try removing a filter or searching for something broader."><button className="btn" onClick={reset}>Clear filters</button></EmptyState> : (
        <ol className="qlist">
          {shown.map((q, i) => <QuestionItem key={q.id} q={q} index={i} deckPath={deckPath} showCompany={showCompany} terms={extTerms ?? terms} />)}
        </ol>
      )}
      {list.length > limit && <div className="more"><button className="btn btn-ghost" onClick={() => setLimit((l) => l + pageSize)}>Show {Math.min(pageSize, list.length - limit)} more</button></div>}
    </section>
  );
}
