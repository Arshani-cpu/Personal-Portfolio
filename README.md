# Arshani D — Personal Portfolio Website (Full-Stack)

A modern, responsive, full-stack personal portfolio application built for **Arshani D** (2nd Year Computer Science Student | AI/ML Enthusiast | Full Stack Developer at Easwari Engineering College).

---

## 🌟 Key Features

1. **Frontend**:
   - Built with **HTML5, Vanilla CSS3**, and **JavaScript**.
   - **Dark Glassmorphism Theme** with neon Cyan/Emerald/Violet accents and smooth animations.
   - **Interactive About Me Tabs**: Easily switch between **Skills**, **Experience**, and **Education**.
   - **Filterable Projects Showcase**: Filter by category (All, AI & Web, Sustainability, Web Apps) with interactive modal popups for project details.
   - **Credentials & Badges**: Harvard CS50, Cisco, MongoDB, NPTEL, Wadhwani Foundation, and Google Courses.
   - **Mobile Friendly**: Touch-optimized sliding menu drawer, touch targets (≥ 44px), responsive flex/grid design, and scaling typography.
   - **Instagram QR Code Integration**: Direct card link to `@arsh_pixie`.

2. **Backend**:
   - Built with **Node.js** and **Express.js**.
   - RESTful API endpoints:
     - `GET /api/profile` — Profile data, education, skills & experience.
     - `GET /api/projects` — Filterable projects list.
     - `GET /api/projects/:id` — Detailed project info for modal popups.
     - `POST /api/projects` — Admin database endpoint to add new projects.
     - `GET /api/certifications` — Credentials and certifications.
     - `POST /api/contact` — Saves contact messages directly into database.

3. **Database**:
   - **Dual-Mode Engine**: Supports **MongoDB Atlas** via `mongoose` (when `MONGO_URI` is set in `.env`) AND zero-config local data engine (`data/portfolio.json` & `data/messages.json`) for instant local execution out of the box!

4. **Deployment Ready**:
   - Configured for one-click deployment on **Vercel** (`vercel.json`), **Netlify**, or **Heroku** (`Procfile`).

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
cmd.exe /c "npm install"
```

### 2. Start the Server
```bash
cmd.exe /c "npm start"
```

Open your browser and navigate to:
**http://localhost:3000**

---

## ☁️ Deployment Instructions

### Deploy on Vercel
1. Install Vercel CLI or connect your GitHub repository to [Vercel](https://vercel.com).
2. Run `vercel` in the project root.
3. Add Environment Variable (Optional): `MONGO_URI`.

### Deploy on Heroku / Render / Railway
1. Push repository to GitHub.
2. Connect repository to Heroku/Render.
3. The included `Procfile` will automatically execute `node server.js`.
