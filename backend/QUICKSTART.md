# Saiyan Tracker Backend - Quick Start Guide

Get the API running in 2 minutes!

## Installation

```bash
cd /sessions/lucid-inspiring-johnson/mnt/Sergio_Dev/Apps/saiyan-tracker/backend
python3 -m pip install -r requirements.txt --break-system-packages
```

## Run the Server

```bash
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

## Access the API

### Interactive Docs (Recommended)
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Test Endpoints

```bash
# Get API status
curl http://localhost:8000/

# Get categories
curl http://localhost:8000/api/v1/categories/

# Get power level
curl http://localhost:8000/api/v1/power/current | python3 -m json.tool

# Create a task
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "CATEGORY_ID_HERE",
    "title": "My Task",
    "base_points": 50,
    "energy_level": "high"
  }'

# Complete a task
curl -X POST http://localhost:8000/api/v1/completions/ \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "TASK_ID_HERE",
    "energy_at_completion": "high"
  }'
```

## Default User Data

When the server starts, it automatically creates:

**User**: Sergio (sergio@saiyantracker.com)

**Categories**:
- Side Business (1.5x multiplier)
- Work (1.0x multiplier)
- Personal (0.7x multiplier)
- Recreational (0.5x multiplier)

## Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/tasks/` | List tasks |
| POST | `/api/v1/tasks/` | Create task |
| POST | `/api/v1/completions/` | Complete task |
| GET | `/api/v1/power/current` | Check power level |
| GET | `/api/v1/transformations` | View all transformations |
| GET | `/api/v1/quotes/contextual` | Get quote |
| GET | `/api/v1/analytics/weekly` | Weekly stats |

## Example Workflow

1. **Get a category ID**:
```bash
curl http://localhost:8000/api/v1/categories/ | python3 -m json.tool
```

2. **Create a task** (replace CATEGORY_ID):
```bash
curl -X POST http://localhost:8000/api/v1/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "CATEGORY_ID",
    "title": "Complete Project",
    "base_points": 50,
    "energy_level": "high"
  }'
```

3. **Complete the task** (replace TASK_ID):
```bash
curl -X POST http://localhost:8000/api/v1/completions/ \
  -H "Content-Type: application/json" \
  -d '{"task_id": "TASK_ID"}'
```

4. **Check power level**:
```bash
curl http://localhost:8000/api/v1/power/current | python3 -m json.tool
```

5. **Get motivated**:
```bash
curl http://localhost:8000/api/v1/quotes/contextual | python3 -m json.tool
```

## File Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI app entry
│   ├── api/v1/           # API endpoints
│   ├── models/           # Database models
│   ├── schemas/          # Request/response schemas
│   ├── services/         # Business logic
│   ├── core/             # Configuration
│   └── database/         # Database setup
├── requirements.txt      # Dependencies
├── README.md            # Full documentation
└── QUICKSTART.md        # This file
```

## Troubleshooting

### Port already in use
```bash
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Database errors
Delete the database file and restart:
```bash
rm /tmp/saiyan_tracker_test.db*
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Module not found
Reinstall dependencies:
```bash
python3 -m pip install -r requirements.txt --force-reinstall --break-system-packages
```

## Next Steps

1. Read `README.md` for complete API documentation
2. Explore endpoints in Swagger UI (`/docs`)
3. Connect frontend at http://localhost:5173
4. Check `BUILD_SUMMARY.md` for technical details

## Need Help?

- Check `README.md` for detailed documentation
- Look at `BUILD_SUMMARY.md` for architecture details
- Review endpoint examples in Swagger UI

---

Happy training! Your power level is over 9000! Over 9000!
