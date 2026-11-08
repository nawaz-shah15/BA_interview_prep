import { categories, CATEGORY_META, companies, questions, studyPath } from '../data';
import { EmptyState, Icon, PageHead, QuestionBrowser } from '../lib/ui';
import { go, href } from '../lib/router';

export function Categories() {
  return (
    <div className="page">
      <PageHead eyebrow="Category-wise" title="Categories" sub="Every question is tagged by topic, so you can drill into one skill at a time." />
      <div className="grid grid-cats">
        {categories.map((c) => (
          <a key={c.name} className="cat-card" style={{ '--h': c.hue }} href={href(`/category/${encodeURIComponent(c.name)}`)}>
            <span className="cat-emoji" aria-hidden="true">{c.emoji}</span>
            <h3>{c.name}</h3>
            <p>{c.blurb}</p>
            <div className="cat-foot"><span><b>{c.count}</b> questions</span><span><b>{c.tricky}</b> tricky</span><span><b>{c.companies}</b> companies</span></div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function CategoryDetail({ name }) {
  const meta = CATEGORY_META[name];
  const list = questions.filter((q) => q.category === name);
  if (!meta) return <div className="page"><EmptyState title="Category not found"><a className="btn" href={href('/categories')}>All categories</a></EmptyState></div>;
  return (
    <div className="page">
      <a className="back" href={href('/categories')}><Icon name="left" size={16} /> All categories</a>
      <PageHead title={<span><span className="title-emoji">{meta.emoji}</span> {name}</span>} sub={`${meta.blurb} ${list.length} questions from ${new Set(list.map((q) => q.companyId)).size} companies.`}
        actions={<button className="btn" onClick={() => go(studyPath('category', name))}><Icon name="play" size={16} fill /> Practise this topic</button>} />
      <QuestionBrowser questions={list} deckPath={studyPath('category', name)} filters={['company', 'level', 'type']} />
    </div>
  );
}
