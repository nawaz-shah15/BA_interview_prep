import { useState } from 'react';
import { questions, studyPath } from '../data';
import { EmptyState, Icon, PageHead, QuestionBrowser } from '../lib/ui';
import { go } from '../lib/router';
import { useProgress } from '../lib/store';

export default function Saved() {
  const { stars, marks, reset } = useProgress();
  const [tab, setTab] = useState('starred');
  const sets = {
    starred: questions.filter((q) => stars[q.id]),
    review: questions.filter((q) => marks[q.id] === 'review'),
    known: questions.filter((q) => marks[q.id] === 'known'),
  };
  const labels = { starred: 'Bookmarked', review: 'Needs review', known: 'Known' };
  const list = sets[tab];
  return (
    <div className="page">
      <PageHead eyebrow="My list" title="Saved & progress" sub="Your bookmarks and progress are stored in this browser only."
        actions={list.length > 0 && <button className="btn" onClick={() => go(studyPath('saved', tab))}><Icon name="play" size={16} fill /> Practise these</button>} />
      <div className="tabs" role="tablist">
        {Object.keys(sets).map((k) => <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{labels[k]} <em>{sets[k].length}</em></button>)}
      </div>
      {list.length === 0 ? (
        <EmptyState title={`Nothing in “${labels[tab]}” yet`} hint="Use the ★ bookmark, ✓ known and ↻ review buttons on any question — or while practising." />
      ) : <QuestionBrowser key={tab} questions={list} deckPath={studyPath('saved', tab)} />}
      {(Object.keys(stars).length > 0 || Object.keys(marks).length > 0) && (
        <div className="more"><button className="link-btn danger" onClick={() => { if (window.confirm('Clear all bookmarks, progress and notes on this device?')) reset(); }}>Reset all progress</button></div>
      )}
    </div>
  );
}
