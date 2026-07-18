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