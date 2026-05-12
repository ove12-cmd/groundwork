@AGENTS.md

## Project
This is a wellness app called Groundwork. It helps users overcome 
social anxiety, depression, anger, low confidence and self-esteem 
by generating a personalized AI-driven plan based on their goal.

## Tech stack
- Next.js + Tailwind CSS + TypeScript
- Mobile-first, 390px width
- No backend, no auth, no database — mock data only for now

## Style
- Font: DM Sans
- Dark and light mode supported
- Rounded corners on everything
- Spacious layouts, one focus per screen, never data-dense
- Vibe: calm, minimal, warm

## Structure
- All screens live in src/app/
- Global styles in src/app/globals.css
- Shared components in src/components/
- Mock data in src/lib/mock-data.ts

## Rules
- Never add a backend unless explicitly asked
- Never add auth unless explicitly asked
- Keep layouts spacious — this is a wellness app not a dashboard
- Always mobile-first
- One CTA per screen maximum

## Todo / Future
- Notifications toggle on profile page is UI only for now — needs backend + service worker to send real push notifications when that feature is built.