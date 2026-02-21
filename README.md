# F1 Time Machine

Explore Formula 1 seasons day by day. Race results, standings, driver lineups, regulations, quotes, and more — all presented through a dark, modern interface that **you can redesign with AI**.

**[timemachinegp.com](https://timemachinegp.com)**

## AI Theme Customization

The site has a built-in AI customizer. Click "Customize", type what you want — the AI reshapes the entire UI in real time.

- **Colors** — background, cards, accent, text, borders
- **Layout** — card sizes, grid columns, content width, spacing
- **Typography** — font sizes
- **Content order** — rearrange items ("put Ferrari first")
- 4 one-click presets: Ocean Blue, Warm Red, Neon Green, Classic Light
- Persists in localStorage — your design survives page reloads
- Reset to defaults anytime

Powered by Claude Haiku. The AI receives only your text prompt, generates a JSON theme config, the frontend applies it via CSS overrides + DOM manipulation. No cookies, no tracking.

## Features

**17 pages** covering every aspect of an F1 season:

- **Day-by-day timeline** — browse any day of the season, see what happened
- **Race results** — grid positions, finishing order, gaps, fastest laps, penalties
- **Qualifying** — Q1/Q2/Q3 times breakdown
- **Standings** — driver & constructor tables with round-by-round progression charts
- **Head-to-head** — teammate comparison: qualifying, races, points, DNFs, fastest laps
- **Lap position chart** — interactive visualization of position changes throughout a race
- **Season preview** — regulations, transfers, grid changes, team entries
- **Pre-season testing** — session results with lap times
- **Keyboard navigation** — arrow keys to move between days, Shift+arrows to jump to races
- **Post-race pages** — dedicated pages showing results + updated standings after each race
- **Championship finale preview** — scenario cards for the 2010 Abu Dhabi showdown

## Seasons

| Season | Status | Data |
|--------|--------|------|
| **2010** | Complete | 19 races, 100+ curated events, quotes, penalties, post-race pages |
| **2026** | In progress | Pre-season testing, regulations, transfers, calendar |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TanStack Query, Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| Database | SQLite |
| AI | Claude Haiku 4.5 (Anthropic API) |
| Data | Jolpi.ca (Ergast wrapper) + handcrafted JSON |

**36 API endpoints**, **18 database tables**, **34 React components**, zero CSS frameworks.

## Run Locally

```bash
# Clone
git clone https://github.com/seoshmeo/f1-time-machine
cd f1-time-machine

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env  # Edit with your ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000

# Seed database (new terminal)
cd data/scripts
pip install -r ../requirements.txt
python seed_all.py --year 2010

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

The customize feature requires an [Anthropic API key](https://console.anthropic.com/). Everything else works without it.

## Project Structure

```
frontend/          React SPA (17 pages, 34 components)
backend/           FastAPI (14 routers, 36 endpoints)
data/              Seeding scripts + curated JSON
  curated/         Handcrafted events, quotes, penalties
  scripts/         17 data pipeline scripts
db/                SQLite database
bot/               Telegram bot (daily F1 digests)
```

## How the AI Customizer Works

```
User: "ocean blue theme, bigger cards, put Verstappen first"
                    |
                    v
        POST /api/v1/customize
                    |
                    v
    Backend: system prompt + user prompt → Claude Haiku
                    |
                    v
    Claude returns JSON: { colors: {...}, layout: {...}, reorder: [...] }
                    |
                    v
    Backend validates: hex colors, CSS units, safe text
                    |
                    v
    Frontend: injects <style> with !important overrides
              + MutationObserver for inline style replacement
              + CSS order for content reordering
                    |
                    v
    Saved to localStorage → persists across sessions
```

The system prompt constrains Claude to output only valid JSON matching the ThemeConfig schema. Backend validates every value with regex (hex colors, CSS units, safe text for reorder). No HTML, JS, or executable content can pass through.

## Privacy

- No cookies
- No analytics
- No user accounts
- Theme stored only in your browser's localStorage
- AI customization: only your text prompt is sent to Anthropic API (zero-retention mode)

## License

MIT
