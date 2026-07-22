Ajaia Docs
A lightweight, AI-native collaborative document editor built for the Ajaia LLC Full Stack assignment.

Features
Rich Text Editing: Headings, bold, italic, underline, lists, blockquotes, and code blocks.
File Import: Upload .txt or .md files to instantly create editable documents.
Sharing: Share documents with other users (View or Edit permissions).
Persistence: SQLite database preserves documents and sharing state locally.
Auto-save: Documents save automatically 2 seconds after edits.
Tech Stack
Frontend: Next.js 14 (App Router), Tailwind CSS, TipTap Editor
Backend: Next.js API Routes
Database: SQLite via Prisma ORM
Testing: Vitest


Getting Started
Prerequisites
Node.js 18+
npm

Installation
git clone https://github.com/shabie68/ajaia-docs.git 
cd ajaia-docsnpm install


Setup Database
npx prisma db push
npx prisma db seed

Run Development Server

Open http://localhost:3000

Run Tests

npm test

Test Accounts
Name
Email
Role
Avatar
Alice Johnson	alice@ajaia.test	Product Manager	Indigo
Bob Smith	bob@ajaia.test	Engineer	Green
Carol Davis	carol@ajaia.test	Designer	Red

Supported File Types
.txt (Plain text)
.md (Markdown - parses headings and paragraphs)


Deployment Note
Tried to deopl.....


AI Workflow Note
Tools Used
Cursor / Claude 3.5 Sonnet for code generation and architecture planning.
ChatGPT for brainstorming edge cases (e.g., how to handle file parsing failures).
Where AI Materially Sped Up Work
TipTap Setup: Generating the boilerplate for the toolbar and configuring multiple extensions (StarterKit, Underline, TextAlign) saved ~45 minutes.
Prisma Schema: Rapidly iterating on the relational schema (Document -> Shares -> User) and getting the SQLite syntax right.
CSS/Tailwind Styling: Generating the precise utility classes for the toolbar, modals, and dashboard layout.
What I Changed or Rejected
Initial BubbleMenu Implementation: AI suggested a highly customized BubbleMenu plugin. I rejected it because it caused dependency version conflicts (Export BubbleMenu doesn't exist). I reverted to a clean fixed-toolbar-only approach, proving that simpler is often better.
Server-side Multer Upload: AI initially generated a multer based file upload API. I rejected this because handling multipart/form-data in Next.js App Router requires custom config parsing, and reading the file client-side as text is infinitely simpler for .txt/.md files.
Database Seeding IDs: AI generated UUIDs for the mock auth login, but the database used different UUIDs. I caught this and updated the API routes to match users by email instead of id to bridge the gap cleanly.
How I Verified Correctness
Manually tested all user flows (Login -> Create -> Edit -> Share -> View as second user).
Tested error states (uploading PDFs, empty files).
Ran Vitest to ensure database constraints (like preventing duplicate shares) actually work.
Verified auto-save by editing, waiting 3 seconds, refreshing the page, and confirming content persisted.
Create SUBMISSION.md in the root folder:

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
Access
Live URL: [INSERT YOUR VERCEL URL HERE]
Walkthrough Video: [INSERT YOUR LOOM/YOUTUBE URL HERE]
Status
✅ Document Creation & Editing
✅ Rich Text Formatting
✅ File Upload (.txt, .md)
✅ Sharing Model
✅ Persistence (Local SQLite)
✅ Automated Tests
✅ Deployment