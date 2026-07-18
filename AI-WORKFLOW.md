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
