import { useMemo } from 'react';
import { answerCount, categories, companies, meta, questions, studyPath, topics, trickyCount } from '../data';
import { Avatar, Icon } from '../lib/ui';
import { go, href } from '../lib/router';
import { useProgress } from '../lib/store';

function Ring({ pct, size = 92 }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 92 92" role="img" aria-label={`${pct}% known`}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="9" />
      <circle cx="46" cy="46" r={r} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform="rotate(-90 46 46)" style={{ transition: 'stroke-dashoffset .6s' }} />
      <text x="46" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fff">{pct}%</text>
    </svg>
  );
}

export default function Home() {
  const { marks, stars } = useProgress();
  const known = Object.values(marks).filter((v) => v === 'known').length;
  const review = Object.values(marks).filter((v) => v === 'review').length;
  const pct = Math.round((known / questions.length) * 100);
  const top = companies.slice(0, 8);
  const maxT = topics[0]?.count ?? 1;
  const randomTricky = useMemo(() => questions.filter((q) => q.tricky), []);

  const tiles = [
    { to: '/companies', icon: 'briefcase', title: 'Company-wise', text: `${meta.totalCompanies} companies · ${meta.totalSessions} rounds`, hue: 250 },
    { to: '/categories', icon: 'grid', title: 'Category-wise', text: `${categories.length} topics from SQL to Agile`, hue: 190 },
    { to: '/tricky', icon: 'zap', title: 'Tricky questions', text: `${trickyCount} scenarios & hands-on tasks`, hue: 330 },
    { to: '/most-asked', icon: 'trend', title: 'Most asked', text: 'Questions that keep repeating', hue: 28 },
  ];

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <div className="eyebrow light">Real interview questions · shared by BAs</div>
          <h1>Crack your next <span className="grad-text">Business Analyst</span> interview.</h1>
          <p>{meta.totalQuestions} real questions from {meta.totalCompanies} companies, organised by company, round and topic. Practise one by one and let the app read each question out loud.</p>
          <div className="hero-cta">
            <button className="btn btn-light" onClick={() => go(studyPath('all', 'all'))}><Icon name="play" size={16} fill /> Start practising</button>
            <button className="btn btn-glass" onClick={() => go(studyPath('tricky', 'all'))}><Icon name="zap" size={16} /> Tricky drill</button>
            <button className="btn btn-glass" onClick={() => go('/companies')}>Browse companies</button>
          </div>
        </div>
        <div className="hero-card">
          <Ring pct={pct} />
          <div className="hero-stats">
            <div><b>{known}</b><span>known</span></div>
            <div><b>{review}</b><span>to review</span></div>
            <div><b>{Object.keys(stars).length}</b><span>saved</span></div>
          </div>
        </div>
      </section>

      <section className="stat-row">
        {[[meta.totalQuestions, 'Questions'], [meta.totalCompanies, 'Companies'], [meta.totalSessions, 'Interview rounds'], [trickyCount, 'Tricky / scenario'], [answerCount, 'With sample answers']].map(([n, l]) => (
          <div className="stat" key={l}><b>{n}</b><span>{l}</span></div>
        ))}
      </section>

      <section className="tiles">
        {tiles.map((t) => (
          <a key={t.to} href={href(t.to)} className="tile" style={{ '--h': t.hue }}>
            <span className="tile-ico"><Icon name={t.icon} size={22} /></span>
            <h3>{t.title}</h3><p>{t.text}</p>
            <span className="tile-go"><Icon name="arrow" size={18} /></span>
          </a>
        ))}
      </section>

      <div className="two-col">
        <section className="card">
          <div className="card-head"><h2>Popular companies</h2><a href={href('/companies')} className="link">View all</a></div>
          <ul className="mini-list">
            {top.map((c) => (
              <li key={c.id}>
                <a href={href(`/company/${c.id}`)}>
                  <Avatar name={c.name} size={38} />
                  <span className="mini-main"><b>{c.name}</b><small>{c.sessions.length} round{c.sessions.length > 1 ? 's' : ''} · {c.groups.slice(0, 2).join(', ')}</small></span>
                  <span className="badge">{c.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section className="card">
          <div className="card-head"><h2>Most-asked topics</h2><a href={href('/most-asked')} className="link">See all</a></div>
          <ul className="bars">
            {topics.slice(0, 8).map((t) => (
              <li key={t.key}>
                <a href={href(`/topic/${t.key}`)}>
                  <span className="bar-label">{t.label}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: `${(t.count / maxT) * 100}%` }} /></span>
                  <span className="bar-n">{t.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <div className="card-head"><h2>Browse by category</h2><a href={href('/categories')} className="link">All categories</a></div>
        <div className="chips-wrap">
          {categories.slice(0, 12).map((c) => (
            <a key={c.name} className="chip chip-hue chip-big chip-link" style={{ '--h': c.hue }} href={href(`/category/${encodeURIComponent(c.name)}`)}>
              <span aria-hidden="true">{c.emoji}</span> {c.name} <em>{c.count}</em>
            </a>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div><h2><Icon name="headphones" size={22} /> Hands-free mock interview</h2><p>Turn on <b>Mock interview</b> in practice mode: the app reads a question, gives you time to answer out loud, then moves on to the next one.</p></div>
        <button className="btn btn-light" onClick={() => go(studyPath('tricky', 'all'))}>Try with tricky questions ({randomTricky.length})</button>
      </section>
    </div>
  );
}
