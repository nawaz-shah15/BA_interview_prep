#!/usr/bin/env python3
"""Parse the WhatsApp-group interview Excel into structured JSON.

Each block below was identified by reading the sheet: (start_row, company, level,
domain, role, extras). Rows are Excel row numbers. Everything is deterministic, so
re-running regenerates src/data/interviews.json.
"""
import json, re, sys, collections
import openpyxl

SRC = sys.argv[1]
OUT = sys.argv[2]

L1, L2, L3, AS, NA = "L1", "L2", "L3", "Assignment", "Not specified"

# (start, end_exclusive_or_None, company, level, round_label, domain, role, opts)
# opts: meta=set(rows to skip), join=[(rows...)] -> one question, qa=True answers follow,
#       result=..., note=..., scenario=True
B = []
def blk(start, end, company, level, round_label, domain, role="Business Analyst", **o):
    B.append(dict(start=start, end=end, company=company, level=level, round=round_label,
                  domain=domain, role=role, **o))

blk(1, 24, "Eastencher Software Technologies", L1, "Round 1 · Face to Face (45 mins)", "Healthcare", meta={2, 3}, location="Whitefield, Bangalore")
blk(25, 27, "Eastencher Software Technologies", AS, "Round 2 · Documentation task (1 hour)", "Healthcare", meta={25}, location="Whitefield, Bangalore", kind="task")
blk(28, 40, "Societe Generale", L1, "Round 1", "Banking", meta={29})
blk(41, 53, "Allegis Solutions", L1, "Round 1", "Finance & Accounting", meta={42, 51}, role="Business Analyst (AP / Finance)")
blk(54, 63, "Deloitte", L1, "Round 1", "Banking / Insurance (AML)", meta={55}, join=[(59, 60, 61)])
blk(64, 75, "Deloitte", L3, "Round 3 · Manager round", "General")
blk(76, 95, "ValueLabs", L1, "Round 1 · Technical", "Pharma Manufacturing / LIMS", role="Senior Business Analyst", meta={78, 80, 82})
blk(96, 121, "Mastech", L1, "Round 1", "General / Agile", meta={98})
blk(122, 136, "Mphasis", L1, "Round 1", "BFSI (Banking & Lending)")
blk(137, 152, "Persistent Systems", L1, "Round 1", "Insurance", meta={137})
# rows 153-167 are an exact duplicate of the Persistent block above -> skipped
blk(168, 181, "ACC", L1, "Round 1", "Banking")
blk(182, 192, "HCA Healthcare", L1, "Face to Face", "Healthcare", meta={183, 188}, scenario_rows={189, 190})
blk(193, 230, "Eurofins", NA, "Interview", "LIMS / Life Sciences", role="Senior Techno-Functional Business Analyst", meta={195})
blk(231, 239, "EY", L1, "Round 1 · Mumbai", "Investment Banking", meta={232, 234})
blk(240, 257, "Digit Insurance", L1, "Round 1 · Pune", "Insurance")
blk(258, 278, "Computershare", L1, "Round 1", "Finance / Investor Services")
blk(279, 298, "Digit Insurance", L2, "Round 2", "Insurance")
blk(299, 301, "Altimetrik", L1, "Round 1", "General", cellsplit=True)
blk(302, 314, "Altimetrik", L2, "Round 2", "General")
blk(315, 327, "Photon", L1, "Round 1 (L1)", "Banking / Agile")
blk(328, 339, "Photon", L2, "Round 2 (L2)", "Banking / Capital Markets", join=[(330, 332)], scenario_rows={330})
blk(340, 360, "Bounteous", L1, "Round 1 · Bounteous x Accolite", "General / SQL / Excel")
blk(361, 380, "Cognizant", L1, "Round 1", "Payments / KYC-AML", meta={362, 363})
blk(381, 396, "Deloitte", L1, "Round 1 · Technical", "Process Modelling", role="Process Modelling Consultant", meta={382, 383})
blk(397, 435, "AQM Technologies", NA, "Interview · Mumbai", "Insurance (Health Claims)")
# Novelty Data Solutions is hand-written below (row 436 is one long header line)
blk(448, 464, "Altimetrik", L2, "Round 2", "Data / Agile")
blk(465, 487, "TransLab", L1, "Round 1", "Healthcare", role="Business Analyst (2-4 yrs)", meta={466, 467, 468}, location="HSR, Bangalore")
blk(488, 511, "Fidelity", L1, "Round 1", "Banking", meta={489, 490, 491, 500})
blk(512, 525, "MSIG Insurance", L1, "Round 1", "Insurance (P&C)")
blk(526, 536, "Value Momentum", L1, "Round 1", "Health Insurance")
blk(537, 550, "Digital Sprint AI Solutions", L1, "Round 1 · Bangalore", "General / Technical Feasibility", meta={538})
blk(551, 576, "SysArc Infomatix", L1, "Round 1 · Bangalore", "Banking / Lending", meta={552},
    note="Rows from 562 onward had no heading in the source sheet and follow the SysArc block, so they are grouped here.")
blk(577, 590, "Sonata Software", L1, "Round 1", "General")
# LTIMindtree R1 hand-written (two-column layout)
blk(608, 619, "Samsung", L1, "Round 1", "E-commerce / Quick-commerce")
blk(620, 629, "Immidart", L1, "Round 1", "E-commerce / API Integration")
blk(630, 641, "LTIMindtree", L1, "Round 1", "Banking", meta={631, 632})
blk(642, 657, "Takeda", L1, "Round 1 · Bangalore", "Healthcare / Life Sciences (GxP)", meta={643}, join=[(647, 648, 649, 650, 651)], scenario_rows={647})
blk(658, 673, "MedImpact", L1, "Round 1", "Healthcare / SQL", meta={659})
blk(674, 685, "Rumango", L1, "Round 1", "BFSI (Lending / Compliance)", meta={675})
blk(686, 703, "CGI", L1, "Round 1", "Business Analyst with QA", meta={687, 688})
blk(704, 717, "Value Momentum", L2, "Round 2", "Health Insurance")
blk(718, 739, "Incedo", L1, "Round 1", "Data Migration / SQL")
blk(740, 760, "Capco", L1, "L1 · Capital Market domain", "Capital Markets", prefix_star=True)
blk(761, 787, "Capco", L1, "L1 · BA questions", "General / Agile", prefix_star=True)
blk(788, 825, "Wells Fargo", L1, "L1 · Loan & Mortgage (Lending)", "Lending / Mortgage", qa=True, meta={825})
blk(826, 854, "Wells Fargo", L2, "L2 · Loan & Mortgage (Lending)", "Lending / Mortgage", qa=True)
blk(855, 892, "Quinnox", L1, "Round 1", "Healthcare / LIMS", qa=True)
blk(893, 918, "Sama Technologies", L1, "Round 1", "Insurance (US P&C)")
blk(919, 932, "Hexaware", L1, "L1", "General / Agile")
blk(933, 949, "Aden AI", L1, "Round 1 · Hyderabad", "Insurance / API / AI", meta={934, 949}, dedupe=True)
blk(950, 969, "Aden AI", L2, "Round 2", "Insurance / Claims / Low-code", meta={950})
blk(970, 987, "Unnamed company (\"Best Interview Experience\")", NA, "Interview", "Data / MDM / API / SQL", meta={970, 971, 972},
    note="Company was not named in the source sheet; it was labelled only as 'Best Interview Experience'.")
blk(988, 998, "TCS", L1, "Round 1 · 07/08/2026", "General / SQL")
blk(999, 1018, "Eurofins", L1, "Round 1 · Technical", "LIMS / Life Sciences", role="Business / Functional Analyst", meta={1000, 1001})
blk(1019, 1037, "Cognizant", L1, "Round 1 · Technical (Cleared)", "Payments", meta={1020}, result="Cleared")
blk(1038, 1054, "Cognizant", L2, "Round 2 · Technical (Rejected)", "Payments", meta={1039}, result="Rejected")
blk(1055, 1066, "Indium Tech", L1, "Round 1", "Insurance / SQL")
blk(1067, 1082, "Altimetrik", L1, "Round 1", "Logistics / AI / Data")
blk(1083, 1096, "Tech Mahindra", L1, "Round 1", "General / Gen AI", meta={1084})
blk(1097, 1114, "Tech Mahindra", L2, "Round 2 · Morgan Stanley client", "Banking / UML / Gen AI")
blk(1115, 1134, "Bounteous", L1, "Round 1 · India", "Banking")
blk(1135, 1147, "RoundCube", L1, "Round 1", "General")
blk(1148, 1161, "iMedHas", L1, "Round 1", "Healthcare")
blk(1162, 1175, "Healthfirst Technologies", L1, "Round 1", "Healthcare / LIMS")
blk(1176, 1203, "HTC Global Services", L1, "Round 1", "Healthcare / LIMS")
blk(1204, 1216, "Emsyne", L1, "Round 1", "Banking / Lending")
blk(1217, 1227, "Tech Mahindra", L1, "Round 1 · EY client", "General / Agile")
blk(1228, 1249, "Takeda", L1, "L1", "Healthcare / LIMS", scenario_rows={1233, 1234, 1235, 1236, 1237, 1238})
blk(1250, 1269, "EY", L1, "L1", "Healthcare / Agile", meta={1254, 1265, 1266})
blk(1270, 1293, "Quesscorp", L1, "Round 1", "Banking / General")
blk(1294, 1305, "Altimetrik", L2, "Round 2", "LIMS / Healthcare")
blk(1306, 1328, "Eurofins", L1, "L1", "Healthcare / Product", scenario_rows={1318, 1319, 1320, 1321, 1322, 1323})
blk(1329, 1344, "Tech Mahindra", L2, "Round 2 · EY client (Finance)", "Finance")
blk(1345, 1358, "eClerx", L1, "L1", "KYC-AML / CLM", meta={1356})
blk(1359, 1385, "TEKsystems", L1, "Technical · Adobe client", "General / Product")
blk(1386, 1399, "Johnson & Johnson", L1, "L1", "Life Sciences / LIMS")
blk(1400, 1411, "Ascendion", L1, "L1", "Enterprise Applications")
blk(1412, 1425, "SEWB", L1, "L1", "General")
blk(1426, 1446, "Empower Tech", L1, "Round 1 · Canada Life client", "Life Insurance")
blk(1447, 1467, "Cognizant", L1, "L1", "LIMS / Healthcare API")
blk(1468, 1483, "Bupa", L1, "L1", "Healthcare (HL7 / EMR)")

HAND = [
    dict(company="Novelty Data Solutions", level=AS, round="Round 1 · Assignment", domain="Healthcare",
         role="Business Analyst (3 yrs)", client="Manipal Hospital (Indiranagar)", kind="task",
         questions=[
            "Manipal Patient App (iOS | Android): Create a short faceless user-training video (1–3 minutes) demonstrating the doctor appointment booking feature, with user-manual style annotations and voice-over explanation.",
            "Manipal MAHI Website: Prepare mini versions of — A. BRD, B. FRD, C. User stories with acceptance criteria, D. API documentation with dummy technical details.",
            "Manipal Life on Website: Prepare an executive summary outlining key features and impact.",
         ]),
    dict(company="LTIMindtree", level=L1, round="Round 1", domain="Banking / Payments",
         role="Business Analyst",
         questions=[
            "Tell me about yourself in brief.",
            "Tell me how you start your day as a Business Analyst.",
            "Write user stories and acceptance criteria for a Google Pay transaction. Scenario: you are shopping in a supermarket; after billing you pay using Google Pay by scanning the merchant's QR code. Cover three cases: (1) payment is successful, (2) payment is declined, (3) payment remains pending.",
            "Suppose you created a user story with acceptance criteria. The developer implemented the feature and completed unit testing. During QA testing, the tester finds a valid defect that is not covered in the user story or acceptance criteria and asks why it was missed. How would you handle this situation?",
            "Version 1 of a Business Requirement Document (BRD) has already been approved. Now the business requests additional changes. How would you prepare Version 2 of the BRD? What sections would you update, and how would you maintain version control?",
            "Internal Customer vs External Customer.",
            "How do you manage the Product Backlog?",
         ]),
]

wb = openpyxl.load_workbook(SRC)
ws = wb["Sheet1"]
cells = {}
for i, (a, b) in enumerate(ws.iter_rows(values_only=True), start=1):
    cells[i] = (a, b)

NUM = re.compile(r"^\s*(?:Q\s*)?\d{1,2}\s*[\.\):;\-]?\s*(?=\S)", re.I)
NUM_ONLY = re.compile(r"^\s*(?:Q\s*)?\d{1,2}\s*[\.\):;\-]?\s*", re.I)
INLINE_SPLIT = re.compile(r"(?<=[\?\.\w])\s+(?=\d{1,2}\.\s+[A-Z])")
ANS = re.compile(r"^\s*(Ans\s*[:;\.]?|Discussed\.?|Yes:|Answer\s*:)\s*", re.I)
BAD = "⁠​‎‏﻿"

def clean(t):
    t = "".join(ch for ch in t if ch not in BAD)
    t = t.replace("’", "'").replace("“", '"').replace("”", '"')
    t = re.sub(r"\s+", " ", t).strip()
    return t

def strip_num(t):
    t = t.strip()
    t = re.sub(r"^\*\s+", "", t)
    m = re.match(r"^\s*(?:Q\s*)?(\d{1,2})\s*[\.\):;]\s*(.*)$", t, re.I)
    if m:
        return m.group(2)
    m = re.match(r"^\s*(\d{1,2})\s*(?=[A-Za-z])", t)  # "11what is ..."
    if m:
        return t[m.end():]
    return t

def is_numbered(t):
    return bool(re.match(r"^\s*(?:Q\s*)?\d{1,2}\s*(?:[\.\):;]|(?=[A-Za-z]))", t, re.I))

def normalise(q):
    q = clean(q)
    q = re.sub(r"^(Q\.\s*)", "", q); q = re.sub(r"^\W+", "", q) if not q[:1].isalnum() else q
    q = re.sub(r"([?!])\1+", r"\1", q)
    q = re.sub(r"\.{2,}$", ".", q)
    q = re.sub(r"\s+([?])", r"\1", q)
    low = q.lower().strip(" .?")
    if low in ("intro", "introduction", "introduce yourself", "introduces yourself", "introduce yourself in detail", "self introduction", "intro in 3 mins", "talk about yourself", "tell me about your self"):
        return "Introduce yourself / Tell me about yourself."
    if re.match(r"^do you have any questions to me", low):
        return "Do you have any questions for me?"
    fixes = [(r"\bfedelity\b", "fidelity"), (r"\bpriorati[sz]e\b", "prioritise"), (r"\bvender\b", "vendor"),
             (r"\bfeasibil?ity\b", "feasibility"), (r"\bfiseability\b", "feasibility"),
             (r"\bdepriciation\b", "depreciation"), (r"\bteminolgy\b", "terminology"), (r"\bapplictionn\b", "application"),
             (r"\bsenario\b", "scenario"), (r"\bsprint backlong\b", "sprint backlog"), (r"\bdefination\b", "definition"),
             (r"\bscope screep\b", "scope creep"), (r"\bfish born\b", "fishbone"), (r"\bparrot theory\b", "Parrot (Pareto) theory"),
             (r"\bTRM\b", "RTM"), (r"\bHIPPA\b", "HIPAA"), (r"\bmanger\b", "manager")]
    for pat, rep in fixes:
        q = re.sub(pat, rep, q, flags=re.I) if pat not in (r"\bTRM\b", r"\bHIPPA\b") else re.sub(pat, rep, q)
    q = q[0].upper() + q[1:] if q else q
    if q and q[-1] not in "?.!)\"'":
        q += "?" if re.match(r"^(what|how|why|when|where|who|which|do|does|did|can|could|are|is|will|would|have|has|explain|difference)", q, re.I) and not q.lower().startswith(("explain", "difference")) else ""
    return q

def lines_for(block):
    out = []
    for r in range(block["start"], (block["end"] or block["start"] + 1)):
        a, b = cells.get(r, (None, None))
        if r == 436:  # novelty (hand-written)
            continue
        if a is None and b is None:
            continue
        if isinstance(a, (int, float)) and b:
            out.append((r, f"{int(a)}. {b}")); continue
        if a is None:
            continue
        a = str(a)
        parts = a.split("\n") if block.get("cellsplit") or "\n" in a else [a]
        for p in parts:
            if p.strip():
                out.append((r, p))
    return out

def parse_block(b):
    lines = lines_for(b)
    meta = set(b.get("meta", set())) | {b["start"]}
    join = {rr[0]: rr for rr in b.get("join", [])}
    joined_skip = {r for rr in b.get("join", []) for r in rr[1:]}
    scen = b.get("scenario_rows", set())
    prefix_star = b.get("prefix_star")
    qa = b.get("qa")
    qs = []
    # for cellsplit blocks, the first line is a header
    first_line_skipped = False
    for idx, (r, t) in enumerate(lines):
        if b.get("cellsplit") and r == b["start"] and not first_line_skipped:
            first_line_skipped = True
            continue
        if r in meta and not b.get("cellsplit"):
            continue
        if r in joined_skip:
            continue
        txt = clean(t)
        if not txt or re.fullmatch(r"[=\-\s]+", txt):
            continue
        if qa and qs and not is_numbered(txt):
            qs[-1]["answer"] = (qs[-1].get("answer", "") + "\n" + ANS.sub("", txt)).strip()
            continue
        # may contain several numbered questions on one line
        pieces = INLINE_SPLIT.split(txt) if is_numbered(txt) else [txt]
        for p in pieces:
            q = strip_num(p)
            if r in join:
                extra = [clean(str(cells[x][0])) for x in join[r][1:] if cells[x][0]]
                if b["company"] == "Deloitte" and r == 59:
                    q = "Exercise: out of the given records (name, country, investment / insurance amount, ID proofs), which are the red flags and why? Then select the ones you would flag, and justify."
                elif b["company"] == "Takeda":
                    q = "Scenario: Digitize the information from the donor centre to the lab. Write: (i) Business requirement, (ii) User requirement, (iii) User stories, (iv) a SQL JOIN query."
                elif b["company"] == "Photon":
                    q = "Requirement: introduce a new feature in the mobile banking app that lets a user add beneficiary details. Write a complete user requirement and user story with acceptance criteria including negative scenarios (15 minutes to write)."
            q = normalise(q)
            if len(q) < 4:
                continue
            rec = {"q": q, "row": r}
            if r in scen or r in join and b.get("scenario_rows") and r in scen:
                rec["scenarioHint"] = True
            qs.append(rec)
    if b.get("dedupe"):
        seen = set(); u = []
        for x in qs:
            k = re.sub(r"\W+", "", x["q"].lower())
            if k in seen: continue
            seen.add(k); u.append(x)
        qs = u
    # prefix_star handled by strip_num ("* ")
    return qs

# ---------------- categorisation ----------------
CATS = [
 ("Introduction & HR", r"\b(tell me about yourself|introduce yourself|introduction|your strength|weakness|why (are|did|do) (you|u)|why should we hire|where do you see|family|notice|expectation|package|relocate|flexible|aspiration|join us|any questions|queries|change (the )?job|leaving|switch(ed)? jobs|reside|preferred work location|when can you join|gap of two years|biggest achievement|handle stress|pressure|work during your leaves|how long you want|what do you know about (our|the) company|do you know about digit|did you leave|career as a ba|educational background|profile overview|lesson learnt|life of a|team size|managed team|junior)"),
 ("Capital Markets", r"\b(capital market|equity|otc|swap|derivative|forward contract|future contract|option|corporate action|margin|short position|long position|securities lending|trade life|custody|depository|sftp|mtm)\b"),
 ("Payments", r"\b(payment|authori[sz]ation and capture|settlement|reversal|refund|reconciliation|gateway|google pay|upi|atm|debited|card)\b"),
 ("KYC / AML & Compliance", r"\b(kyc|aml|money laundering|acams|sar report|gdpr|hipaa|hippa|compliance|regulat|fraud|pii|privacy|red flag)\b"),
 ("Insurance Domain", r"\b(insur|claim|policy|policies|underwrit|subrogation|endorsement|premium|peril|hazard|salvage|deductible|reinstatement|pas system|p&c|indemnity|stfi|rider|majesco|guidewire|life cycle of (a )?polic|quotation)\b"),
 ("Banking & Lending", r"\b(bank|loan|lending|mortgage|los\b|lms\b|ltv|cibil|fico|beneficiar|stp\b|emi|credit|fintech|bfsi)\b"),
 ("Healthcare & LIMS", r"\b(lims|gxp|21 cfr|csv\b|eln|qms|sdms|capa|hl7|fhir|emr|ehr|patient|hospital|donor|lab|microbiology|pharma|sample|labware|labvantage|healthcare|health claims|prescription|gamp)\b"),
 ("SQL & Data", r"\b(sql|join|query|queries|group by|truncate|delete and|union|primary key|foreign key|subquer|index|etl|elt|oltp|olap|data (model|mapping|lineage|quality|migration|validation)|mapping|database|snowflake|excel|vlookup|xlookup|rank|data entity|entity type|source.{0,3}to.{0,3}target|big data|mdm)\b"),
 ("API & Integration", r"\b(api|apis|rest|soap|json|payload|https|integrat|microservice|architecture|n tier|n-tier|web application|technology stack|http)\b"),
 ("AI & Tools", r"\b(ai\b|gen ai|genai|agentic|chatgpt|copilot|gpt|rag\b|claude|tools?\b|jira|confluence|figma|balsamiq|visio|bizagi|draw\.io|azure|devops|servicenow|blueworks|paint)\b"),
 ("Process & Diagrams", r"\b(bpmn|process (model|map|flow)|flow ?chart|uml|sequence diagram|activity diagram|wireframe|mockup|prototype|user journey|use case|diagram|workflow|as.is|to.be)\b"),
 ("Documentation (BRD/FRD/RTM)", r"\b(brd|frd|srs|urs|urd|fsd|sdd|scod|rtm|traceability|document|template|sign.?off|version control|executive summary|requirement (template|doc))\b"),
 ("User Stories & Acceptance Criteria", r"\b(user stor|acceptance criteria|gherkin|given.when.then|invest\b|epic|feature|ac\b|negative scenario)\b"),
 ("Prioritisation", r"\b(prioriti[sz]|moscow|t-shirt|rank|backlog groom|must.have|priority 1|business value)\b"),
 ("Change & Scope Management", r"\b(change request|change control|rfc\b|cab\b|scope creep|scope swap|impact analysis|gap analysis|requirement change|new requirement|cr\b|baseline)\b"),
 ("Stakeholder Management", r"\b(stakeholder|conflict|difficult|escalat|negotiat|resist|disagree|vague|ambiguous|busy|contradict|impossible requirement|pushy|convince)\b"),
 ("UAT, Testing & Defects", r"\b(uat|test case|testing|defect|bug|incident|qa\b|tester|production|go-live|deployment|pvt|validate|validation|showstopper|poc\b)\b"),
 ("Agile & Scrum", r"\b(agile|scrum|sprint|ceremon|retrospective|refinement|backlog|definition of (done|ready)|dod|dor|story point|burndown|velocity|kanban|waterfall|product owner|\bpo\b|scrum master|mvp|demo|metrics?)\b"),
 ("Requirements & Elicitation", r"\b(requirement|elicitation|gather|workshop|brainstorm|feasib|fishbone|root cause|swot|survey|interview|stakeholder analysis|domain|critical path|nfr|non.functional|functional)\b"),
 ("Project & Role", r"\b(project|role|responsibilit|day.to.day|daily|typical (work )?day|ba artifacts?|skills?|documents? (you|do)|business analyst|\bba\b|experience)\b"),
]
CAT_RE = [(n, re.compile(p, re.I)) for n, p in CATS]

SCEN_RE = re.compile(r"(\bscenario\b|\bsuppose\b|\bimagine\b|\blet'?s say\b|\bwhat if\b|\bconsider (a|an)\b|\bhow (would|will|do|can) (you|u) (handle|deal|resolve|manage|approach|negotiate|look|investigate|convince|explain|break|document|define|translate|ensure|know|go)\b.*\b(if|when|but|where|after|while|during)\b|\bif (the |a |there |client|stakeholder|business|you|i )|\bwhat (will|would) you do\b|\bwhat should be your approach\b|\bgiven (a|an|two|the)\b|\bcase:)", re.I)
TASK_RE = re.compile(r"\b(write|draw|create|prepare|frame|show the|share screen|live sql|conduct a requirement|walk me through the process)\b.*", re.I)

# questions that are classic "most asked" topics -> (key, label, regex)
TOPICS = [
 ("intro", "Tell me about yourself", r"tell me about yourself|introduce yourself|^introduction"),
 ("brd-frd", "BRD vs FRD (and URS / SRS)", r"\b(brd|frd|srs|urs|urd|fsd)\b"),
 ("us-ac", "User stories & acceptance criteria", r"user stor|acceptance criteria|gherkin"),
 ("prioritise", "How do you prioritise requirements (MoSCoW etc.)", r"prioriti[sz]|moscow|t-shirt|priority"),
 ("elicit", "Elicitation techniques & how you gather requirements", r"elicitation|gather(ing)? requirement|how (do|will) you (gather|get|pick)|requirement gathering"),
 ("rtm", "RTM (Requirement Traceability Matrix)", r"\brtm\b|traceability"),
 ("gap", "Gap analysis", r"gap analysis"),
 ("cr", "Change request handling", r"change request|change control|\brfc\b|scope creep|mid(dle)? of the sprint|end of the sprint|requirement change|new requirement"),
 ("conflict", "Stakeholder conflicts & difficult stakeholders", r"conflict|difficult stakeholder|disagree|contradictory|opposing|escalat"),
 ("agile", "Agile / Scrum ceremonies", r"ceremon|retrospective|sprint (planning|review|backlog|size|cycle)|refinement|burndown|story point|backlog"),
 ("dod", "Definition of Done vs Ready", r"definition of (done|ready)|\bdod\b|\bdor\b"),
 ("uat", "UAT – what a BA does", r"\buat\b"),
 ("sql", "SQL (joins, union, group by, delete/truncate)", r"\bsql\b|join|union|truncate|group by|primary key|foreign key|subquer|salary"),
 ("api", "API knowledge & integration", r"\bapis?\b|soap|rest\b|payload|https"),
 ("ai", "AI usage as a BA", r"\bai\b|gen ai|chatgpt|copilot|agentic"),
 ("ba-po", "BA vs Product Owner / Scrum Master / PM", r"(ba|business analyst).{0,40}(product owner|\bpo\b|scrum master|project manager|product manager)|(product owner|\bpo\b).{0,40}(ba\b|business analyst)"),
 ("daily", "Day-to-day responsibilities of a BA", r"day.to.day|daily (task|activit)|typical (work )?day|start your day|what do you do as ba|roles? (and|&) responsib"),
 ("mapping", "Data mapping / lineage / migration", r"data mapping|source.{0,3}to.{0,3}target|data lineage|data migration|mapping"),
 ("diagrams", "UML, BPMN, flowcharts & wireframes", r"uml|bpmn|flow ?chart|sequence diagram|activity diagram|wireframe|mockup|prototype|process (map|model|flow)"),
 ("fnr", "Functional vs Non-functional requirements", r"non.functional|functional (and|vs)|nfr"),
 ("why-change", "Why are you changing your job?", r"why (are|do|did) (you|u).{0,30}(chang|leav|switch|join)|looking for (a )?change|why .*leav"),
 ("feasible", "Technical feasibility", r"feasib"),
 ("gxp", "GxP / 21 CFR Part 11 / LIMS", r"gxp|21 cfr|\blims\b|gamp"),
]
TOPIC_RE = [(k, l, re.compile(p, re.I)) for k, l, p in TOPICS]

def categorize(q, block, rec):
    for name, rx in CAT_RE:
        if rx.search(q):
            return name
    return "Project & Role"

def qtype(q, block, rec):
    if block.get("kind") == "task":
        return "Hands-on task"
    cat = rec["category"]
    if cat == "Introduction & HR":
        return "HR / Behavioural"
    if TASK_RE.search(q) and re.search(r"\b(user stor|query|diagram|brd|document|workflow|requirement|acceptance|test)\b", q, re.I) and not re.match(r"^(what|how)\b", q, re.I):
        return "Hands-on task"
    if rec.get("scenarioHint") or SCEN_RE.search(q) or len(q) > 190:
        return "Scenario"
    return "Concept"

def answer_hint(rec):
    return rec

out_companies = {}
sess_id = 0
def add_session(company, level, rnd, domain, role, qs, block):
    global sess_id
    sess_id += 1
    s = dict(id=f"s{sess_id}", level=level, round=rnd, domain=domain, role=role,
             client=block.get("client"), location=block.get("location"),
             result=block.get("result"), note=block.get("note"), questions=[])
    for rec in qs:
        text = rec["q"]
        r = {"q": text}
        r["category"] = categorize(text, block, rec)
        rec["category"] = r["category"]
        r["type"] = qtype(text, block, rec)
        if block.get("kind") != "task" and r["type"] in ("Scenario", "Hands-on task"):
            r["tricky"] = True
        elif block.get("kind") == "task":
            r["tricky"] = True
        else:
            r["tricky"] = False
        for k, l, rx in TOPIC_RE:
            if rx.search(text):
                r["topic"] = k
                break
        if rec.get("answer"):
            r["answer"] = rec["answer"].strip()
        s["questions"].append(r)
    c = out_companies.setdefault(company, dict(name=company, sessions=[]))
    c["sessions"].append(s)

for b in B:
    qs = parse_block(b)
    add_session(b["company"], b["level"], b["round"], b["domain"], b["role"], qs, b)

for h in HAND:
    qs = [{"q": normalise(q) if len(q) < 150 else q} for q in h["questions"]]
    b = dict(kind=h.get("kind"), client=h.get("client"))
    add_session(h["company"], h["level"], h["round"], h["domain"], h["role"], qs, b)

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

companies = []
for name, c in out_companies.items():
    c["id"] = slug(name)
    c["domains"] = sorted({d.strip() for s in c["sessions"] for d in re.split(r"\s*/\s*", s["domain"]) if d.strip() and d.strip() != "General"})
    c["levels"] = sorted({s["level"] for s in c["sessions"]})
    c["count"] = sum(len(s["questions"]) for s in c["sessions"])
    c["tricky"] = sum(1 for s in c["sessions"] for q in s["questions"] if q["tricky"])
    companies.append(c)
companies.sort(key=lambda c: (-c["count"], c["name"]))

# number questions & compute topic stats
qid = 0
topic_counts = collections.defaultdict(lambda: dict(count=0, companies=set()))
for c in companies:
    for s in c["sessions"]:
        for q in s["questions"]:
            qid += 1
            q["id"] = f"q{qid}"
            if "topic" in q:
                t = topic_counts[q["topic"]]
                t["count"] += 1; t["companies"].add(c["name"])
topics = [dict(key=k, label=l, count=topic_counts[k]["count"], companies=sorted(topic_counts[k]["companies"]))
          for k, l, _ in TOPICS if topic_counts[k]["count"]]
topics.sort(key=lambda t: -t["count"])

data = dict(
    meta=dict(totalQuestions=qid, totalCompanies=len(companies),
              totalSessions=sum(len(c["sessions"]) for c in companies),
              source="WhatsApp group – real-time interview questions"),
    companies=companies, topics=topics)
json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
cat = collections.Counter(q["category"] for c in companies for s in c["sessions"] for q in s["questions"])
print(data["meta"]); print(cat.most_common()); print([ (t["label"], t["count"]) for t in topics])
print(collections.Counter(q["type"] for c in companies for s in c["sessions"] for q in s["questions"]))
