# svadobnysalonjarka.sk

Web pre Svadobný salón Jarka v Galante — prezentácia kolekcií, rezervácia termínu skúšky
a interná správa rezervácií a galérie.

## Stack

- **web** — Next.js 16 (App Router, ISR) + React 19 + TypeScript, SCSS moduly
- **backend** — Express 5 + TypeScript, Mongoose (MongoDB Atlas), zod, helmet, sharp
- **nasadenie** — jeden Docker image pre tri služby (nginx, Next.js, API), GHCR, GitHub Actions, DigitalOcean droplet

## Lokálny vývoj

```bash
cd backend && npm ci && cp .env.example .env && npm run dev
```

```bash
cd web && npm ci && npm run dev
```

Next beží na `http://localhost:5173` a proxuje `/api` a `/images` na `API_ORIGIN` (predvolene `http://localhost:4000`).
Verejné stránky sa renderujú na serveri s dátami z API a cachujú sa (ISR, 5 minút). Po zmene fotiek v admine
ich API hneď obnoví cez `POST /revalidate`, ak má nastavené `WEB_REVALIDATE_URL` a `REVALIDATE_SECRET`.

Hash admin hesla sa generuje takto:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 12))" 'vase-heslo'
```

Naplnenie galérie fotkami, ktoré sú súčasťou buildu:

```bash
cd backend && npm run seed
```

## Kontroly

Rovnaké príkazy beží aj CI:

```bash
cd backend && npm run check
```

```bash
cd web && npm run check
```

## API

| Metóda | Cesta | Popis |
| --- | --- | --- |
| GET | `/api/health` | health check pre deploy skript |
| GET | `/api/gallery` | fotografie po kategóriách |
| GET | `/api/availability?date=` | voľné termíny na daný deň |
| POST | `/api/reservations` | žiadosť o termín (rate limited) |
| POST | `/api/admin/login` · `/logout` | prihlásenie majiteľky (JWT v httpOnly cookie) |
| GET/POST/PATCH/DELETE | `/api/admin/reservations` | správa rezervácií |
| GET | `/api/admin/day?date=` | denný rozpis vrátane obsadených termínov |
| GET/PUT | `/api/admin/settings` | dĺžka skúšky a pauza medzi skúškami |
| GET/POST/DELETE | `/api/admin/photos` | správa fotografií galérie |

## Nasadenie

CI (`.github/workflows/ci.yml`) pri každom pushi na `main` spustí kontroly webu
a backendu, zostaví image, pošle ho do GHCR (`latest` + commit sha) a cez SSH spustí
`deploy/deploy.sh` s tým konkrétnym sha. Skript stiahne presne ten image, spustí compose,
počká na `/api/health` aj úvodnú stránku, obnoví cache stránok a pri neúspechu sa vráti na posledný zdravý tag.

### Príprava droplet-u (jednorazovo)

```bash
mkdir -p /opt/svadobnysalonjarka && cd /opt/svadobnysalonjarka
git clone git@github.com:Be-Marvelous-Digital/svadobnysalonjarka.sk.git
cd svadobnysalonjarka.sk && cp backend/.env.example backend/.env
```

Vyplňte `backend/.env` (MONGODB_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD), do koreňového `.env`
dajte `REVALIDATE_SECRET` (napr. `openssl rand -hex 32`) a
prihláste docker do GHCR. Potom raz spustite `npm run seed` v `backend/` — založí
admin účet a nahrá do databázy fotky dodané s aplikáciou.

### GitHub secrets

`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

## Zálohovanie

Rezervácie a metadáta fotiek sú v MongoDB Atlas. Nahraté fotografie žijú v docker volume
`gallery-uploads` — zálohujte ho spolu s databázou, je to jediný stav mimo nej.
