
Create `ARCHITECTURE.md` in the root folder:

```markdown
# Architecture Note

## Prioritization & Tradeoffs
The primary goal was to deliver a cohesive, usable document editing slice rather than a shallow, wide feature set. 

### What I Prioritized
1. **Editor Experience**: I chose TipTap because it provides a robust, out-of-the-box ProseMirror wrapper. Building a custom editor from scratch would have consumed the entire timebox.
2. **Simple Auth Simulation**: Real auth (NextAuth/Clerk) adds significant setup time with minimal product value for an internal tool demo. Mock auth via context + localStorage allows instant testing of multi-user flows.
3. **Client-Side File Parsing**: Instead of handling complex server-side multipart uploads and temp files, the client reads `.txt`/`.md` files, parses them into TipTap JSON, and sends standard JSON to the API. This keeps the backend stateless and deployment-friendly.

### What I Deprioritized
1. **Real-time Collaboration (WebSockets)**: High engineering cost, low value for a single-session demo.
2. **Complex Markdown Parsing**: The importer handles headings and paragraphs. Parsing inline Markdown (e.g., `**bold**`) was skipped to keep scope tight.
3. **Role-Based Access Control (RBAC)**: Sharing is binary (Owner vs. Shared). A full permissions matrix was unnecessary.

### Database Choice
I chose SQLite with Prisma for zero-config local setup and fast prototyping. The tradeoff is that it doesn't persist natively in serverless environments (like Vercel) without external storage (e.g., Turso). For a 4-6 hour timebox, this was the correct call to maximize time spent on product logic over infrastructure.