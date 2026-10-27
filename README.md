# ChatLive — Real-Time Chat & Team Collaboration App (Phase 1)

ChatLive is a retro pixel-art styled collaboration and team messaging client built with React 19, Vite, and Tailwind CSS. It provides an intuitive workspace for topical channels, direct messaging, message replies, emoji reactions, and profile customization.

> **Note on Phase 1 Scope:**  
> This version represents **Phase 1: Frontend MVP**. All authentication, message persistence, receipts, and presence are currently simulated on the client side using browser storage (`localStorage`) and in-memory timers. Real-time multi-device synchronization, JWT server authentication, Express REST APIs, and MongoDB persistence will be implemented in **Phase 2** (see [`PHASE_2_ROADMAP.md`](./PHASE_2_ROADMAP.md)).

---

## 🛠️ Technology Stack

- **Framework:** React 19.3 (`react`, `react-dom`)
- **Build Tool:** Vite 8.3 (`@vitejs/plugin-react`)
- **Styling:** Tailwind CSS 4.3 (`@tailwindcss/vite`) with custom embedded retro typography (*Dogica* and *Dogica Pixel*)
- **Animations:** Motion 14.6 (`motion/react`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Persistence:** Browser `localStorage` with versioned schema hydration and error recovery
- **Testing:** Node.js native test runner (`node:test`)

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.x, v20.x, or v22.x+ recommended)
- npm (v9+ or v10+)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```

### 4. Run Linter
```bash
npm run lint
```

### 5. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Access Instructions

To test or demonstrate ChatLive without entering credentials:

1. Launch the app and visit `/login`.
2. Wait for the retro splash screen animation (2 seconds).
3. In the demo credential box, click the **"Quick Fill"** button.
4. Click **"Sign in to Space"** to immediately enter the `#general` chat.
5. Alternatively, sign in using:
   - **Email:** `joy@example.com`
   - **Password:** `password123` *(or any 8+ character password)*

---

## ✨ Implemented Phase 1 Features

### 1. Authentication & Route Guards (Demo Simulation)
- Visual sign-in and account creation forms with input validation.
- One-click **Quick Fill** demo login.
- Protected route guards (`<ProtectedRoute>`): unauthenticated users are redirected from `/chat` and `/profile` back to `/login`.
- Session persistence in `localStorage`: refreshing the browser keeps you signed in.
- Working **Sign out** and **Reset Demo Data** actions in Account settings.

### 2. Channel & Direct Messaging
- **Seeded Conversations:** Pre-populated with active channels (`#general`, `#design-team`) and DMs (`Maya Chen`, `Jordan Lee`, `Chris Patel`).
- **Real-Time Simulation:** Sending a message instantly updates the view and triggers simulated delivery checkmarks (`sent` -> `delivered` -> `read`).
- **Local Persistence:** Newly sent messages and conversations survive browser page reloads.
- **Search & Filtering:** Real-time conversation search and filtering by *All*, *Channels*, or *Direct*.
- **New Conversation Modal:** Create new custom channels or direct messages on the fly.

### 3. Collaboration Features
- **Message Replies:** Click the `↩` icon on any message to quote it in your next reply.
- **Emoji Reactions:** Add reactions (`👍`, `❤️`, `😂`, `😮`, `🚀`) with live count badges and user toggle tracking.
- **Message Editing:** Edit your own sent messages with inline inputs and an `(edited)` timestamp marker.
- **Message Deletion:** Delete your own messages with confirmation prompts.
- **In-Chat Message Search:** Click the search icon in the chat header to filter messages within the current conversation.

### 4. Profile & Presence
- Edit display name, job title, bio (with character counter), and timezone.
- Switch between retro pixel avatars (*Female* / *Male*) or upload custom photo files.
- Resilient image processing: HTML5 Canvas center-crops photos to 256x256 WebP data URLs with safe fallbacks.
- Status toggle: *Active* (green), *Away* (amber), *Do Not Disturb* (red).

### 5. Attachments
- Supports multiple image and document attachments (max 5 files, 10MB each).
- Inline image preview with automatic object URL memory management (`revokeObjectURL`).
- Deliberate exclusion of inline SVG rendering to protect against XSS execution.

---

## ⚠️ Known Phase 1 Limitations

1. **Client-Side Scope:** Messages sent in one browser window will not appear in another browser window because there is no central WebSocket server yet.
2. **Local Session:** Credentials and sessions are stored in browser `localStorage`. Do not use real passwords.
3. **Simulated Receipts:** Delivery checkmarks and presence are driven by client-side timers to demonstrate the user experience before the backend is built.

---

## 🗺️ Next Steps: Phase 2

For the complete 15-step backend, database, and Socket.IO implementation plan, see **[`PHASE_2_ROADMAP.md`](./PHASE_2_ROADMAP.md)**.
