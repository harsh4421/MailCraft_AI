# MailCraft AI — Deployment & Live API Guide
**Student Name:** Harsh Kumar  
**Project:** MailCraft AI — AI Email Drafting and Review Assistant  

This guide provides clear, practical instructions on:
1. Connecting a live AI API (OpenAI, Google Gemini, or Groq) to replace demo mode.
2. Deploying the full-stack application (PostgreSQL + Express + React) online for free.

---

## 🔑 Part 1: Connecting a Live AI API Key

MailCraft AI features a **multi-provider AI architecture** supporting:
* **Google Gemini (`gemini-1.5-flash`):** Free tier available via Google AI Studio.
* **OpenAI (`gpt-4o-mini` / `gpt-4o`):** Standard OpenAI platform keys (`sk-...`).
* **Groq (`llama-3.3-70b-versatile`):** Ultra-fast inference with free tier available (`gsk_...`).

### How to Activate Your Key:

#### Option A: Directly in the Web UI (Recommended)
1. Open your browser and go to [http://localhost:5173/settings](http://localhost:5173/settings).
2. In the **"AI Provider API Key"** field, paste your key:
   * Google Gemini key: `AIzaSy...`
   * OpenAI key: `sk-proj-...`
   * Groq key: `gsk_...`
3. Click the **"Test & Verify API Key"** button. You will see a green badge indicating:
   `✔ Verified: Google Gemini is active!` (or OpenAI / Groq).
4. Click **"Save All Preferences"**.
5. The orange *"Demo Mode Active"* banner will immediately update to **"🟢 Live AI Active"** across the entire application!

#### Option B: In the `backend/.env` file
Open `backend/.env` and insert your key into the corresponding variable:
```env
# For OpenAI:
OPENAI_API_KEY="sk-proj-your-key-here"

# Or for Google Gemini:
GEMINI_API_KEY="AIzaSy-your-key-here"

# Or for Groq:
GROQ_API_KEY="gsk_your-key-here"
```
The server will automatically detect the key and switch from Demo Mode to Live AI.

#### 💡 Need a Free API Key?
* **Google Gemini (Free, No Credit Card):** Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and click **"Create API Key"**.
* **Groq (Free & Fast):** Visit [https://console.groq.com/keys](https://console.groq.com/keys) and generate a free API key.

---

## 🚀 Part 2: Deploying the Application Online

We have prepared automated deployment blueprints and container configurations:
1. `render.yaml` — 1-Click Render.com Blueprint (PostgreSQL + Backend + Frontend)
2. `docker-compose.yml` + `Dockerfile` — Production Docker containers
3. `frontend/vercel.json` — Vercel SPA routing configuration

---

### Method 1: Render.com (Recommended Free Full-Stack Deployment)

Render allows you to deploy the **PostgreSQL Database**, **Node.js Express Backend**, and **React Frontend** completely free using our preconfigured `render.yaml` Blueprint.

#### Step 1: Push Project to GitHub
```bash
# In the project root:
git init
git add .
git commit -m "feat: complete MailCraft AI full-stack application"
# Create a new repository on GitHub and run:
git remote add origin https://github.com/YOUR_USERNAME/mailcraft-ai.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy Blueprint on Render
1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click the **"New +"** button in the dashboard and select **"Blueprint"**.
3. Select your `mailcraft-ai` GitHub repository.
4. Render will read `render.yaml` and show:
   * Database: `mailcraft-postgres` (PostgreSQL Free)
   * Web Service: `mailcraft-backend` (Node.js)
   * Static Site: `mailcraft-frontend` (React + Vite)
5. (Optional) Under environment variables, add your `OPENAI_API_KEY` or `GEMINI_API_KEY`.
6. Click **"Apply"**.

Render will provision PostgreSQL, push the Prisma database schema, build the TypeScript code, and give you a live production URL (e.g. `https://mailcraft-frontend.onrender.com`) in 3–5 minutes!

---

### Method 2: Vercel (Frontend) + Supabase/Neon (PostgreSQL) + Render (Backend)

For industry-standard SaaS architectures:
1. **Database:** Create a free database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com). Copy the PostgreSQL connection string into `DATABASE_URL`.
2. **Backend:** Deploy `backend/` to Render or Railway using the connection string.
3. **Frontend:** Run `vercel` inside `frontend/`:
   ```bash
   cd frontend
   npx vercel
   ```

---

### Method 3: Self-Hosted Docker Deployment

Deploy on any Linux server, VPS (AWS EC2, DigitalOcean, Hetzner), or local machine with Docker:
```bash
# Build and launch all 3 containers (PostgreSQL, Backend, Frontend Nginx):
docker compose up -d --build
```
* Frontend available at: `http://localhost` (Port 80)
* Backend API available at: `http://localhost:5005`
