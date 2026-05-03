<div align="center">

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" width="900" height="220">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f0c29"/>
      <stop offset="50%" style="stop-color:#302b63"/>
      <stop offset="100%" style="stop-color:#24243e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      .title { font-family: 'Segoe UI', Arial, sans-serif; font-weight: 900; font-size: 64px; fill: url(#accent); filter: url(#glow); }
      .sub   { font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; fill: rgba(255,255,255,0.7); letter-spacing: 4px; }
      .tag   { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; fill: rgba(255,255,255,0.5); letter-spacing: 2px; }
      .dot   { animation: pulse 2s ease-in-out infinite; }
      .dot2  { animation: pulse 2s ease-in-out infinite 0.4s; }
      .dot3  { animation: pulse 2s ease-in-out infinite 0.8s; }
      @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
      .line  { animation: draw 2s ease-out forwards; stroke-dasharray: 400; stroke-dashoffset: 400; }
      @keyframes draw { to { stroke-dashoffset: 0; } }
    </style>
  </defs>

  <!-- Background -->
  <rect width="900" height="220" fill="url(#bg)" rx="12"/>

  <!-- Decorative grid lines -->
  <line x1="0" y1="60" x2="900" y2="60" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="0" y1="120" x2="900" y2="120" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="0" y1="180" x2="900" y2="180" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="150" y1="0" x2="150" y2="220" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
  <line x1="750" y1="0" x2="750" y2="220" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>

  <!-- Animated accent line -->
  <line class="line" x1="60" y1="185" x2="840" y2="185" stroke="url(#accent)" stroke-width="2" opacity="0.6"/>

  <!-- Animated dots -->
  <circle class="dot"  cx="60"  cy="40" r="4" fill="#667eea"/>
  <circle class="dot2" cx="840" cy="40" r="4" fill="#764ba2"/>
  <circle class="dot3" cx="450" cy="195" r="3" fill="#667eea"/>

  <!-- Corner brackets -->
  <path d="M40,30 L40,20 L50,20" stroke="rgba(102,126,234,0.6)" stroke-width="2" fill="none"/>
  <path d="M860,30 L860,20 L850,20" stroke="rgba(118,75,162,0.6)" stroke-width="2" fill="none"/>
  <path d="M40,190 L40,200 L50,200" stroke="rgba(102,126,234,0.6)" stroke-width="2" fill="none"/>
  <path d="M860,190 L860,200 L850,200" stroke="rgba(118,75,162,0.6)" stroke-width="2" fill="none"/>

  <!-- Title -->
  <text class="title" x="450" y="120" text-anchor="middle">HIRELY</text>

  <!-- Subtitle -->
  <text class="sub" x="450" y="155" text-anchor="middle">HR MANAGEMENT SYSTEM</text>

  <!-- Tags -->
  <text class="tag" x="450" y="175" text-anchor="middle">AGILE · SCRUM · UI/UX · LARAVEL · FULL STACK</text>
</svg>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-hirewithhirely.vercel.app-667eea?style=for-the-badge&logoColor=white)](https://hirewithhirely.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-dvphnc%2Fhirely-764ba2?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dvphnc/hirely)
[![Made with Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

<br/>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 60" width="100%" preserveAspectRatio="none">
  <path d="M0,30 C150,60 300,0 450,30 C600,60 750,0 900,30 L900,60 L0,60 Z" fill="#0f0c29" opacity="0.6"/>
  <path d="M0,40 C200,10 400,55 600,25 C750,5 850,45 900,35 L900,60 L0,60 Z" fill="#302b63" opacity="0.4"/>
</svg>

## ✦ Overview

**HIRELY** is a full-stack HR Management System built to modernize how companies handle recruitment, employee records, and HR workflows. Developed as a team project under Agile/Scrum methodology, with a focus on clean UI/UX and secure data management.

I served as **Scrum Master & UI/UX Designer** — leading sprint planning, designing the interface from wireframe to final, and keeping the team's workflow efficient throughout the SDLC.

<br/>

## ✦ Features

| Feature | Description |
|---|---|
| 🧑‍💼 **Employee Directory** | Manage employee profiles, roles, and departments |
| 📋 **Recruitment Tracking** | End-to-end applicant pipeline with status updates |
| 🔐 **Role-Based Access** | Admin, HR, and Employee permission levels |
| 📊 **Dashboard Analytics** | Visual overview of HR metrics and headcount |
| 🗂️ **Document Management** | Upload and organize employee documents securely |
| 📅 **Leave Management** | Track leave requests and approvals |

<br/>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 50" width="100%" preserveAspectRatio="none">
  <path d="M0,0 C225,50 675,0 900,40 L900,50 L0,50 Z" fill="#667eea" opacity="0.08"/>
  <path d="M0,10 C300,50 600,0 900,30 L900,50 L0,50 Z" fill="#764ba2" opacity="0.06"/>
</svg>

## ✦ Tech Stack

<div align="center">

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

<br/>

## ✦ My Role

```
Role        → Scrum Master & UI/UX Designer
Timeline    → April – May 2025
Team Size   → Cross-functional team
Methodology → Agile / Scrum
```

**As Scrum Master:**
- Facilitated daily standups, sprint planning, and retrospectives
- Tracked milestones and removed blockers for the development team
- Maintained 100% accuracy in technical documentation and data workflows
- Ensured strict confidentiality of project data following SOPs

**As UI/UX Designer:**
- Created wireframes and high-fidelity prototypes in Figma
- Designed a clean, accessible interface optimized for HR workflows
- Conducted usability reviews and iterated based on team feedback

<br/>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 50" width="100%" preserveAspectRatio="none">
  <path d="M0,40 C300,0 600,50 900,10 L900,0 L0,0 Z" fill="#667eea" opacity="0.08"/>
  <path d="M0,30 C225,50 675,0 900,20 L900,0 L0,0 Z" fill="#764ba2" opacity="0.06"/>
</svg>

## ✦ Getting Started

```bash
# Clone the repo
git clone https://github.com/dvphnc/hirely.git
cd hirely

# Install dependencies
composer install
npm install

# Set up environment
cp .env.example .env
php artisan key:generate

# Configure your database in .env, then:
php artisan migrate --seed

# Run the app
php artisan serve
```

<br/>

## ✦ Screenshots

> _Coming soon — UI screenshots and demo walkthrough_

<br/>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 80" width="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="wave-footer" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.15"/>
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.15"/>
    </linearGradient>
  </defs>
  <path d="M0,20 C150,60 300,0 450,30 C600,60 750,10 900,25 L900,80 L0,80 Z" fill="url(#wave-footer)"/>
  <path d="M0,40 C200,10 500,60 700,20 C800,5 860,40 900,30 L900,80 L0,80 Z" fill="url(#wave-footer)" opacity="0.5"/>
</svg>

<div align="center">

<br/>

**Built with 💜 by [Joana Daphne Sy](https://dvphnc.github.io)**

*BSIT Student · Aspiring Executive Assistant · President's Lister*

[![Portfolio](https://img.shields.io/badge/Portfolio-dvphnc.github.io-667eea?style=flat-square)](https://dvphnc.github.io)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dvphnc-764ba2?style=flat-square&logo=linkedin)](https://linkedin.com/in/dvphnc)
[![Email](https://img.shields.io/badge/Email-jdsoffcl@gmail.com-667eea?style=flat-square&logo=gmail)](mailto:jdsoffcl@gmail.com)

<br/>

*© 2025 Joana Daphne Sy · dvphnc*

</div>
