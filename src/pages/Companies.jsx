import { useMemo, useState } from 'react';
import { companies, DOMAIN_GROUPS, LEVELS, LEVEL_ORDER } from '../data';
import { Avatar, EmptyState, Icon, LevelChip, PageHead } from '../lib/ui';
import { href } from '../lib/router';

export default function Companies() {
  const [text, setText] = useState('');
  const [group, setGroup] = useState('');
  const [level, setLevel] = useState('');
  const [sort, setSort] = useState('count');

  const list = useMemo(() => {
    const t = text.toLowerCase().trim();
    const l = companies.filter((c) =>
      (!t || c.name.toLowerCase().includes(t) || c.sessions.some((s) => `${s.domain} ${s.role}`.toLowerCase().includes(t))) &&
      (!group || c.groups.includes(group)) && (!level || c.levels.includes(level)));
    return [...l].sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b.count - a.count));
  }, [text, group, level, sort]);

  return (
    <div className="page">
      <PageHead eyebrow="Company-wise" title="Companies" sub="Pick a company to read every question asked, round by round." />
      <div className="toolbar">
        <label className="field field-grow"><Icon name="search" size={16} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search a company or domain (e.g. Eurofins, insurance)…" aria-label="Search companies" />
        </label>
        <label className="select"><select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Round">
          <option value="">All rounds</option>{LEVEL_ORDER.filter((l) => l !== 'Not specified').map((l) => <option key={l} value={l}>{LEVELS[l].label}</option>)}
        </select></label>
        <label className="select"><select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="count">Most questions</option><option value="name">A → Z</option>
        </select></label>
      </div>
      <div className="chips-wrap tight" role="group" aria-label="Domain">
        <button className={`pill-toggle ${!group ? 'on' : ''}`} onClick={() => setGroup('')}>All domains</button>
        {DOMAIN_GROUPS.concat('General BA').map((g) => (
          <button key={g} className={`pill-toggle ${group === g ? 'on' : ''}`} onClick={() => setGroup(group === g ? '' : g)}>{g}</button>
        ))}
      </div>
      <div className="count">{list.length} companies</div>
      {list.length === 0 ? <EmptyState title="No company found" hint="Try a different keyword." /> : (
        <div className="grid">
          {list.map((c) => (
            <a key={c.id} className="company-card" href={href(`/company/${c.id}`)}>
              <div className="company-top"><Avatar name={c.name} size={48} />
                <div><h3>{c.name}</h3><small>{c.sessions.length} round{c.sessions.length > 1 ? 's' : ''}{c.sessions[0].location ? ` · ${c.sessions[0].location}` : ''}</small></div>
              </div>
              <div className="company-nums"><div><b>{c.count}</b><span>questions</span></div><div><b>{c.tricky}</b><span>tricky</span></div></div>
              <div className="chips-wrap tight">
                {c.levels.map((l) => <LevelChip key={l} level={l} />)}
                {c.results.map((r) => <span key={r} className={`chip ${r === 'Cleared' ? 'chip-ok' : 'chip-bad'}`}>{r}</span>)}
              </div>
              <div className="company-domains">{c.groups.join(' · ')}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
