<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 200" width="900" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d0d0d"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#a78bfa"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="900" height="200" fill="url(#bg)" rx="10"/>
  <!-- grid -->
  <line x1="0" y1="50"  x2="900" y2="50"  stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="0" y1="100" x2="900" y2="100" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="0" y1="150" x2="900" y2="150" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="180" y1="0" x2="180" y2="200" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <line x1="720" y1="0" x2="720" y2="200" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <!-- brackets -->
  <path d="M32,22 L32,14 L44,14" stroke="#667eea" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M868,22 L868,14 L856,14" stroke="#a78bfa" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M32,178 L32,186 L44,186" stroke="#667eea" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M868,178 L868,186 L856,186" stroke="#a78bfa" stroke-width="1.5" fill="none" opacity="0.5"/>
  <!-- title -->
  <text font-family="'Segoe UI',Arial,sans-serif" font-weight="900" font-size="76" fill="url(#acc)" filter="url(#glow)" x="450" y="112" text-anchor="middle">HIRELY</text>
  <!-- subtitle -->
  <text font-family="'Segoe UI',Arial,sans-serif" font-size="15" fill="rgba(255,255,255,0.55)" letter-spacing="5" x="450" y="145" text-anchor="middle">HR MANAGEMENT SYSTEM</text>
  <!-- tag line -->
  <text font-family="'Segoe UI',Arial,sans-serif" font-size="11" fill="rgba(255,255,255,0.3)" letter-spacing="2" x="450" y="168" text-anchor="middle">AGILE · SCRUM · UI/UX · LARAVEL · FULL STACK</text>
  <!-- accent line -->
  <line x1="60" y1="182" x2="840" y2="182" stroke="url(#acc)" stroke-width="1.5" opacity="0.4"/>
  <!-- dots -->
  <circle cx="60"  cy="32" r="3" fill="#667eea" opacity="0.6"/>
  <circle cx="840" cy="32" r="3" fill="#a78bfa" opacity="0.6"/>
</svg>

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-hirewithhirely.vercel.app-667eea?style=flat-square&logo=vercel&logoColor=white)](https://hirewithhirely.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-dvphnc%2Fhirely-1a1a2e?style=flat-square&logo=github&logoColor=white)](https://github.com/dvphnc/hirely)
[![Made by](https://img.shields.io/badge/Made_by_Joana_Daphne_Sy-0d0d0d?style=flat-square)](https://dvphnc.github.io)
[![Status](https://img.shields.io/badge/Status_Live-667eea?style=flat-square)](https://hirewithhirely.vercel.app/)

</div>

---

## What is HIRELY?

HIRELY is a full-stack HR Management System built to modernize how teams handle recruitment, employee records, and HR workflows.

> Most HR tools are bloated and expensive. HIRELY keeps it focused — track applicants, manage employees, handle leave requests, and get a clear view of your workforce from one clean dashboard. No fluff, just what HR actually needs.

This started as a school project under a tight two-month sprint. It turned into something I genuinely care about — a system I designed from wireframe to final build, while also leading the team as Scrum Master.

---

## What I Built

> A full-stack Laravel application with role-based access, a recruitment pipeline, an employee directory, and an HR dashboard — built Agile, shipped on time.

<details>
<summary>&nbsp;<b>Recruitment pipeline</b></summary>
<br/>
End-to-end applicant tracking from application to onboarding. HR can update applicant status, add notes, and move candidates through stages — all from a single view. No spreadsheets, no email chains.
</details>

<details>
<summary>&nbsp;<b>Employee directory</b></summary>
<br/>
A searchable, filterable list of all employees with profile pages showing role, department, contact info, and documents. Admins can add, edit, or archive records. Built to handle real organizational data cleanly.
</details>

<details>
<summary>&nbsp;<b>Role-based access control</b></summary>
<br/>
Three permission levels — Admin, HR Officer, and Employee — each with a scoped view of the system. Employees see their own profile and leave history. HR sees recruitment and records. Admins see everything.
</details>

<details>
<summary>&nbsp;<b>Leave management</b></summary>
<br/>
Employees submit leave requests directly through the system. HR reviews and approves or rejects with one click. Leave balances update automatically and are visible on the employee's profile.
</details>

<details>
<summary>&nbsp;<b>Dashboard analytics</b></summary>
<br/>
A real-time overview of headcount, open positions, pending leave requests, and recent activity — giving HR a pulse on the organization without digging through tables.
</details>

<details>
<summary>&nbsp;<b>UI/UX design</b></summary>
<br/>
Every screen was wireframed and prototyped in Figma before a single line of code was written. The interface is clean, accessible, and designed around how HR actually works — not how developers imagine it does.
</details>

---

## Built With

```
Laravel           Backend, routing, auth, migrations
PHP               Server-side logic
MySQL             Relational database
Blade             Server-rendered templating
HTML5 / CSS3      Frontend structure and styling
JavaScript        Interactivity and dynamic UI
Figma             Wireframing and high-fidelity prototypes
Vercel            Deployment and hosting
Agile / Scrum     Project methodology
```

---

## My Role

I served as both **Scrum Master** and **UI/UX Designer** on this project — two roles that ended up being more connected than I expected.

**As Scrum Master:**
- Ran daily standups, sprint planning sessions, and retrospectives
- Tracked milestones and surfaced blockers before they became problems
- Maintained 100% accuracy across technical documentation and data workflows
- Enforced strict data confidentiality protocols following agreed SOPs

**As UI/UX Designer:**
- Led the full design process — from lo-fi sketches to Figma prototypes
- Designed interfaces around real HR tasks, not assumed ones
- Ran usability checks with the team and iterated before handoff
- Ensured every screen passed accessibility and consistency checks

---

## Run It Locally

> Clone, install, configure, and you're running in minutes.

```bash
git clone https://github.com/dvphnc/hirely.git
cd hirely
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Configure your database in `.env`, then:

```bash
php artisan migrate --seed
npm run dev
```

Open a second terminal:

```bash
php artisan serve
```

Open `http://localhost:8000` — you're in.

---

## How It's Organized

```
hirely/
│
├── app/
│   ├── Http/Controllers/
│   │   ├── EmployeeController.php      employee CRUD and profiles
│   │   ├── RecruitmentController.php   applicant pipeline management
│   │   ├── LeaveController.php         leave requests and approvals
│   │   └── DashboardController.php     analytics and overview data
│   ├── Models/
│   │   ├── Employee.php
│   │   ├── Applicant.php
│   │   └── LeaveRequest.php
│   └── Policies/                       role-based access rules
│
├── resources/
│   ├── views/
│   │   ├── dashboard/                  analytics overview
│   │   ├── employees/                  directory and profiles
│   │   ├── recruitment/                applicant pipeline
│   │   └── leave/                      request and approval views
│   └── css/ js/                        styling and interactivity
│
├── database/
│   └── migrations/                     schema definitions
│       └── seeders/                    sample data for testing
│
└── routes/
    └── web.php                         all application routes
```

---

## Timeline

```
April 2025    Project kickoff — team formation and backlog setup
Week 1–2      Wireframes, Figma prototypes, database schema
Week 3–4      Core features — auth, employee directory, RBAC
Week 5–6      Recruitment pipeline and leave management
Week 7        Dashboard, polish, QA, and documentation
May 2025      Final submission and deployment
```

---

<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 70" width="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="wf" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.18"/>
      <stop offset="100%" style="stop-color:#a78bfa;stop-opacity:0.18"/>
    </linearGradient>
  </defs>
  <path d="M0,15 C150,55 300,0 450,28 C600,55 750,5 900,22 L900,70 L0,70 Z" fill="url(#wf)"/>
  <path d="M0,35 C200,5 500,55 720,18 C820,2 870,42 900,28 L900,70 L0,70 Z" fill="url(#wf)" opacity="0.5"/>
</svg>

<br/>

**Built with 💜 by [Joana Daphne Sy](https://dvphnc.github.io)**

*BSIT Student · Aspiring Executive Assistant · President's Lister · New Era University*

[![Portfolio](https://img.shields.io/badge/Portfolio-dvphnc.github.io-667eea?style=flat-square)](https://dvphnc.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dvphnc-a78bfa?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/dvphnc)
[![Email](https://img.shields.io/badge/Email-jdsoffcl@gmail.com-667eea?style=flat-square&logo=gmail&logoColor=white)](mailto:jdsoffcl@gmail.com)

<br/>

*© 2025 HIRELY by Joana Daphne Sy. All Rights Reserved.*

</div>
