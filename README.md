📊 Expense Tracker with Budget Planner

A modern React + Supabase application that helps users track daily expenses, set budgets, and visualize spending patterns with smooth animations and a clean UI.

🚀 Features

🔐 Authentication – Secure login/signup powered by Supabase Auth.

💸 Expense Management – Add, edit, delete, and categorize expenses.

📅 Budget Planner – Set monthly/weekly budgets and monitor progress.

📈 Analytics Dashboard – Visual charts for income vs. expenses.

🎨 Modern UI – Built with React, shadcn/ui, Tailwind CSS, and Framer Motion.

☁️ Supabase Backend – Database + Auth + API in one place.

🌍 Deployment Ready – Can be hosted on Vercel/Netlify with Supabase backend.

🛠️ Tech Stack

Frontend

React (Vite)

Tailwind CSS + shadcn/ui

Framer Motion

Backend & Database

Supabase (Postgres, Auth, API)

Deployment

Frontend → Vercel / Netlify

Backend + Database → Supabase

📂 Project Structure
/src
 ├── components   → UI components (shadcn + custom)
 ├── pages        → App pages (Dashboard, Login, Register, etc.)
 ├── hooks        → Custom React hooks
 ├── lib          → Supabase client setup
 ├── context      → Auth & App context
 └── utils        → Helpers & formatters

⚙️ Installation & Setup
1. Clone the repo
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker

2. Install dependencies
npm install

3. Setup environment variables

Create a .env file in the root:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Run the app
npm run dev

📸 Screenshots (to be added)

Dashboard View

Expense List

Budget Planner

Analytics Charts

📌 Roadmap

 Add recurring expenses

 Budget alerts (email/notifications via Supabase)

 Dark mode toggle

 Export data (CSV/PDF)

 Mobile app (Expo + Supabase)
