# MailCraft AI — AI Email Drafting & Review Assistant
> **"Every Email, Written Better."**
> A production-grade AI-powered communication suite developed by **Harsh Kumar**.

---

## 👨‍🎓 Student & Project Information
* **Student Name:** Harsh Kumar
* **Project Name:** MailCraft AI
* **Project Category:** Professional Productivity
* **Project Topic:** AI Email Drafting and Review Assistant
* **Course:** ITM Semester 3 — Sprint 2 — AI Tools Mini Project
* **Official Practical Task:**
  1. Draft professional emails based on recipient, purpose, context, and tone.
  2. Review existing emails based on grammar, professionalism, context, clarity, and tone.
* **Expected Output:** Reviewed professional email with detailed multi-dimensional score analysis.

---

## 🌟 Executive Summary & Features
**MailCraft AI** solves blank-page anxiety and embarrassing email mistakes for students, job applicants, and professionals. Unlike basic AI wrappers, MailCraft AI features a **dual-engine architecture** (built-in local Deterministic NLP Engine + optional OpenAI GPT-4o-mini integration) backed by PostgreSQL and Prisma ORM.

### 1. ✍️ AI Email Drafting Workspace (`/draft`)
* **Recipient Hierarchy:** Tailored greetings and structure for Professor, Manager, HR, Client, Colleague, Customer, Friend, or Custom recipient.
* **Intent/Purpose Matrix:** Leave request, Assignment extension, Job application, Meeting request, Follow-up, Apology, Complaint, Business proposal, or Custom purpose.
* **Context Preservation:** Ingests situational background, deadlines, and constraints without fabricating facts.
* **Tone & Length Customization:** Professional, Formal, Friendly, Persuasive, Apologetic, Confident, or Neutral across Short, Medium, and Detailed lengths.
* **Configurable Sender Name:** Default configurable from user profile (e.g. *Harsh Kumar*).
* **Live Inline Editing & Refinements:**
  * One-click "Make Shorter", "Make Longer", "Elevate Professionalism", "Friendly Tone", "Formal Tone".
  * Direct inline editing of subject line, salutation, body paragraphs, and closing.
  * Direct "Save to Saved Drafts" (PostgreSQL) and "Download as TXT".

### 2. 🔍 AI Email Review Workspace (`/review`)
* **5-Dimensional Email Audit:**
  1. **Grammar & Spelling (25%):** Detects punctuation, contractions, typos, and sentence structure issues.
  2. **Corporate Professionalism (25%):** Identifies informal slang (*gonna, wanna, asap, thx, hey prof*), salutation/closing appropriateness, and executive tone.
  3. **Context & Completeness (20%):** Flags missing deadline details or unaddressed objectives.
  4. **Tone Alignment (15%):** Compares detected tone vs. requested target tone.
  5. **Clarity & Readability (15%):** Detects run-on sentences and confusing compound structures.
* **Honest Scoring (0-100):** Visualized with an animated circular score gauge and progress bars.
* **Mistake Itemization:** Every issue displays the exact original substring, explanation, severity badge, and recommended replacement.
* **Interactive Accept / Reject:** Toggle individual recommendations directly in the rewritten output.
* **Side-by-Side Diff Comparison:** Compare original input vs. polished output.

### 3. 📊 Real-Time Analytics Dashboard (`/dashboard`)
* Welcome greeting personalized to the user.
* Live usage metrics computed from PostgreSQL: total generations, total reviews, saved drafts count, and average writing quality index.
* Category breakdown gauges for Grammar, Professionalism, and Clarity.
* Recent saved drafts and recent audit logs with quick access shortcuts.

### 4. 🗃️ Saved Drafts & History (`/drafts`, `/history`)
* Full-text search and category filtering by recipient and purpose.
* Pin important drafts to the top of the workspace.
* One-click "Load in Workspace" to reuse previous email parameters.
* Deletion with confirmation modals and strict user-level data isolation.

### 5. ⚙️ Preferences & Dual-Engine AI Architecture (`/settings`)
* **Zero-Setup Demo Engine:** Operates without requiring any external API keys or cloud dependencies.
* **Optional OpenAI Integration:** Users can configure custom API keys securely stored in PostgreSQL.
* Light & Dark themes with glassmorphism and modern typography.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, REST Architecture, Zod Validation |
| **Database** | PostgreSQL, Prisma ORM (v6.19.3) |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing, CORS, input sanitization |
| **AI Integration** | Dual-Engine: Local Deterministic NLP Engine + OpenAI GPT-4o-mini |
| **Testing** | Jest, Supertest, automated integration suite |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js:** v18+ (tested on Node v24.15.0)
* **npm:** v9+
* **PostgreSQL:** Running locally on port 5432 (e.g. `mailcraft_db`)

### 1. Database Setup
```bash
# Connect to PostgreSQL and create the database
psql -U $(whoami) -d postgres -c "CREATE DATABASE mailcraft_db;"
```

### 2. Install Dependencies
```bash
# Install root orchestration, backend, and frontend packages
npm run install:all
```

### 3. Run Prisma Migrations
```bash
cd backend
npx prisma db push
npx prisma generate
cd ..
```

### 4. Run Both Servers Concurrently
```bash
# Starts Backend (port 5005) and Frontend (port 5173) concurrently
npm run dev
```

* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend REST API:** [http://localhost:5005/api/health](http://localhost:5005/api/health)

---

## 🔑 Authentication & Demo Mode
* **1-Click Quick Demo Sign In:** On the Login page (`/login`), click the **"1-Click Quick Demo Sign In"** button to automatically create or log in to a demo account (`demo_user@mailcraft.ai`).
* **Manual Registration:** Create an account with any email, full name, and password (min. 6 characters).
* **Demo Mode Status:** Clearly marked with a banner across the application. When no OpenAI API key is set, the local Deterministic NLP engine executes with 100% reliability.

---

## 🧪 Automated Testing
Run the backend integration test suite:
```bash
npm test
```
All **17 integration tests** verify:
* API health check & author attribution (`Harsh Kumar`)
* User registration, password hashing, and login validation
* JWT authentication and route guard protection
* Email drafting and refinement operations
* Email review analysis, mistake detection, and score calculation
* Database persistence, pagination, search, update, and deletion

---

## 📸 Application Screenshots & Key Views
1. **Landing Page (`/`):** Hero headline *"Every Email, Written Better."*, student badge, interactive preview tabs.
2. **Dashboard (`/dashboard`):** Real DB statistics, circular quality score gauge, recent activity.
3. **Drafting Workspace (`/draft`):** Multi-parameter form, live inline editor, tone/length buttons, export.
4. **Review Workspace (`/review`):** 5-dimensional audit, accept/reject toggles, side-by-side comparison.
5. **Saved Drafts (`/drafts`):** Pinned cards, full-text search, load-into-workspace.
6. **About Page (`/about`):** Harsh Kumar academic project documentation and specifications.

---

## 📄 License & Credits
Developed by **Harsh Kumar** for ITM Semester 3 AI Tools Mini Project.
