# Saiyan Tracker

A gamified task and habit tracker inspired by Dragon Ball Z. Build your power level by completing tasks, unlock transformations, and let Vegeta roast you when you slack off.

Built to combat ADHD through visible progression, accountability, and positive reinforcement.

![Dashboard](https://img.shields.io/badge/Status-Active-brightgreen) ![Stack](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI-blue)

## Features

**Power System**
- Cumulative power level that grows with every completed task
- 7 transformation tiers: Base → Super Saiyan → SSJ2 → SSJ3 → SSG → SSB → Ultra Instinct
- Full-screen transformation animation when you unlock a new form

**Smart Task Management**
- 4 categories with point multipliers: Side Business (1.5x), Work (1.0x), Personal (0.7x), Recreational (0.5x)
- Energy-aware scheduling — tag tasks as low/medium/high energy and filter by how you feel
- Daily minimum threshold to maintain your streak

**Streak & Accountability**
- Daily streak tracking with escalating bonuses (5% at 7 days up to 20% at 90+ days)
- Vegeta roasts you with increasing severity when you miss days
- Goku cheers you on when you complete tasks and hit milestones
- Off-day system (sick, vacation, rest) that preserves your streak

**Analytics**
- Weekly power chart with daily minimum reference line
- Category breakdown donut chart
- Power level history over time
- Stats cards for weekly points, daily average, and success rate

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand |
| Backend | Python, FastAPI |
| Database | SQLite (SQLAlchemy ORM) |
| Icons | Lucide React |

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

The API will be available at `http://localhost:8000`. The database and seed data (default user, categories, quotes) are created automatically on first startup.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` with API requests proxied to the backend.

## Project Structure

```
saiyan-tracker/
├── backend/
│   └── app/
│       ├── api/v1/          # 8 endpoint routers
│       ├── models/          # 10 SQLAlchemy models
│       ├── schemas/         # Pydantic request/response schemas
│       ├── services/        # Business logic (power, quotes, analytics, energy)
│       ├── core/            # Config and constants
│       ├── database/        # Engine and session management
│       └── main.py          # FastAPI app with seed data
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, Analytics, Settings
│       ├── components/
│       │   ├── dashboard/   # PowerLevelBar, TaskCard, StreakDisplay, EnergySelector, TransformationMeter
│       │   ├── analytics/   # WeeklyChart, CategoryBreakdownChart, PowerHistoryChart
│       │   ├── animations/  # TransformationAnimation, PointsPopup
│       │   └── common/      # TaskFormModal, OffDayModal, VegetaDialog, GokuQuote
│       ├── store/           # Zustand stores (task, power, UI)
│       ├── services/        # Axios API client
│       └── types/           # TypeScript interfaces and constants
└── PRD.md                   # Product Requirements Document
```

## API Endpoints

| Route | Description |
|-------|-------------|
| `GET/POST /api/v1/tasks/` | List and create tasks |
| `GET /api/v1/categories/` | List task categories |
| `POST /api/v1/completions/` | Complete a task (returns points + transformation) |
| `GET /api/v1/power/current` | Current power level and transformation |
| `GET /api/v1/power/transformations` | All transformation tiers with unlock status |
| `GET /api/v1/quotes/contextual` | Context-aware Vegeta/Goku quote |
| `POST /api/v1/off-days/` | Mark an off day |
| `GET /api/v1/analytics/weekly` | Weekly stats and daily breakdown |
| `GET/PUT /api/v1/settings/` | User settings (daily minimum) |

## License

MIT
