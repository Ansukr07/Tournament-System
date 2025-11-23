# 📘 **CourtFlow – Tournament Management System**

---

## 🎥 **Demo (Must-See First)**

👉 [https://drive.google.com/file/d/1pMMS2Oezzi9IuS900d02C9Azqua7uQ4Z/view?usp=sharing](https://drive.google.com/file/d/1pMMS2Oezzi9IuS900d02C9Azqua7uQ4Z/view?usp=sharing)

---

## 🚀 1. Overview

CourtFlow is a smart tournament automation system that eliminates manual fixture creation, prevents scheduling conflicts, and updates results in real time. Designed for colleges, clubs, and hackathons, it ensures fairness, efficiency, and complete transparency.

### **Key Features**

* Knockout & Round Robin fixtures
* Same-club avoidance & seeding
* Multi-court scheduling with rest buffers
* Secure match-code scoring for umpires
* Live bracket & leaderboard via Socket.IO
* **Advanced event filtering** with search, type, and category filters

### **Event Filtering System**

The events page includes a comprehensive filtering system to help users quickly find tournaments:

* **🔍 Search Bar** - Search events by name or category in real-time
* **🏆 Tournament Type Filter** - Filter by Knockout or Round Robin tournaments
* **📋 Category Filter** - Dropdown showing all unique event categories
* **🔄 Clear Filters** - One-click button to reset all active filters
* **📊 Results Counter** - Live count showing "X of Y events" matching your filters
* **💬 Smart No-Results** - Helpful messages when no events match the criteria

### **Tech Stack**

* Frontend: Next.js + Tailwind CSS
* Backend: Node.js + Express.js
* Database: MongoDB
* Real-Time: Socket.IO
* Language: TypeScript

---

## 🧩 2. System Architecture

```
Frontend (Next.js)
      │ REST + WebSockets
Backend (Express + Socket.IO)
      │
MongoDB (Database)
```

**Workflow**

1. Frontend triggers API request
2. Backend handles logic → MongoDB
3. Socket.IO sends real-time updates
4. UI updates instantly (no reload needed)

---

## 📁 Project Structure

```
Tournament-System/
├── frontend/           # Next.js Frontend
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── lib/          # Utilities & API client
│   ├── public/       # Static assets
│   └── package.json
│
├── backend/          # Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── package.json
│
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
```bash
cd backend
npm install
# Create .env file with MONGODB_URI and JWT_SECRET
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000` and backend on `http://localhost:5000`.

---

## ⚙️ 3. Core Modules

### **A. Fixture Engine**

**Knockout**

* Seeding + bracket expansion
* BYE assignment
* Same-club avoidance logic
* Winner placeholders for next rounds

**Round Robin**

* Circle method
* BYE for odd teams
* Every team plays each other once

---

### **B. Scheduling Engine**

* Earliest-Fit court assignment
* Prevents overlapping matches
* Enforces rest buffers
* Maximizes court utilization

---

### **C. Match-Code Security**

* Generate secure 6-character code
* Hash stored in DB
* Umpire must enter code to submit results
* Code invalid after completion

---

### **D. Live Leaderboard**

* Tracks wins, points, standings
* Auto-updates using Socket.IO

---

## 🗄️ 4. Database Models (Short)

### **Event**

`name, type, courts[], matchDuration, bufferMinutes`

### **Team**

`teamName, clubName, members[], events[]`

### **Match**

`participants[], round, matchNumber, nextMatchId, winnerId, startTime, endTime`

### **Stats**

`played, won, lost, points`

---

## 🔌 5. Key API Endpoints

| Method | Endpoint                            | Description             |
| ------ | ----------------------------------- | ----------------------- |
| GET    | `/api/events`                       | List events             |
| POST   | `/api/events`                       | Create event            |
| POST   | `/api/events/:id/generate-fixtures` | Generate fixtures       |
| POST   | `/api/events/:id/schedule`          | Schedule matches        |
| POST   | `/api/teams/register`               | Register team           |
| POST   | `/api/matches/:id/submit-score`     | Submit result with code |
| GET    | `/api/events/:id/leaderboard`       | Standings               |

---

## 🏁 6. Tournament Flow (Short)

1. Admin creates event
2. Teams register
3. Fixtures generated
4. Courts & timings scheduled
5. Tournament goes live
6. Umpires enter match-code to submit results
7. Winners advance
8. Leaderboard updates
9. Tournament finishes

---
