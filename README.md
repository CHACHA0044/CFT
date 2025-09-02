# 🌍 Carbon Footprint Tracker (CFT)

> **Carbon Footprint Tracker** is a MERN-stack application designed to help users monitor and reduce their environmental impact. It allows users to log monthly lifestyle data (**food, transport, electricity, waste**), calculates their CO₂-equivalent emissions, delivers tailored reduction suggestions, and fosters engagement through community leaderboards.  

🔗 **Live App**:  [cft-self.vercel.app](https://cft-self.vercel.app)  
📦 **Repo**:  [CHACHA0044/CFT](https://github.com/CHACHA0044/CFT)  
👤 **LinkedIn**:  [Pranav Dembla](https://www.linkedin.com/in/pranav-dembla-3a1431291?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)  


[![Node.js](https://img.shields.io/badge/Node.js-18.x-2b2d42?logo=node.js&logoColor=68a063)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-2b2d42?logo=react&logoColor=61dafb)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-2b2d42?logo=mongodb&logoColor=4db33d)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-2b2d42?logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-2b2d42?logo=render&logoColor=46e3b7)](https://render.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-2b2d42?logo=javascript&logoColor=f7df1e)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-2b2d42?logo=tailwindcss&logoColor=38bdf8)](https://tailwindcss.com/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-Enabled-2b2d42?logo=gmail&logoColor=ea4335)](https://nodemailer.com/about/)

---

## 📑 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repo Layout](#repo-layout-high-level)
- [Testing & QA](#testing--qa)
- [Deployment](#deployment)
- [Security Considerations](#sec)
- [Troubleshooting](#troubleshooting-common-gotchas)
- [Contributing](#contributing)
- [Contact](#contact)

---
<a name="project-overview"></a> 
## 📌 Project Overview

Carbon Footprint Tracker (CFT) is a full-stack MERN application that empowers users to measure, track, and reduce their personal carbon footprint.
By logging simple lifestyle data each month (food, transport, electricity, and waste), users receive a standardized CO₂-equivalent estimate, personalized reduction suggestions, and can compare results on interactive dashboards and leaderboards.  

I started this project just for fun and to get hands-on experience with the MERN stack and other modern tools. Most of the work here was built by me from scratch, but along the way I did use AI and other resources to get guidance and help with some features and bits of code. Never through blind copy-pasting, but by adapting and understanding them to truly make the project my own.

The app uses:  
**Frontend**: React, Tailwind CSS, Framer Motion (hosted on Vercel)  
**Backend**: Node.js, Express, Mongoose (hosted on Render)  
**Database**: MongoDB Atlas

### 🔄 Core User Flow

Sign Up & Verify...  
Register with name, email, and password.
Email verification via Nodemailer is required to unlock features.
Passwords validated with zxcvbn, sanitized with DOMPurify.

Login & Authentication...  
Secure login sets an HTTP-only cookie.
Session fallback stored in sessionStorage if cookies are blocked.
Logout clears both cookies and fallback storage.
Resend verification supported when login fails with 403.

Add Monthly Entries...  
Create a CarbonEntry with categories: food, transport, electricity, waste.
Backend validates inputs and applies caps to prevent unrealistic values.

Emission Calculations & Suggestions...  
Backend applies emission factors → returns category breakdown + total emissions.
Generates personalized suggestions based on top contributors.

Explore & Track...  
Dashboard: interactive pie charts + quick tips.
History: past entries with timestamps, editable list view.
Charts/Leaderboard: bar charts comparing individual and community data.

Community Comparison...  
Leaderboard ranks users by emissions.
Excludes unverified or empty accounts.
Aggregations computed server-side for performance.

### 🚀 Key Features

#### 🔐 Authentication & Account Management

Registration (POST /api/auth/register) with email verification.  
Login (POST /api/auth/login) sets HTTP-only cookie.  
Logout (POST /api/auth/logout) clears sessions.  
Resend verification (POST /api/auth/resend-verification).  
Token info (GET /api/auth/token-info/me) for personalization.  

#### 📊 Carbon Entry Lifecycle

Create entry (POST /api/footprint).  
Fetch summary (GET /api/footprint/me).  
List history (GET /api/footprint/history).  
Fetch entry by ID (GET /api/footprint/:id).  
Dashboard enforces limits (e.g., 5 recent entries visible).  

#### 💡 Personalized Suggestions

Generated per entry based on highest category impact.  
Securely rendered (sanitized HTML).  
Timestamped for transparency.  

#### 🎨 Data Visualization & UX

**Dashboard**: Pie chart breakdown + quick tips.  
**Leaderboard**: Community bar charts & ranks.  
**History**: Card list, expandable suggestions.  
Polished with Framer Motion, Lottie animations, confetti bursts.  
Dark mode & responsive design.  

#### 🔒 Security & Resilience

**Cookies**: HttpOnly, Secure, SameSite=None (for cross-domain auth).  
**Sanitization**: DOMPurify + server validation.  
**Password security**: bcrypt + zxcvbn.  
**Middleware**: Helmet, CORS, rate limiting.  
**Fallback**: session storage token if cookies blocked.  

#### ♿ UX Resilience & Accessibility

Smooth navigation: loaders, scroll resets.  
Accessible defaults (reduced motion support).  
Mobile-first responsive layouts.  

#### 👨‍💻 Developer-Friendly Design

REST API structured in /routes.  
Mongoose schemas in /models.  
Shared helpers in /utils (emission factors, mailer, validation).  
Modular frontend components for reuse and consistency.  

##### 📡 API Endpoints (Quick Reference)

**Auth**:  
POST /api/auth/register  
POST /api/auth/login  
POST /api/auth/logout  
GET /api/auth/verify/:token  
POST /api/auth/resend-verification  
GET /api/auth/token-info/me  

**Footprint**:  
POST /api/footprint  
GET /api/footprint/me   
GET /api/footprint/history  
GET /api/footprint/:id  

**Leaderboard**:  
GET /api/footprint/leaderboard   

#### 🌍 Why This Matters

CFT makes climate action accessible:  
✅ **Simple, intuitive data entry**  
✅ **Transparent emission calculations**  
✅ **Actionable, personalized suggestions**  
✅ **Community comparisons for motivation**  

Built with scalability and extensibility in mind — new categories, gamification features, or integrations can be added without disrupting existing modules.

---
<a name="features"></a> 
## 🚀 Features

- 🔐 User registration, email verification, and **secure cookie-based sessions**  
- 📊 Create / edit / delete monthly carbon entries  
- ⚙️ Backend emission calculation engine with validation & caps  
- 📈 Dashboard with **charts and suggestions per entry**  
- 🏆 Leaderboard and **community comparisons**  
- 📡 REST API for frontend–backend communication  
- 🔍 Planned admin/analytics hooks  

---
<a name="tech-stack"></a>  
## 🛠 Tech Stack

**Frontend**: React, Tailwind CSS, Framer Motion, Recharts  
**Backend**: Node.js, Express  
**Database**: MongoDB (Mongoose)  
**Auth/Security**: HTTP-only cookies, JWT/session, Helmet, CORS, input validation  
**Email**: Nodemailer (verification, reset)  
**Hosting**: Vercel (frontend), cloud backend, MongoDB Atlas  

---
<a name="repo-layout-high-level"></a>  
## 📂 Repo Layout 

```bash
/               # repo root
  ├─ client/         # React frontend (all pages)
  ├─ middleware/     # Express middleware (auth, error handling)
  ├─ models/         # Mongoose schemas (User, CarbonEntry)
  ├─ routes/         # API endpoints (/api/auth, /api/footprint, etc.)
  ├─ utils/          # Helpers (emission factors, mailer, validation)
  ├─ server.js       # Express app bootstrap
  ├─ package.json
  └─ vercel.json

```

---
<a name="testing--qa"></a>  
## ✅ Testing & QA

Recommended testing approach...

Unit tests for backend calculation functions, auth utilities, and validation (Jest).
Integration tests for APIs (Supertest).
Manual UAT: full flow — register, verify email, login, create entry, check dashboard and chart outputs.
Performance: load tests on heavy query endpoints (leaderboard, history) if used by many users.
Sample unit test ideas
Emission calculator with normal and edge inputs (verify caps).
Auth routes: register/login/logout flows.
Route permissions: ensure one user cannot access another user’s entries.

---
<a name="deployment"></a>  
## 🚀 Deployment

**Frontend**
Deploy the client build to Vercel. Ensure vercel.json rewrites API calls in dev to your backend host if needed.
**Backend**
Host on Render. Use environment variables for MONGO_URI, email creds, JWT secret.
**Database**
MongoDB Atlas for production. Use separate DB users for dev/production and enable IP whitelisting / VPC peering for improved security.
**CI/CD**
Use GitHub Actions to run tests and build client. On main push, deploy frontend to Vercel and backend to render.

---
<a name="sec"></a>  
## 🔒 Security considerations

Use HTTP-only cookies and SameSite=none (required because the frontend and backend are hosted on different domains and need cross-site cookie access), Secure=isProd (only sent over HTTPS, in production), HttpOnly=true (protects from XSS).
Always validate input on the server (do not rely on client-side validation).
Hash passwords with bcrypt (salt rounds ≥ 10).
Protect sensitive routes with rate-limiting and Helmet middleware.
Sanitize all user inputs before saving to DB or rendering.

---
<a name="troubleshooting-common-gotchas"></a>  
## 🐞 Troubleshooting 

403 / manifest.json: check your static asset configuration and hosting setup (paths, base path, Vercel static settings).
/footprint/:id fetch errors: ensure server checks that the requested entry.userId === req.user._id. Also confirm credentials: 'include' is used on client fetches.
Email not sending: verify SMTP host/port/credentials and check logs from Nodemailer. Some providers require app-specific passwords or relaxed security settings.
CORS issues: confirm CLIENT_URL is allowed in server CORS config and the backend supports credentials.

---
<a name="contributing"></a> 
## 🤝 Contributing

We welcome contributions!
Fork the repository.
Create a feature branch: git checkout -b feat/my-feature.
Add tests and update docs if applicable.
Commit and push, then open a PR with a clear description and screenshots for UI changes.
Ensure CI passes before requesting review.
Please follow the repo’s coding style (ESLint/Prettier if configured).

---
<a name="contact"></a> 
## 📬 Contact

Repo: https://github.com/CHACHA0044/CFT  
Maintainer: Pranav Dembla (pdembla@student.iul.ac.in)
