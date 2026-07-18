Submission Contents
Code & Configuration
src/ - Next.js application source code
prisma/ - Database schema and seed scripts
package.json - Dependencies and scripts
Documentation
README.md - Setup, run instructions, and test accounts
ARCHITECTURE.md - Prioritization rationale and technical tradeoffs
AI-WORKFLOW.md - AI tool usage and verification methods
SUBMISSION.md - This file
Testing
src/__tests__/documents.test.ts - Database and sharing logic tests
Run via: npm test
Status
✅ Document Creation & Rich Text Editing (TipTap)
✅ File Upload (.txt, .md parsing to editor)
✅ Sharing Model (Owner, View/Edit permissions)
✅ Persistence (Local SQLite via Prisma)
✅ Automated Tests (Vitest - 4 passing)
⏸️ Live Deployment (Intentionally deprioritized - see below)
What is Incomplete & Why
Live Deployment: I intentionally stopped before deploying to Vercel. Deploying SQLite to a serverless environment requires migrating to an external database (like Postgres/Supabase) to handle connection pooling and binary mismatches. I estimated this would take 1-2 hours of infrastructure debugging. I chose to spend that time polishing the editor UX, error handling on file uploads, and writing tests instead, keeping the focus on core product engineering.

What I Would Build Next (With +2-4 Hours)
Swap SQLite for Supabase Postgres (already scoped in Prisma, just needs provider change and URI).
Deploy to Vercel for a live URL.
Add a simple "Export to Markdown" button in the editor toolbar.