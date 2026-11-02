# MailCraft AI — Setup & Installation Guide
**Student Project:** MailCraft AI  
**Author:** Harsh Kumar  

This step-by-step guide will walk you through setting up and running **MailCraft AI** on your machine.

---

## 1. Prerequisites
Ensure the following tools are installed on your system:
* **Node.js:** v18.0.0 or later (`node -v`)
* **npm:** v9.0.0 or later (`npm -v`)
* **PostgreSQL:** Version 14, 15, 16, or 18 running locally (`psql --version`)
* **Git:** For cloning or managing repository versions

---

## 2. PostgreSQL Database Setup
1. Verify PostgreSQL is active:
   ```bash
   # On macOS using Homebrew:
   brew services list
   # Or test with pg_isready:
   pg_isready
   ```

2. Create the project database `mailcraft_db`:
   ```bash
   psql -U $(whoami) -d postgres -c "CREATE DATABASE mailcraft_db;"
   ```
   *(If your PostgreSQL user has a password, add `-W` or adjust credentials in `.env`)*.

---

## 3. Clone / Open the Project Repository
```bash
cd "/Users/harshkumar/Desktop/ITM Files/Sem 3/Sprint 2/Ai Tools/Mini Project"
```

---

## 4. Environment Variables Configuration

### Backend Environment Configuration
Check or create `backend/.env`:
```env
PORT=5005
NODE_ENV=development
DATABASE_URL="postgresql://harshkumar@localhost:5432/mailcraft_db"
JWT_SECRET="mailcraft_super_secret_jwt_key_2026_harsh_kumar_project"
OPENAI_API_KEY=""
CLIENT_URL="http://localhost:5173"
```
> [!NOTE]
> `OPENAI_API_KEY` is completely optional. If left blank or invalid, MailCraft AI automatically runs in its intelligent local **Deterministic NLP Demo Engine** with zero setup!

---

## 5. Install Dependencies
Install dependencies for root, backend, and frontend:
```bash
npm run install:all
```
Or individually:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

---

## 6. Run Database Migrations
Synchronize your PostgreSQL database with the Prisma schema:
```bash
cd backend
npx prisma db push
npx prisma generate
cd ..
```
This generates the Prisma Client and verifies all tables (`User`, `UserSettings`, `EmailGeneration`, `EmailDraft`, `EmailReview`) are ready.

---

## 7. Run the Application
Start both the Backend API and Frontend Vite server concurrently with a single command:
```bash
npm run dev
```

### Server URLs:
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend API Health:** [http://localhost:5005/api/health](http://localhost:5005/api/health)

---

## 8. Logging In & Quick Evaluation
1. Open your browser and navigate to [http://localhost:5173](http://localhost:5173).
2. Click **"Start Writing"** or **"Sign In"**.
3. On the Login page, click **"1-Click Quick Demo Sign In"** to immediately sign into a preconfigured demo account.
4. Try drafting an email with the preset buttons (e.g. "Leave Request") and reviewing an unpolished email (e.g. "Casual Slang Email").

---

## 9. Troubleshooting

### Port 5005 or 5173 Already in Use
If either port is occupied by another process:
```bash
# Check PID occupying port
lsof -i :5005
lsof -i :5173

# Terminate process if needed
kill -9 <PID>
```

### PostgreSQL Connection Error
If you receive `P1001: Can't reach database server`:
1. Verify PostgreSQL service is running: `brew services start postgresql@18` (or your installed version).
2. Test connection with `psql -U $(whoami) -d mailcraft_db`.
3. Check that the username in `DATABASE_URL` matches your local PostgreSQL username.
