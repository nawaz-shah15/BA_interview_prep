# BA Interview Prep

A React + Vite app built from the WhatsApp-group Excel of real Business Analyst interview questions
(991 questions · 58 companies · 83 interview rounds).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/ (deploy anywhere: Netlify, Vercel, GitHub Pages, S3...)
```

## Features
- **Companies** – every company with its rounds (L1 / L2 / Manager / Assignment), role, domain and result; open one and read or practise its questions one by one.
- **Categories** – 20 topics (SQL, Agile, BRD/FRD, Insurance, Banking, LIMS, Payments ...).
- **Tricky** – scenario-based and hands-on questions (write a user story, SQL, flows).
- **Most asked** – topics that repeat across companies (e.g. "Tell me about yourself", BRD vs FRD, SQL joins).
- **Search** – global search (press `/`) across question text, company, topic and domain.
- **Practice mode** – one question at a time with progress bar, shuffle, filters, notes, shortcuts
  (`←` `→` navigate · `Space` read aloud · `K` known · `R` review · `S` bookmark).
- **Read aloud** – browser text-to-speech with voice + speed settings. **Mock interview** mode reads
  the question, gives you N seconds to answer out loud, then moves on automatically.
- **Dark / light mode**, bookmarks, "known" / "review later" tracking – all saved in the browser (localStorage).

## Data
`src/data/interviews.json` is static, generated from the Excel by `scripts/parse_questions.py`:

```bash
pip install openpyxl
python scripts/parse_questions.py path/to/GROUP_Interview_Questions.xlsx src/data/interviews.json
```

Companies, rounds, categories, "tricky" flags and "most asked" topics are all in that JSON.
