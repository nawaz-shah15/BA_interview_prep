import { questions, studyPath, topics } from '../data';
import { EmptyState, Icon, PageHead, QuestionBrowser } from '../lib/ui';
import { go, href } from '../lib/router';

export function Topics() {
  const max = topics[0]?.count ?? 1;
  return (
    <div className="page">
      <PageHead eyebrow="Repeat offenders" title="Most-asked topics" sub="These themes show up again and again across companies. Master these first." />
      <ol className="topic-list">
        {topics.map((t, i) => (
          <li key={t.key}>
            <a href={href(`/topic/${t.key}`)} className="topic-row">
              <span className="topic-rank">{i + 1}</span>
              <span className="topic-main">
                <b>{t.label}</b>
                <span className="bar-track"><span className="bar-fill" style={{ width: `${(t.count / max) * 100}%` }} /></span>
                <small>Asked in {t.companies.length} companies{t.companies.length ? ` — ${t.companies.slice(0, 4).join(', ')}${t.companies.length > 4 ? '…' : ''}` : ''}</small>
              </span>
              <span className="badge">{t.count}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TopicDetail({ id }) {
  const t = topics.find((x) => x.key === id);
  if (!t) return <div className="page"><EmptyState title="Topic not found"><a className="btn" href={href('/most-asked')}>All topics</a></EmptyState></div>;
  const list = questions.filter((q) => q.topic === id);
  return (
    <div className="page">
      <a className="back" href={href('/most-asked')}><Icon name="left" size={16} /> Most asked</a>
      <PageHead eyebrow="Most asked" title={t.label} sub={`${t.count} questions · ${t.companies.length} companies`} actions={<button className="btn" onClick={() => go(studyPath('topic', id))}><Icon name="play" size={16} fill /> Practise</button>} />
      <QuestionBrowser questions={list} deckPath={studyPath('topic', id)} filters={['company', 'level', 'type']} />
    </div>
  );
}
