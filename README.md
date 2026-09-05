# ⚡ QuestLog — Gamified Task & Streak Manager

A full-stack Progressive Web App for students and working professionals.
Track habits, build streaks, earn XP, level up, and never miss a reminder.

---

## 🚀 Quick Start (2 Steps)

### Step 1: Start the Backend API
Double-click → `start-backend.bat`
Or run in terminal:
```bash
cd backend
# Windows (with Maven at D:\maven):
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%PATH%;D:\maven\apache-maven-3.9.6\bin
mvn spring-boot:run
```
Backend runs on: **http://localhost:8080**

### Step 2: Start the Frontend
Double-click → `start-frontend.bat`
Or run in terminal:
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

---

## 📁 Project Structure

```
dailywork/
├── backend/                  # Spring Boot 3 Java API
│   ├── src/main/java/com/questlog/
│   │   ├── entity/           # JPA Entities (User, MandatoryRoutine, AdhocTask)
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── service/          # Business logic (Streak engine, Gamification, XP)
│   │   ├── controller/       # REST API Controllers
│   │   ├── dto/              # Request/Response DTOs
│   │   └── config/           # CORS configuration
│   └── src/main/resources/
│       └── application.properties  # H2 DB config
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── api/api.js        # Axios API client
│   │   ├── pages/            # OnboardingPage, DashboardPage
│   │   ├── components/       # Header, DateNavBar, DailyCoreRoutines,
│   │   │                       AdHocTasksPanel, AddTaskModal, WeeklyView,
│   │   │                       ConfettiOverlay, GoalBanner, Toast
│   │   └── index.css         # Full dark-mode design system
│   └── public/sw.js          # Service Worker (push notifications)
│
├── start-backend.bat         # One-click backend launcher
├── start-frontend.bat        # One-click frontend launcher
└── README.md
```

---

## 🔑 Key REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user with goal |
| GET | `/api/dashboard?userId=1&date=YYYY-MM-DD` | Full dashboard for any date |
| POST | `/api/routines` | Add a mandatory routine with time slot |
| POST | `/api/routines/{id}/toggle?date=YYYY-MM-DD` | Toggle habit & update streak |
| POST | `/api/tasks/adhoc` | Schedule a sudden ad-hoc task |
| PUT | `/api/tasks/adhoc/{id}/toggle` | Complete a task (grants bonus XP) |
| DELETE | `/api/tasks/adhoc/{id}` | Delete a task |

---

## 🎮 Gamification Logic

- **Streak Rule**: If `last_completed_date == yesterday` → streak continues. If missed → streak resets on next completion.
- **Ad-hoc tasks**: Completing grants bonus XP. Missing one NEVER breaks the mandatory habit streak.
- **XP Formula**: Habit completion = `50 + (streak × 5) XP`. Level formula = `100 × level^1.5 XP`.
- **Level Titles**: Novice → Apprentice → Practitioner → Specialist → Expert → Master → Tech Knight → Architect → Sage → Legend

---

## 🔔 Browser Notifications

The app uses the Web Notifications API + Service Worker to send reminders.
On first launch, grant notification permission when the browser asks.

---

## 🗄️ Database

Uses **H2 in-memory** database for instant zero-config local dev.
Access the DB browser at: **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:mem:questlogdb`
- Username: `sa` | Password: *(blank)*

To switch to PostgreSQL: update `application.properties` with your PostgreSQL credentials.
