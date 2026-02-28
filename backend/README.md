# Saiyan Tracker API

A powerful FastAPI backend for the Saiyan Tracker app - your personal power-level tracker powered by Dragon Ball Z inspiration!

## Overview

The Saiyan Tracker API is a comprehensive task management and gamification system that leverages Dragon Ball Z themes and character quotes to motivate users to complete daily tasks and track their "power level" progress.

### Key Features

- **Power Level System**: Accumulate points across tasks to reach transformation levels (Base Form → Super Saiyan → Ultra Instinct)
- **Task Management**: Create, organize, and complete tasks with category-based point multipliers
- **Streak Tracking**: Maintain daily streaks and earn bonuses for consistency
- **Character Quotes**: Get motivational quotes from Goku or savage roasts from Vegeta based on your performance
- **Analytics**: Track weekly/monthly progress with detailed breakdowns by category
- **Off-Days**: Manage rest days without breaking your streak
- **Achievement System**: Unlock transformation achievements as you progress

## Technology Stack

- **Framework**: FastAPI 0.115.0
- **Database**: SQLAlchemy 2.0.35 with SQLite
- **Server**: Uvicorn 0.30.0
- **Validation**: Pydantic 2.9.0
- **ORM**: SQLAlchemy with async support

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── router.py          # API router configuration
│   │   └── v1/
│   │       ├── tasks.py        # Task CRUD endpoints
│   │       ├── categories.py   # Category management
│   │       ├── completions.py  # Task completion endpoints
│   │       ├── power.py        # Power level and transformation endpoints
│   │       ├── quotes.py       # Character quote endpoints
│   │       ├── off_days.py     # Off-day management
│   │       ├── analytics.py    # Analytics and statistics
│   │       └── settings.py     # User settings
│   ├── core/
│   │   ├── config.py           # Configuration management
│   │   └── constants.py        # Game constants and thresholds
│   ├── database/
│   │   ├── base.py            # SQLAlchemy base declarative
│   │   └── session.py         # Database session management
│   ├── models/
│   │   ├── user.py            # User model
│   │   ├── task.py            # Task model
│   │   ├── category.py        # Task category model
│   │   ├── completion.py      # Task completion model
│   │   ├── daily_log.py       # Daily log model
│   │   ├── streak.py          # Streak tracking model
│   │   ├── power_level.py     # Power level history model
│   │   ├── off_day.py         # Off-day model
│   │   ├── achievement.py     # Achievement model
│   │   └── quote.py           # Quote model
│   ├── schemas/
│   │   ├── task.py            # Task Pydantic schemas
│   │   ├── completion.py      # Completion schemas
│   │   ├── power.py           # Power level schemas
│   │   ├── analytics.py       # Analytics schemas
│   │   ├── off_day.py         # Off-day schemas
│   │   ├── quote.py           # Quote schemas
│   │   └── user.py            # User schemas
│   └── services/
│       ├── power_service.py    # Power level calculations
│       ├── quote_service.py    # Quote selection logic
│       ├── energy_service.py   # Task energy level matching
│       └── analytics_service.py # Analytics calculations
├── requirements.txt             # Python dependencies
└── README.md                   # This file
```

## Installation

### Prerequisites
- Python 3.10+
- pip

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
python3 -m pip install -r requirements.txt
```

## Running the Server

### Development Mode
```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Core Concepts

### Power Levels & Transformations

Users accumulate power points through task completion. Each transformation requires a specific threshold:

| Transformation | Threshold | Status |
|---|---|---|
| Base Form | 0 | Always unlocked |
| Super Saiyan | 500 | Unlock at 500 points |
| Super Saiyan 2 | 1,500 | Unlock at 1,500 points |
| Super Saiyan 3 | 3,500 | Unlock at 3,500 points |
| Super Saiyan God | 7,000 | Unlock at 7,000 points |
| Super Saiyan Blue | 12,000 | Unlock at 12,000 points |
| Ultra Instinct | 20,000 | Unlock at 20,000 points |

### Category Multipliers

Points are multiplied based on task category:

- **Side Business**: 1.5x (highest impact)
- **Work**: 1.0x (standard)
- **Personal**: 0.7x (moderate)
- **Recreational**: 0.5x (lowest impact)

### Streak Bonuses

Maintain daily streaks to earn point bonuses:

- 7 days: +5% bonus
- 14 days: +8% bonus
- 30 days: +10% bonus
- 60 days: +15% bonus
- 90 days: +20% bonus

## API Endpoints

### Root
- `GET /` - API status and version

### Tasks
- `GET /api/v1/tasks/` - List all active tasks
- `GET /api/v1/tasks/{task_id}` - Get specific task
- `POST /api/v1/tasks/` - Create new task
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Deactivate task

### Categories
- `GET /api/v1/categories/` - List all categories
- `POST /api/v1/categories/` - Create new category
- `PUT /api/v1/categories/{category_id}` - Update category

### Task Completions
- `POST /api/v1/completions/` - Complete a task
- `GET /api/v1/completions/today` - Get today's completions
- `DELETE /api/v1/completions/{completion_id}` - Undo completion

### Power Level
- `GET /api/v1/power/current` - Get current power level status
- `GET /api/v1/power/transformations` - Get all transformations and their status
- `GET /api/v1/power/history?days=30` - Get power level history

### Quotes
- `GET /api/v1/quotes/vegeta/roast?missed_days=1` - Get Vegeta roast quote
- `GET /api/v1/quotes/goku/motivation?context=motivation` - Get Goku motivation quote
- `GET /api/v1/quotes/contextual` - Get contextual quote based on user state

### Off-Days
- `GET /api/v1/off-days/` - List off-days
- `POST /api/v1/off-days/` - Create off-day
- `DELETE /api/v1/off-days/{off_day_id}` - Remove off-day

### Analytics
- `GET /api/v1/analytics/weekly` - Get weekly statistics
- `GET /api/v1/analytics/category-breakdown?days=30` - Get category breakdown

### Settings
- `GET /api/v1/settings/` - Get user settings
- `PUT /api/v1/settings/` - Update user settings

## Example Usage

### Create a Task
```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "category-uuid",
    "title": "Complete report",
    "description": "Finish quarterly report",
    "base_points": 50,
    "energy_level": "high",
    "estimated_minutes": 120
  }'
```

### Complete a Task
```bash
curl -X POST http://localhost:8000/api/v1/completions/ \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task-uuid",
    "energy_at_completion": "high",
    "notes": "Completed efficiently"
  }'
```

### Check Power Level
```bash
curl http://localhost:8000/api/v1/power/current | python3 -m json.tool
```

## Database

The application uses SQLite for persistence. By default, the database is created at:
```
/tmp/saiyan_tracker_test.db
```

To use a different database location, set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="sqlite:////path/to/saiyan_tracker.db"
```

## Features in Development

The current implementation includes:

✓ Core task and category management
✓ Power level tracking and transformations
✓ Streak tracking and bonuses
✓ Daily logging and analytics
✓ Character quotes system
✓ Off-day management
✓ Achievement tracking
✓ Settings management

### Future Enhancements (Phase 2+)

- User authentication and authorization
- Multi-user support with individual profiles
- Advanced analytics and data visualization
- Task templates and recurring task automation
- Social features (leaderboards, challenges)
- Mobile app integration
- Email/push notifications
- Import/export functionality

## Error Handling

The API implements comprehensive error handling:

- **400 Bad Request**: Invalid input or duplicate entries
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side issues

All errors include descriptive messages for debugging.

## Testing

Run the comprehensive test suite:
```bash
python3 /path/to/comprehensive_test.py
```

This tests:
- API initialization
- Task creation and management
- Power level calculations
- Transformation tracking
- Quote generation
- Analytics
- Settings management

## Configuration

### Environment Variables

- `DATABASE_URL`: SQLite database path (default: `/tmp/saiyan_tracker_test.db`)

### Application Constants

Edit `app/core/constants.py` to modify:
- Transformation thresholds
- Category multipliers
- Streak bonuses
- Daily minimum points
- Quote severity levels

## Architecture Highlights

### Service Layer
- **PowerService**: Handles power level calculations, transformations, and streaks
- **QuoteService**: Manages character quote selection based on context
- **AnalyticsService**: Computes statistics and insights
- **EnergyService**: Matches tasks to user energy levels

### Database Design
- Efficient relationships with SQLAlchemy ORM
- Optimized queries for analytics calculations
- Support for daily logging and historical tracking

### API Design
- RESTful endpoints following standard conventions
- Comprehensive Pydantic validation
- Async-ready with FastAPI
- CORS enabled for frontend integration

## Performance Considerations

- In-memory calculations for power levels
- Indexed database queries for large datasets
- Efficient category and task lookups
- Minimal database transactions per operation

## Security Notes

Currently uses a default user for demo purposes. Phase 2 will include:
- User authentication (JWT tokens)
- Role-based access control
- Data validation and sanitization
- Rate limiting
- HTTPS enforcement in production

## License

This project is part of the Saiyan Tracker application suite.

## Support

For issues or questions, refer to the main project documentation or create an issue in the repository.

---

**Remember**: Your power level is determined by your consistency, not your strength! Keep training!
