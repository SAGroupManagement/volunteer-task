# 📋 Gestiune Taskuri Voluntari

Aplicație web pentru managementul taskurilor unui grup de voluntari.

## Ce face aplicația

- **Adminul** poate: adăuga/șterge membrii, crea/edita/șterge taskuri, asigna taskuri voluntarilor
- **Voluntarii** pot: vedea doar taskurile lor, schimba statusul, adăuga observații
- **Actualizări în timp real** — toți văd schimbările instant
- **Fără limită** de utilizatori sau taskuri

---

## Ghid de setup pas cu pas

### Pasul 1 — Creează cont pe Supabase (baza de date gratuită)

1. Mergi la **https://supabase.com** și creează cont (cu email-ul de grup, nu cel personal)
2. Apasă **„New Project"**
3. Pune un nume (ex: `voluntari-tasks`)
4. Pune o parolă de database (salvează-o undeva)
5. Alege regiunea **EU West** (cea mai aproape de România)
6. Apasă **„Create new project"** — așteaptă 1-2 minute

### Pasul 2 — Creează tabelele în baza de date

1. În dashboard-ul Supabase, mergi la **SQL Editor** (iconul din sidebar)
2. Apasă **„New Query"**
3. Deschide fișierul `supabase-setup.sql` din acest proiect
4. Copiază TOT conținutul și lipește-l în SQL Editor
5. Apasă **„Run"** — ar trebui să vezi „Success"

### Pasul 3 — Dezactivează confirmarea prin email (opțional, dar recomandat)

1. În Supabase, mergi la **Authentication** → **Providers** → **Email**
2. Dezactivează **„Confirm email"** — asta face ca voluntarii să se poată loga imediat fără să confirme pe email
3. Apasă **Save**

### Pasul 4 — Copiază cheile de acces

1. În Supabase, mergi la **Settings** → **API** (sau **Project Settings** → **API**)
2. Copiază **Project URL** (arată ca `https://xxxxx.supabase.co`)
3. Copiază **anon public key** (cheia lungă)
4. Le vei folosi la Pasul 6

### Pasul 5 — Pune codul pe GitHub

1. Mergi la **https://github.com** și creează cont (cu email-ul de grup)
2. Apasă **„+"** → **„New repository"**
3. Nume: `volunteer-tasks`, lasă-l **Public**, apasă **Create**
4. Apasă **„uploading an existing file"**
5. Trage TOATE fișierele și folderele din acest proiect (src/, index.html, package.json, vite.config.js) și dă-le drumul acolo
6. **IMPORTANT:** NU încărca fișierul `.env` sau `.env.example` pe GitHub!
7. Apasă **„Commit changes"**

### Pasul 6 — Publică site-ul pe Vercel (hosting gratuit)

1. Mergi la **https://vercel.com** și creează cont cu contul de GitHub de la pasul anterior
2. Apasă **„Add New"** → **„Project"**
3. Selectează repository-ul `volunteer-tasks` din lista ta de GitHub
4. La secțiunea **Environment Variables**, adaugă:
   - `VITE_SUPABASE_URL` = URL-ul copiat la Pasul 4
   - `VITE_SUPABASE_ANON_KEY` = cheia anon copiată la Pasul 4
5. Apasă **„Deploy"** — așteaptă 1-2 minute
6. Primești un link de genul `volunteer-tasks.vercel.app` — ACESTA E SITE-UL!

### Pasul 7 — Fă-ți contul de admin

1. Deschide link-ul site-ului
2. Creează un cont (tab-ul „Cont nou") cu email-ul de admin
3. În Supabase, mergi la **Table Editor** → tabela **profiles**
4. Găsește rândul cu emailul tău
5. Schimbă coloana **role** din `volunteer` în `admin`
6. Gata! Acum ești admin și poți gestiona totul

### Pasul 8 — Invită voluntarii

1. Trimite-le link-ul site-ului (`volunteer-tasks.vercel.app`)
2. Fiecare își creează cont singur
3. Ei apar automat ca „voluntar" în lista de membrii
4. Tu le asignezi taskuri din dashboard

---

## Transferul către altcineva

Când pleci din grup, predă:
- Datele de logare GitHub (email de grup + parolă)
- Datele de logare Supabase (email de grup + parolă)
- Datele de logare Vercel (se loghează cu GitHub)
- Fă persoana următoare admin din dashboard-ul aplicației

Aplicația va funcționa în continuare fără tine.

---

## Structura proiectului

```
volunteer-tasks/
├── index.html              — Pagina HTML principală
├── package.json            — Dependențe
├── vite.config.js          — Configurare build
├── supabase-setup.sql      — Script pentru baza de date
├── .env.example            — Exemplu variabile de mediu
└── src/
    ├── main.jsx            — Punctul de intrare React
    ├── App.jsx             — Componenta principală
    ├── supabaseClient.js   — Conexiune la Supabase
    ├── components/
    │   ├── Auth.jsx        — Login / Signup
    │   ├── Dashboard.jsx   — Dashboard principal
    │   ├── TaskTable.jsx   — Tabelul de taskuri
    │   ├── TaskForm.jsx    — Formular task nou/editare
    │   └── AdminPanel.jsx  — Gestionare membrii
    └── styles/
        └── app.css         — Stiluri
```
