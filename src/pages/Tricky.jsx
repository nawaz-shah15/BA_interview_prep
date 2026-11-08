import { useState } from 'react';
import { questions, studyPath } from '../data';
import { Icon, PageHead, QuestionBrowser } from '../lib/ui';
import { go } from '../lib/router';

const ALL = questions.filter((q) => q.tricky);
export default function Tricky() {
  const [tab, setTab] = useState('All');
  const list = tab === 'All' ? ALL : ALL.filter((q) => q.type === tab);
  const tabs = [['All', ALL.length], ['Scenario', ALL.filter((q) => q.type === 'Scenario').length], ['Hands-on task', ALL.filter((q) => q.type === 'Hands-on task').length]];
  return (
    <div className="page">
      <PageHead eyebrow="Think before you answer" title="Tricky questions" sub="Scenario-based problems, 'what would you do if…' situations and live exercises (write a user story, draw a flow, write SQL). These are the ones that separate shortlisted candidates."
        actions={<button className="btn" onClick={() => go(studyPath('tricky', 'all'))}><Icon name="play" size={16} fill /> Drill all {ALL.length}</button>} />
      <div className="tabs" role="tablist">
        {tabs.map(([t, n]) => <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t === 'All' ? 'All tricky' : t === 'Scenario' ? 'Scenarios' : 'Hands-on tasks'} <em>{n}</em></button>)}
      </div>
      <QuestionBrowser key={tab} questions={list} deckPath={studyPath('tricky', 'all')} filters={['category', 'company', 'level']} />
    </div>
  );
}
