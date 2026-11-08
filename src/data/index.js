import raw from './interviews.json';

export const meta = raw.meta;
export const topics = raw.topics;

export const LEVELS = {
  L1: { label: 'Round 1 · L1', short: 'L1', hue: 220 },
  L2: { label: 'Round 2 · L2', short: 'L2', hue: 268 },
  L3: { label: 'Round 3 · Manager', short: 'L3', hue: 28 },
  Assignment: { label: 'Assignment / Task', short: 'Task', hue: 150 },
  'Not specified': { label: 'Round not stated', short: 'Any', hue: 230 },
};
export const LEVEL_ORDER = ['L1', 'L2', 'L3', 'Assignment', 'Not specified'];

export const CATEGORY_META = {
  'Introduction & HR': { emoji: '👋', hue: 205, blurb: 'Tell me about yourself, strengths, notice period, why you are switching.' },
  'Project & Role': { emoji: '💼', hue: 232, blurb: 'Your project walk-through, day-to-day work, documents and tools.' },
  'Requirements & Elicitation': { emoji: '🔍', hue: 262, blurb: 'Gathering, validating and managing requirements.' },
  'Documentation (BRD/FRD/RTM)': { emoji: '📄', hue: 280, blurb: 'BRD, FRD, SRS, URS, RTM and sign-off.' },
  'User Stories & Acceptance Criteria': { emoji: '📝', hue: 320, blurb: 'INVEST, Gherkin, epics, features and negative scenarios.' },
  'Agile & Scrum': { emoji: '🏃', hue: 160, blurb: 'Ceremonies, DoD / DoR, sprints, backlog and metrics.' },
  Prioritisation: { emoji: '🎯', hue: 12, blurb: 'MoSCoW, value vs effort and negotiating priorities.' },
  'Change & Scope Management': { emoji: '🔁', hue: 38, blurb: 'Change requests, scope creep, impact and gap analysis.' },
  'Stakeholder Management': { emoji: '🤝', hue: 350, blurb: 'Conflicts, difficult stakeholders and escalations.' },
  'UAT, Testing & Defects': { emoji: '🐞', hue: 0, blurb: 'UAT, test cases, defects and production issues.' },
  'SQL & Data': { emoji: '🗄️', hue: 195, blurb: 'Joins, unions, queries, data mapping, ETL and migration.' },
  'API & Integration': { emoji: '🔌', hue: 180, blurb: 'REST vs SOAP, payloads, integrations and architecture.' },
  'AI & Tools': { emoji: '🤖', hue: 290, blurb: 'AI in daily BA work plus Jira, Figma, Visio and more.' },
  'Process & Diagrams': { emoji: '🔀', hue: 215, blurb: 'BPMN, UML, flowcharts, wireframes and prototypes.' },
  'Insurance Domain': { emoji: '☂️', hue: 250, blurb: 'Claims, policy life cycle, underwriting, subrogation.' },
  'Banking & Lending': { emoji: '🏦', hue: 140, blurb: 'LOS, LMS, mortgages, loan life cycle and beneficiaries.' },
  'Healthcare & LIMS': { emoji: '🧪', hue: 170, blurb: 'LIMS, GxP, 21 CFR Part 11, HL7 / FHIR, EMR.' },
  'Capital Markets': { emoji: '📈', hue: 100, blurb: 'Derivatives, options, trade life cycle, corporate actions.' },
  Payments: { emoji: '💳', hue: 45, blurb: 'Authorization, capture, settlement, reconciliation, failures.' },
  'KYC / AML & Compliance': { emoji: '🕵️', hue: 330, blurb: 'KYC, AML, GDPR, HIPAA, fraud and data privacy.' },
};

const GROUPS = [
  ['Banking & Lending', /bank|lending|mortgage|bfsi|loan|fidelity/i],
  ['Insurance', /insur/i],
  ['Healthcare & Life Sciences', /health|lims|pharma|life sciences|gxp|hospital/i],
  ['Capital Markets', /capital|investment/i],
  ['Payments & KYC-AML', /payment|kyc|aml|fintech/i],
  ['Finance', /financ|accounting/i],
  ['E-commerce', /commerce/i],
  ['Data, API & AI', /data|sql|\bai\b|mdm|api|gen ai/i],
];
export const DOMAIN_GROUPS = GROUPS.map((g) => g[0]);
export function domainGroups(domain) {
  const out = GROUPS.filter(([, rx]) => rx.test(domain)).map(([n]) => n);
  return out.length ? out : ['General BA'];
}

export const companies = raw.companies.map((c) => {
  const groups = [...new Set(c.sessions.flatMap((s) => domainGroups(s.domain)))];
  const results = c.sessions.map((s) => s.result).filter(Boolean);
  return { ...c, groups, results, sessions: [...c.sessions].sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)) };
});
export const companyById = Object.fromEntries(companies.map((c) => [c.id, c]));
export const sessionById = {};

export const questions = [];
companies.forEach((c) =>
  c.sessions.forEach((s) => {
    sessionById[s.id] = { ...s, company: c.name, companyId: c.id };
    s.questions.forEach((q, i) =>
      questions.push({
        ...q,
        order: i + 1,
        company: c.name,
        companyId: c.id,
        sessionId: s.id,
        level: s.level,
        round: s.round,
        domain: s.domain,
        role: s.role,
        result: s.result,
        hay: `${q.q} ${c.name} ${q.category} ${s.domain} ${s.round} ${s.role}`.toLowerCase(),
      })
    );
  })
);
export const questionById = Object.fromEntries(questions.map((q) => [q.id, q]));

export const categories = Object.keys(CATEGORY_META)
  .map((name) => {
    const list = questions.filter((q) => q.category === name);
    return {
      name,
      ...CATEGORY_META[name],
      count: list.length,
      tricky: list.filter((q) => q.tricky).length,
      companies: new Set(list.map((q) => q.companyId)).size,
    };
  })
  .filter((c) => c.count)
  .sort((a, b) => b.count - a.count);

export const trickyCount = questions.filter((q) => q.tricky).length;
export const answerCount = questions.filter((q) => q.answer).length;

export const studyPath = (kind, key = 'all', qid = '') => `/study/${kind}/${encodeURIComponent(key)}${qid ? `?q=${qid}` : ''}`;

export function resolveDeck(kind, key, progress) {
  switch (kind) {
    case 'company': {
      const c = companyById[key];
      return { title: c?.name ?? 'Company', sub: 'All rounds', back: `/company/${key}`, list: questions.filter((q) => q.companyId === key) };
    }
    case 'session': {
      const s = sessionById[key];
      return { title: s ? `${s.company} · ${s.round}` : 'Round', sub: s?.role ?? '', back: s ? `/company/${s.companyId}` : '/companies', list: questions.filter((q) => q.sessionId === key) };
    }
    case 'category':
      return { title: key, sub: 'Category', back: `/category/${encodeURIComponent(key)}`, list: questions.filter((q) => q.category === key) };
    case 'topic': {
      const t = topics.find((x) => x.key === key);
      return { title: t?.label ?? 'Topic', sub: 'Most asked', back: `/topic/${key}`, list: questions.filter((q) => q.topic === key) };
    }
    case 'tricky':
      return { title: 'Tricky & scenario questions', sub: 'Think before you answer', back: '/tricky', list: questions.filter((q) => q.tricky) };
    case 'saved': {
      const pick = { starred: (q) => progress.stars[q.id], review: (q) => progress.marks[q.id] === 'review', known: (q) => progress.marks[q.id] === 'known' }[key] ?? (() => false);
      const label = { starred: 'Bookmarked', review: 'Needs review', known: 'Known' }[key] ?? 'Saved';
      return { title: `${label} questions`, sub: 'My list', back: '/saved', list: questions.filter(pick) };
    }
    default:
      return { title: 'All questions', sub: `${questions.length} questions`, back: '/', list: questions };
  }
}
