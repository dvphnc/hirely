<div align="center">

![HIRELY](public/hirely-banner.svg)

<br/>

[![Laravel](https://img.shields.io/badge/Laravel-7c3aed?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![PHP](https://img.shields.io/badge/PHP-4a0f2e?style=flat-square&logo=php&logoColor=white)](https://php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-c2185b?style=flat-square&logo=mysql&logoColor=white)](https://mysql.com/)
[![Figma](https://img.shields.io/badge/Figma-e8572a?style=flat-square&logo=figma&logoColor=white)](https://figma.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on_Vercel-f5a623?style=flat-square&logo=vercel&logoColor=white)](https://hirewithhirely.vercel.app/)
[![Made by](https://img.shields.io/badge/Made_by_Joana_Daphne_Sy-4a0f2e?style=flat-square)](https://dvphnc.github.io)
[![Live](https://img.shields.io/badge/Status_Live-7c3aed?style=flat-square)](https://hirewithhirely.vercel.app/)

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

I served as both **Scrum Master** and **UI/UX Designer** — two roles that ended up being more connected than I expected.

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

<div align="center">

![wave](public/hirely-wave.svg)

<sub>© 2025 HIRELY by Joana Daphne Sy.<br/>All Rights Reserved.</sub>

</div>
