import { useMemo, useState } from 'react';
import { companyById, studyPath } from '../data';
import { Avatar, CatChip, EmptyState, Icon, LevelChip, PageHead, QuestionItem } from '../lib/ui';
import { go, href } from '../lib/router';

export default function CompanyDetail({ id }) {
  const c = companyById[id];
  const [trickyOnly, setTrickyOnly] = useState(false);
  const [open, setOpen] = useState(() => new Set(c ? [c.sessions[0].id] : []));
  const cats = useMemo(() => {
    if (!c) return [];
    const m = {};
    c.sessions.forEach((s) => s.questions.forEach((q) => { m[q.category] = (m[q.category] || 0) + 1; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [c]);
  if (!c) return <div className="page"><EmptyState title="Company not found"><a className="btn" href={href('/companies')}>All companies</a></EmptyState></div>;

  const toggle = (sid) => setOpen((o) => { const n = new Set(o); if (n.has(sid)) n.delete(sid); else n.add(sid); return n; });
  const allOpen = open.size === c.sessions.length;

  return (
    <div className="page">
      <a className="back" href={href('/companies')}><Icon name="left" size={16} /> All companies</a>
      <PageHead
        title={<span className="title-with-avatar"><Avatar name={c.name} size={54} /> {c.name}</span>}
        sub={`${c.count} questions across ${c.sessions.length} round${c.sessions.length > 1 ? 's' : ''} · ${c.groups.join(' · ')}`}
        actions={<>
          <button className="btn" onClick={() => go(studyPath('company', c.id))}><Icon name="play" size={16} fill /> Practise all</button>
        </>}
      >
        <div className="chips-wrap tight mt">{cats.slice(0, 6).map(([n, k]) => <span key={n} className="chip chip-plain"><CatChip name={n} to={false} /> <em>{k}</em></span>)}</div>
      </PageHead>

      <div className="toolbar">
        <button className={`pill-toggle ${trickyOnly ? 'on' : ''}`} onClick={() => setTrickyOnly((t) => !t)} aria-pressed={trickyOnly}><Icon name="zap" size={14} fill={trickyOnly} /> Tricky only</button>
        <button className="link-btn" onClick={() => setOpen(allOpen ? new Set() : new Set(c.sessions.map((s) => s.id)))}>{allOpen ? 'Collapse all' : 'Expand all'}</button>
      </div>

      {c.sessions.map((s) => {
        const list = s.questions.map((q) => ({ ...q, company: c.name, companyId: c.id, sessionId: s.id, level: s.level, round: s.round }))
          .filter((q) => !trickyOnly || q.tricky);
        const isOpen = open.has(s.id);
        return (
          <section className="session" key={s.id}>
            <div className="session-head" onClick={() => toggle(s.id)} role="button" tabIndex={0} aria-expanded={isOpen} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(s.id))}>
              <div className="session-title">
                <LevelChip level={s.level} />
                <h2>{s.round}</h2>
                <div className="session-sub">{s.role} · {s.domain}{s.client ? ` · Client: ${s.client}` : ''}</div>
              </div>
              <div className="session-right">
                {s.result && <span className={`chip ${s.result === 'Cleared' ? 'chip-ok' : 'chip-bad'}`}>{s.result}</span>}
                <span className="badge">{s.questions.length}</span>
                <button className="btn btn-sm" onClick={(e) => { e.stopPropagation(); go(studyPath('session', s.id)); }}><Icon name="play" size={14} fill /> Practise</button>
                <span className={`chev ${isOpen ? 'open' : ''}`}><Icon name="right" size={18} /></span>
              </div>
            </div>
            {s.note && isOpen && <div className="note">ℹ️ {s.note}</div>}
            {isOpen && (list.length ? (
              <ol className="qlist">{list.map((q, i) => <QuestionItem key={q.id} q={q} index={i} deckPath={studyPath('session', s.id)} showCompany={false} />)}</ol>
            ) : <p className="muted pad">No tricky questions in this round.</p>)}
          </section>
        );
      })}
    </div>
  );
}
