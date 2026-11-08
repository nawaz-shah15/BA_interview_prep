import { useEffect, useRef, useState } from 'react';
import { ThemeProvider, ProgressProvider, SpeechProvider, useTheme, useSpeech, useProgress } from './lib/store';
import { go, href, replace, useRoute } from './lib/router';
import { Icon } from './lib/ui';
import { meta } from './data';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import { Categories, CategoryDetail } from './pages/Categories';
import Tricky from './pages/Tricky';
import { Topics, TopicDetail } from './pages/Topics';
import Saved from './pages/Saved';
import SearchPage from './pages/SearchPage';
import Study from './pages/Study';

const NAV = [
  ['/', 'Home', 'home'],
  ['/companies', 'Companies', 'briefcase'],
  ['/categories', 'Categories', 'grid'],
  ['/tricky', 'Tricky', 'zap'],
  ['/most-asked', 'Most asked', 'trend'],
  ['/saved', 'Saved', 'bookmark'],
];

function Shell() {
  const route = useRoute();
  const { theme, toggle } = useTheme();
  const sp = useSpeech();
  const { stars, marks } = useProgress();
  const [q, setQ] = useState('');
  const lastPath = useRef('/');
  const input = useRef(null);
  const [seg0, seg1] = route.segs;
  const isStudy = seg0 === 'study';
  const isSearch = seg0 === 'search';

  // scroll to top + stop speech on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isSearch) lastPath.current = route.path;
    if (!isStudy) sp.stop();
    if (!isSearch) setQ('');
    else setQ(route.params.get('q') || '');
  }, [route.path]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const on = (e) => { if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); input.current?.focus(); } };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const onSearch = (v) => {
    setQ(v);
    if (v.trim()) replace(`/search?q=${encodeURIComponent(v)}`);
    else if (isSearch) replace(lastPath.current);
  };

  const active = (p) => (p === '/' ? route.path === '/' : route.path === p || (p === '/companies' && seg0 === 'company') || (p === '/categories' && seg0 === 'category') || (p === '/most-asked' && seg0 === 'topic'));
  const saved = Object.keys(stars).length + Object.values(marks).filter((v) => v === 'review').length;

  let page;
  switch (seg0) {
    case undefined: page = <Home />; break;
    case 'companies': page = <Companies />; break;
    case 'company': page = <CompanyDetail key={seg1} id={seg1} />; break;
    case 'categories': page = <Categories />; break;
    case 'category': page = <CategoryDetail key={seg1} name={seg1} />; break;
    case 'tricky': page = <Tricky />; break;
    case 'most-asked': page = <Topics />; break;
    case 'topic': page = <TopicDetail key={seg1} id={seg1} />; break;
    case 'saved': page = <Saved />; break;
    case 'search': page = <SearchPage q={route.params.get('q') || ''} />; break;
    case 'study': page = <Study key={`${seg1}/${route.segs[2]}`} kind={seg1} keyId={route.segs[2]} startId={route.params.get('q')} />; break;
    default: page = <Home />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href={href('/')}><span className="brand-mark">BA</span><span><b>Interview Prep</b><small>Business Analyst edition</small></span></a>
        <nav aria-label="Main">
          {NAV.map(([p, label, icon]) => (
            <a key={p} href={href(p)} className={`nav-link ${active(p) ? 'active' : ''}`} aria-current={active(p) ? 'page' : undefined}>
              <Icon name={icon} size={19} /> <span>{label}</span>{p === '/saved' && saved > 0 && <em className="nav-badge">{saved}</em>}
            </a>
          ))}
        </nav>
        <button className="side-cta" onClick={() => go('/study/all/all')}><Icon name="play" size={15} fill /> Quick practice</button>
        <div className="side-foot">{meta.totalQuestions} questions · {meta.totalCompanies} companies</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <a className="brand brand-sm" href={href('/')}><span className="brand-mark">BA</span></a>
          <label className="field field-grow search">
            <Icon name="search" size={17} />
            <input ref={input} value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Search questions, companies, topics…  ( / )" aria-label="Search" />
            {q && <button className="icon-btn" onClick={() => onSearch('')} aria-label="Clear search"><Icon name="x" size={15} /></button>}
          </label>
          <button className="icon-btn theme" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle dark / light"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} /></button>
        </header>
        <main id="content">{page}</main>
        <footer className="footer">Questions collected from a WhatsApp group of real interview experiences. Practise honestly — and good luck! 🍀</footer>
      </div>

      <nav className="tabbar" aria-label="Main">
        {NAV.filter(([p]) => p !== '/most-asked').map(([p, label, icon]) => (
          <a key={p} href={href(p)} className={`tab-link ${active(p) ? 'active' : ''}`}><Icon name={icon} size={20} /><span>{label}</span></a>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return <ThemeProvider><ProgressProvider><SpeechProvider><Shell /></SpeechProvider></ProgressProvider></ThemeProvider>;
}
