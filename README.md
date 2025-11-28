# Smart Task Analyzer

A web-based tool to help students and developers prioritize and analyze tasks using a custom scoring algorithm.

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Django REST Framework (Python)

---

## 1. Setup Instructions

### Prerequisites

- Python 3.8+  
- pip  
- Git (for cloning / committing)

### 1.1. Clone and install dependencies


### 1.2. Run Django backend

From the backend project root (folder containing `manage.py`):


Backend runs at:

- `http://127.0.0.1:8000/`

### 1.3. Run frontend

From the folder that contains `index.html`:


Frontend runs at:

- `http://localhost:8080/index.html`

### 1.4. API Endpoints

#### `POST /api/tasks/analyze/`

Accepts a list of tasks and a strategy, and returns them sorted by priority:


Each task in the response includes `score` and `explanation`.

#### `GET /api/tasks/suggest/`

Returns the top 3 tasks the user should work on “today”, with explanation fields.

---

## 2. Features

- Add individual tasks with:
  - Title  
  - Due date  
  - Estimated hours  
  - Importance (1–10)  
  - Optional dependencies
- Bulk JSON input for analyzing multiple tasks at once.
- **Analyze Tasks**: sends tasks to the backend and shows them sorted by priority.
- **Show Top 3 Suggestions**: fetches suggested tasks from the backend.
- Multiple sorting strategies:
  - Fastest Wins  
  - High Impact  
  - Deadline Driven  
  - Smart Balance (default)
- Responsive UI with animated loading states and error banners.
- Clear explanations under each task card describing why it got its score.

---


Each task in the response includes `score` and `explanation`.

#### `GET /api/tasks/suggest/`

Returns the top 3 tasks the user should work on “today”, with explanation fields.

---

## 2. Features

- Add individual tasks with:
  - Title  
  - Due date  
  - Estimated hours  
  - Importance (1–10)  
  - Optional dependencies
- Bulk JSON input for analyzing multiple tasks at once.
- **Analyze Tasks**: sends tasks to the backend and shows them sorted by priority.
- **Show Top 3 Suggestions**: fetches suggested tasks from the backend.
- Multiple sorting strategies:
  - Fastest Wins  
  - High Impact  
  - Deadline Driven  
  - Smart Balance (default)
- Responsive UI with animated loading states and error banners.
- Clear explanations under each task card describing why it got its score.

---

## 3. Algorithm Explanation

The Smart Task Analyzer assigns each task a numeric priority score that balances urgency, importance, effort, and dependencies. The goal is to rank tasks by “impact per unit of time” while still respecting deadlines and prerequisite relationships.

Each task includes a title, due date, estimated hours, importance (1–10), and an optional list of dependencies. The backend first validates and normalizes this data. If a field is missing or invalid (for example, an unparsable date or a non-numeric effort), the system falls back to safe defaults so that a single bad task never breaks the whole analysis.

**Urgency** is computed from how close the due date is to the current date. Tasks due in the past or very soon receive a higher urgency contribution than tasks due far in the future. Overdue items are treated as highly urgent but capped so they do not permanently dominate every result. Internally, this becomes an `UrgencyValue` bucketed by how many days remain until the deadline.

**Importance** is provided by the user on a 1–10 scale. To emphasize this dimension, the algorithm multiplies importance by 1.5. This means that, all else being equal, highly important tasks jump above less important ones, even when their deadlines are similar.

**Effort** is treated as a cost. Quick tasks are favored because they produce visible progress with minimal time. The algorithm computes an effort term as `(10 - estimated_hours)`, so smaller estimates add positive points and large estimates reduce the total score.

**Dependencies** act as a penalty so that heavily blocked tasks do not always rise to the top. Each dependency subtracts 2 points from the score. This encourages users to complete independent tasks or key blockers before tackling deeply dependent work. Cycles are guarded against by limiting traversal depth and treating suspicious chains conservatively, but full graph visualization is left for future work.

The simplified final score used in the “Smart Balance” strategy is:

`Score = (Importance * 1.5) + (10 - Effort) + UrgencyValue - (Dependencies * 2)`

Higher scores mean higher priority. Other strategies reuse the same inputs but shift weights: “Fastest Wins” heavily rewards low effort, “High Impact” leans more on importance, and “Deadline Driven” puts urgency first. This design keeps the logic transparent and easy to tune while still demonstrating thoughtful trade‑offs.

---

## 4. Design Decisions & Trade‑offs

1. **Simple, transparent scoring**  
   The scoring formula is linear and readable instead of using complex heuristics or ML. This makes the behavior easy to explain in the UI and straightforward to adjust later.

2. **Backend‑centric algorithm**  
   All scores are computed on the Django side (`scoring.py`). The frontend simply displays results. This avoids duplication and ensures there is a single source of truth.

3. **Multiple strategies via weights**  
   Rather than writing four completely different algorithms, the backend reuses the same core scoring function with different weights for urgency, importance, and effort. This keeps the code DRY and easy to extend.

4. **Stateless demo**  
   Tasks are sent from the frontend instead of being stored per user. This keeps setup light for reviewers (no login or seed data required) and focuses the assignment on algorithm and integration rather than persistence.

5. **Error UX**  
   When an API call fails, an animated error message
