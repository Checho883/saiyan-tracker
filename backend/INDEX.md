# Saiyan Tracker Backend - Complete File Index

## Quick Navigation

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - Get the server running in 2 minutes
- **[README.md](README.md)** - Complete API documentation
- **[BUILD_SUMMARY.md](BUILD_SUMMARY.md)** - Technical architecture details

### Main Application Entry Point
- **[app/main.py](app/main.py)** - FastAPI application with startup seeding

## Directory Structure

### `/app/api/` - API Endpoints
Route handlers organized by resource:
- **[v1/tasks.py](app/api/v1/tasks.py)** - Task CRUD endpoints (5 endpoints)
- **[v1/categories.py](app/api/v1/categories.py)** - Category management (3 endpoints)
- **[v1/completions.py](app/api/v1/completions.py)** - Task completion (3 endpoints)
- **[v1/power.py](app/api/v1/power.py)** - Power level tracking (3 endpoints)
- **[v1/quotes.py](app/api/v1/quotes.py)** - Character quotes (3 endpoints)
- **[v1/off_days.py](app/api/v1/off_days.py)** - Off-day management (3 endpoints)
- **[v1/analytics.py](app/api/v1/analytics.py)** - Statistics (2 endpoints)
- **[v1/settings.py](app/api/v1/settings.py)** - User settings (2 endpoints)
- **[router.py](app/api/router.py)** - Main API router configuration

**Total API Endpoints: 24**

### `/app/models/` - Database Models
SQLAlchemy ORM models with relationships:
- **[user.py](app/models/user.py)** - User accounts (base entity)
- **[task.py](app/models/task.py)** - Task definitions
- **[category.py](app/models/category.py)** - Task categories with multipliers
- **[completion.py](app/models/completion.py)** - Task completion records
- **[daily_log.py](app/models/daily_log.py)** - Daily statistics and tracking
- **[streak.py](app/models/streak.py)** - Streak counter and history
- **[power_level.py](app/models/power_level.py)** - Power level history by date
- **[off_day.py](app/models/off_day.py)** - Off-day tracking
- **[achievement.py](app/models/achievement.py)** - Achievement system
- **[quote.py](app/models/quote.py)** - Character quotes database

**Total Models: 10**

### `/app/schemas/` - Request/Response Validation
Pydantic models for input validation and response formatting:
- **[task.py](app/schemas/task.py)** - TaskCreate, TaskUpdate, TaskResponse, CategoryCreate, CategoryResponse
- **[completion.py](app/schemas/completion.py)** - CompletionCreate, CompletionResponse
- **[power.py](app/schemas/power.py)** - PowerLevelResponse, PowerHistoryEntry, TransformationEvent
- **[analytics.py](app/schemas/analytics.py)** - DailyStats, CategoryBreakdown, WeeklyAnalytics, MonthlyAnalytics
- **[off_day.py](app/schemas/off_day.py)** - OffDayCreate, OffDayResponse
- **[quote.py](app/schemas/quote.py)** - QuoteResponse
- **[user.py](app/schemas/user.py)** - UserCreate, UserSettings, UserResponse

**Total Schema Models: 20+**

### `/app/services/` - Business Logic
Service classes handling complex business logic:
- **[power_service.py](app/services/power_service.py)** - Power calculations, transformations, streak management
  - `calculate_transformation()` - Determine current transformation level
  - `get_streak_bonus()` - Calculate streak bonuses
  - `get_current_power()` - Get comprehensive power data
  - `check_new_transformation()` - Check for transformation unlocks
  - `update_daily_log()` - Maintain daily statistics
  - `update_streak()` - Update streak tracking

- **[quote_service.py](app/services/quote_service.py)** - Character quote selection
  - `get_vegeta_roast()` - Get Vegeta quotes with severity levels
  - `get_goku_motivation()` - Get Goku motivational quotes
  - `get_contextual_quote()` - Select quote based on user state

- **[energy_service.py](app/services/energy_service.py)** - Task energy level matching
  - `get_tasks_by_energy()` - Match tasks to user's current energy

- **[analytics_service.py](app/services/analytics_service.py)** - Statistics and insights
  - `get_weekly()` - Weekly statistics
  - `get_category_breakdown()` - Points by category analysis
  - `get_power_history()` - Historical power level tracking

### `/app/core/` - Configuration
Application configuration and constants:
- **[config.py](app/core/config.py)** - Database URL, API prefix, base directory
- **[constants.py](app/core/constants.py)** - Game constants:
  - Category multipliers (0.5x - 1.5x)
  - Transformation thresholds (7 levels)
  - Streak bonuses (5% - 20%)
  - Energy levels
  - Daily minimum points

### `/app/database/` - Database Setup
Database connection and ORM configuration:
- **[base.py](app/database/base.py)** - SQLAlchemy DeclarativeBase
- **[session.py](app/database/session.py)** - Database engine, session factory, dependency injection

## Key Files Summary

### Configuration Files
- **requirements.txt** - 8 dependencies (FastAPI, SQLAlchemy, Pydantic, etc.)
- **.env** (optional) - Environment variables (DATABASE_URL, etc.)

### Documentation Files
- **README.md** - Comprehensive API documentation (11KB)
- **QUICKSTART.md** - Quick start guide (4KB)
- **BUILD_SUMMARY.md** - Technical summary (7KB)
- **INDEX.md** - This file - Complete file index

### Database Files
- **saiyan_tracker_test.db** - SQLite database (created on first run)

## Architecture Overview

```
FastAPI Application (main.py)
├── API Routes (app/api/)
│   ├── Tasks
│   ├── Categories
│   ├── Completions
│   ├── Power Level
│   ├── Quotes
│   ├── Off-Days
│   ├── Analytics
│   └── Settings
├── Database Layer (app/database/)
│   ├── SQLAlchemy ORM (models/)
│   ├── Session Management (session.py)
│   └── 10 Data Models (user, task, etc.)
├── Business Logic (app/services/)
│   ├── Power Calculations
│   ├── Quote Selection
│   ├── Energy Matching
│   └── Analytics
└── Data Validation (app/schemas/)
    └── Pydantic Models (20+ schemas)
```

## Feature Mapping

### Power Level System
- Configuration: `app/core/constants.py` (TRANSFORMATIONS, thresholds)
- Logic: `app/services/power_service.py` (calculate_transformation, check_new_transformation)
- Models: `app/models/power_level.py`, `app/models/achievement.py`
- Endpoints: `app/api/v1/power.py`

### Task Management
- Models: `app/models/task.py`, `app/models/category.py`
- Endpoints: `app/api/v1/tasks.py`, `app/api/v1/categories.py`
- Schemas: `app/schemas/task.py`

### Gamification
- Streaks: `app/models/streak.py`, `app/services/power_service.py` (update_streak)
- Configuration: `app/core/constants.py` (STREAK_BONUSES)
- Daily Logs: `app/models/daily_log.py`, `app/services/power_service.py` (update_daily_log)

### Character Quotes
- Database: `app/models/quote.py` (30+ quotes seeded in main.py)
- Logic: `app/services/quote_service.py`
- Endpoints: `app/api/v1/quotes.py`

### Analytics
- Models: `app/models/daily_log.py`, `app/models/power_level.py`
- Logic: `app/services/analytics_service.py`
- Endpoints: `app/api/v1/analytics.py`

## Database Schema

11 Tables:
1. **users** - User accounts
2. **tasks** - Task definitions
3. **task_categories** - Task categories with multipliers
4. **task_completions** - Completion records
5. **daily_logs** - Daily statistics
6. **streaks** - Streak tracking
7. **power_levels** - Power history
8. **off_days** - Off-day records
9. **achievements** - Achievement milestones
10. **quotes** - Character quotes (30+)

## Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Access API
http://localhost:8000/docs        # Interactive API docs
http://localhost:8000/redoc       # Alternative API docs
http://localhost:8000/            # API status
```

## File Statistics

- **Total Python Files**: 44
- **Total API Endpoints**: 24
- **Database Models**: 10
- **Data Schemas**: 20+
- **Service Methods**: 10+
- **Database Tables**: 11
- **Seeded Quotes**: 30+
- **Documentation Pages**: 3

## Next Development Areas

### Phase 2: Authentication
- `app/services/auth_service.py` - User authentication
- `app/schemas/auth.py` - Auth request/response models
- `app/api/v1/auth.py` - Authentication endpoints

### Phase 3: Advanced Features
- Task templates system
- Recurring task automation
- Leaderboard features
- Social challenges
- Notification system

## Documentation Links

- **Setup**: See [QUICKSTART.md](QUICKSTART.md)
- **API Details**: See [README.md](README.md)
- **Technical Details**: See [BUILD_SUMMARY.md](BUILD_SUMMARY.md)
- **Full Navigation**: This file ([INDEX.md](INDEX.md))

---

For questions or issues, refer to the respective documentation files.
