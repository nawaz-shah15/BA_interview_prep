import { useMemo } from 'react';
import { categories, companies, questions, studyPath } from '../data';
import { Avatar, EmptyState, Icon, PageHead, QuestionItem } from '../lib/ui';
import { href } from '../lib/router';

export default function SearchPage({ q = '' }) {
  const terms = useMemo(() => q.toLowerCase().split(/\s+/).filter(Boolean), [q]);
  const res = useMemo(() => {
    if (!terms.length) return { qs: [], cs: [], cats: [] };
    return {
      qs: questions.filter((x) => terms.every((t) => x.hay.includes(t))),
      cs: companies.filter((c) => terms.every((t) => c.name.toLowerCase().includes(t))),
      cats: categories.filter((c) => terms.every((t) => c.name.toLowerCase().includes(t))),
    };
  }, [terms]);
  const shown = res.qs.slice(0, 100);
  return (
    <div className="page">
      <PageHead eyebrow="Search" title={q ? <>Results for “{q}”</> : 'Search everything'} sub={q ? `${res.qs.length} questions · ${res.cs.length} companies · ${res.cats.length} categories` : 'Type in the search box above — by company, topic, keyword or domain.'} />
      {res.cs.length > 0 && <div className="chips-wrap mb">{res.cs.map((c) => <a key={c.id} href={href(`/company/${c.id}`)} className="chip chip-big chip-plain chip-link"><Avatar name={c.name} size={22} /> {c.name} <em>{c.count}</em></a>)}</div>}
      {res.cats.length > 0 && <div className="chips-wrap mb">{res.cats.map((c) => <a key={c.name} href={href(`/category/${encodeURIComponent(c.name)}`)} className="chip chip-big chip-hue chip-link" style={{ '--h': c.hue }}>{c.emoji} {c.name} <em>{c.count}</em></a>)}</div>}
      {q && res.qs.length === 0 && res.cs.length === 0 && <EmptyState title="Nothing found" hint="Try fewer words, e.g. “sql”, “uat”, “eurofins”, “subrogation”." />}
      {shown.length > 0 && <ol className="qlist">{shown.map((x, i) => <QuestionItem key={x.id} q={x} index={i} terms={terms} deckPath={studyPath('company', x.companyId)} />)}</ol>}
      {res.qs.length > shown.length && <p className="muted center">Showing the first {shown.length} of {res.qs.length}. Refine your search to narrow it down.</p>}
    </div>
  );
}
