# ChatLive — Real-Time Chat & Collaboration App (Full-Stack Phase 1)

ChatLive is a retro pixel-art styled collaboration and team messaging client built with **React 19**, **Node.js**, **Express**, **MongoDB (Mongoose)**, and **Socket.IO**. It provides an intuitive workspace for topical channels, direct messaging, message replies, emoji reactions, attachment sharing, profile customization, and live real-time synchronization.

---

## 🛠️ Technology Stack

### Frontend Client
- **Framework:** React 19.3 (`react`, `react-dom`)
- **Build Tool:** Vite 8.3 (`@vitejs/plugin-react`)
- **Styling:** Tailwind CSS 4.3 (`@tailwindcss/vite`) with custom embedded retro typography (*Dogica* and *Dogica Pixel*)
- **Animations:** Motion 14.6 (`motion/react`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Real-Time Client:** Socket.IO Client 4.8 (`socket.io-client`)
- **Testing:** Node.js native test runner (`node:test`)

### Backend Server (`server/`)
- **Runtime:** Node.js (v20+ / v25+)
- **Framework:** Express 4.21 (`express`)
- **Database & ODM:** MongoDB with Mongoose 8.10 (`mongoose`)
- **Real-Time Engine:** Socket.IO 4.8 (`socket.io`) with JWT handshake authentication
- **Authentication:** Server-signed JWTs (`jsonwebtoken`) & password hashing with `bcryptjs` (12 salt rounds)
- **Security:** `helmet` HTTP headers, `express-rate-limit` rate limiters, strict CORS whitelist
- **File Uploads:** `multer` with MIME validation, 10MB quotas, and SVG execution blocking
- **Testing:** Native `node:test` + `supertest` + `socket.io-client`

---

## 🏗️ System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   ChatLive Frontend                    │
│   React 19 + Tailwind CSS 4 + Retro Pixel Aesthetics   │
│   (ChatView, MessageList, ChatInput, ProfileModal)     │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       REST API │ HTTPS                  │ WebSocket / WSS
   (Bearer JWT) │                        │ (Handshake Auth)
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│                  ChatLive Express Server               │
│   - JWT Auth & Membership Authorization Middleware     │
│   - REST Endpoints (/api/auth, /api/conv, /api/msg)    │
│   - Socket.IO Rooms ("conversation:{id}")              │
│   - Real-time Deduplication (clientTempId)             │
│   - Centralized Error Handling & Rate Limiting         │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       Mongoose │ MongoDB                │ File System
            ODM │ Protocol               │ Storage
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│     MongoDB Server     │      │     uploads/ Directory │
│ Users, Conversations,  │      │ Sanitized attachments  │
│ Paginated Messages     │      │ (Images, PDFs, Text)   │
└────────────────────────┘      └────────────────────────┘
```

---

## 🚀 Quick Start & Installation

### Prerequisites
1. **Node.js:** v18.x, v20.x, or v22+ (verified working on Node v25.9)
2. **MongoDB:** MongoDB Community Server running locally on port 27017 (`mongodb://127.0.0.1:27017`) or a remote MongoDB Atlas URI.

---

### Step 1: Install Dependencies

```bash
# Install frontend client dependencies
npm install

# Install backend server dependencies
npm install --prefix server
```

---

### Step 2: Configure Environment Variables

Create your `.env` configuration file from the provided template:

```bash
cp .env.example .env
```

Default development settings in `.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173,http://localhost:5174
MONGODB_URI=mongodb://127.0.0.1:27017/chatlive
JWT_SECRET=chatlive_development_secret_key_minimum_32_characters_for_security
JWT_EXPIRES_IN=1d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_BYTES=10485760
```

---

### Step 3: Run the Application

#### Option A: Run Backend & Frontend in Two Terminals (Recommended)

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
```
*Server starts on [http://localhost:5001](http://localhost:5001). Health Check: [http://localhost:5001/api/health](http://localhost:5001/api/health).*

**Terminal 2 (Frontend Client):**
```bash
npm run dev
```
*Frontend starts on [http://localhost:5173](http://localhost:5173) or [http://localhost:5174](http://localhost:5174).*

---

### Step 4: Accessing the Application & Creating Users

1. Open [http://localhost:5173](http://localhost:5173) (or `http://localhost:5174`) in your browser.
2. **Real Server Registration:**
   - Click **"Create an account"** at the bottom of the login box.
   - Enter your name, email (e.g., `alex@example.com`), and password (minimum 8 characters).
   - Click **"Create Space Account"** to register in MongoDB and log in immediately.
3. **Real Server Login:**
   - Sign in with your registered email and password.
4. **Preserved Demo Mode:**
   - Click the **"Quick Fill"** button in the Demo Credentials panel to explore pre-seeded channels and simulated offline receipts without connecting to MongoDB.

---

## 🧪 Automated Testing Suite

All tests use Node's native test runner (`node:test`) and require zero third-party test runners:

```bash
# 1. Run all tests (both Frontend and Backend: 24 tests total)
npm run test:all

# 2. Run backend tests only (21 tests covering Auth, Conversations, Messages, Sockets)
npm run test:server

# 3. Run frontend utility tests only (3 tests)
npm run test:client

# 4. Run ESLint code quality checks (0 errors)
npm run lint

# 5. Compile production build
npm run build
```

### Verified Test Results
```
✔ File utilities and security checks
✔ Image validation constraints
✔ Time formatting utilities
✔ POST /api/auth/register creates user and issues JWT
✔ POST /api/auth/register rejects duplicate email with 409
✔ POST /api/auth/register rejects invalid inputs with 400
✔ POST /api/auth/login validates credentials and issues JWT
✔ GET /api/auth/me returns profile for valid JWT and 401 without
✔ POST /api/conversations creates a group channel
✔ POST /api/conversations creates DM and guarantees uniqueness between pair
✔ GET /api/conversations/:id blocks non-members with 403 Forbidden
✔ GET /api/conversations lists only conversations where user is a member
✔ POST /api/conversations/:id/messages sends message and validates payload
✔ POST /api/conversations/:id/messages rejects non-members (403)
✔ Idempotent message sending with clientTempId
✔ GET /api/conversations/:id/messages cursor-based pagination
✔ PATCH and DELETE message permissions (author vs non-author)
✔ Message search scoped to conversation
✔ POST /api/messages/:id/reactions toggles reaction emoji
✔ Socket handshake rejects unauthenticated connection
✔ Socket handshake accepts connection with valid JWT
✔ Socket room join enforces conversation membership
✔ Live message delivery across room peers
✔ Socket deduplication prevents duplicate insert with clientTempId

Summary: 24 passed, 0 failed (100% success rate).
```

---

## 📡 REST API Reference

All responses conform to standard JSON envelopes:
- **Success:** `{ "success": true, "data": { ... }, "meta": { ... } }`
- **Error:** `{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }`

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with name, email, password | `201`, `400`, `409` |
| `POST` | `/api/auth/login` | Public | Verify credentials and return server-issued JWT | `200`, `400`, `401` |
| `GET` | `/api/auth/me` | Bearer | Retrieve authenticated user profile | `200`, `401` |
| `POST` | `/api/auth/logout` | Bearer | Invalidate session | `200`, `401` |

### Users & Profiles (`/api/users`)
| Method | Endpoint | Auth | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Bearer | Search users by name/email for starting DMs | `200`, `401` |
| `PATCH` | `/api/users/profile` | Bearer | Update display name, title, bio, timezone, avatar | `200`, `400`, `401` |
| `PATCH` | `/api/users/status` | Bearer | Update status (`active`, `away`, `dnd`) | `200`, `400`, `401` |

### Conversations (`/api/conversations`)
| Method | Endpoint | Auth | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | Bearer | List conversations user belongs to (sorted by last message) | `200`, `401` |
| `POST` | `/api/conversations` | Bearer | Create a new channel or 1-on-1 DM (idempotent for DMs) | `200`, `201`, `400` |
| `GET` | `/api/conversations/:id`| Bearer | Fetch conversation metadata and member details | `200`, `403`, `404` |

### Messages & Moderation (`/api/conversations/:id/messages` & `/api/messages/:id`)
| Method | Endpoint | Auth | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations/:id/messages` | Bearer | **Cursor-paginated history** (`?cursor=&limit=30`) | `200`, `403`, `404` |
| `POST` | `/api/conversations/:id/messages` | Bearer | Send message with attachments & reply reference | `201`, `400`, `403` |
| `PATCH` | `/api/messages/:id` | Bearer | Edit message text (author only) | `200`, `400`, `403`, `404` |
| `DELETE`| `/api/messages/:id` | Bearer | Soft delete message (author or channel admin) | `200`, `403`, `404` |
| `GET` | `/api/conversations/:id/messages/search`| Bearer | Search message history within conversation | `200`, `403`, `404` |
| `POST` | `/api/messages/:id/reactions` | Bearer | Toggle emoji reaction (`👍`, `❤️`, `😂`, etc.) | `200`, `400`, `404` |
| `POST` | `/api/conversations/:id/read` | Bearer | Mark conversation messages as read | `200`, `403`, `404` |

### Uploads (`/api/upload`)
| Method | Endpoint | Auth | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/upload` | Bearer | Upload attachment files (max 10MB, max 5 files, SVG blocked) | `201`, `400`, `415` |

---

## ⚡ Socket.IO Real-Time Architecture

### Connection Handshake
Clients authenticate during the WebSocket handshake:
```javascript
const socket = io("http://localhost:5001", {
  auth: { token: "Bearer <jwt>" },
  transports: ["websocket", "polling"],
});
```
Unauthenticated socket handshakes are immediately rejected with `AUTHENTICATION_REQUIRED` or `INVALID_TOKEN`.

### Real-Time Event Protocol
| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `conversation:join` | Client $\to$ Server | `{ conversationId }` | Checks membership in MongoDB before adding socket to room. |
| `conversation:leave`| Client $\to$ Server | `{ conversationId }` | Removes socket from room. |
| `message:send` | Client $\to$ Server | `{ conversationId, body, attachments, clientTempId }` | Saves to DB, checks idempotency, broadcasts to room. |
| `message:new` | Server $\to$ Room | Saved `Message` object | Broadcast to all room members. |
| `typing:start` | Client $\to$ Server | `{ conversationId }` | Broadcasts `user:typing` `{ isTyping: true }` to peers. |
| `typing:stop` | Client $\to$ Server | `{ conversationId }` | Broadcasts `user:typing` `{ isTyping: false }` to peers. |
| `message:read` | Client $\to$ Server | `{ conversationId }` | Updates `readBy` in MongoDB, emits `message:receipt`. |
| `presence:changed` | Server $\to$ All | `{ userId, status, lastSeenAt }` | Broadcasts active/away user status changes. |

---

## 🗄️ Database Models & Relationships

### 1. `User` Model
- `name`: String, required, trim, 2-50 chars.
- `email`: String, required, unique index, lowercase, RFC5322 validated.
- `passwordHash`: String, bcrypt 12 rounds, `select: false` (hidden from queries).
- `avatarUrl`: String (preset or upload path).
- `status`: Enum (`active`, `away`, `dnd`).
- `lastSeenAt`: Date.
- `title`, `bio`, `timezone`: String fields.

### 2. `Conversation` Model
- `type`: Enum (`channel`, `dm`).
- `name`: String (required for channels).
- `memberIds`: Array of ObjectIds referencing `User`.
- `adminIds`: Array of ObjectIds referencing `User`.
- `dmKey`: Deterministic sorted key (e.g. `userA_id:userB_id`) with a **unique partial index** to prevent duplicate direct messages between the same pair of users.
- `lastMessageAt`: Date (indexed with `memberIds` for high-speed sidebar ordering).
- `lastMessagePreview`: Denormalized summary `{ body, senderName, at }`.

### 3. `Message` Model
- `conversationId`: ObjectId referencing `Conversation`, indexed.
- `senderId`: ObjectId referencing `User`, indexed.
- `body`: String (max 4000 characters).
- `attachments`: Array of `{ name, size, type, url }` (max 5).
- `replyToId`: ObjectId referencing `Message` in the same conversation.
- `reactions`: Array of `{ emoji, users: [ObjectId] }`.
- `readBy`: Array of `{ user: ObjectId, readAt: Date }`.
- `clientTempId`: String idempotency key preventing duplicate sends.
- `editedAt`: Date (set on modification).
- `deletedAt`: Date (soft deletion: preserves thread hierarchy for replies).
- **Compound Index:** `{ conversationId: 1, createdAt: -1, _id: -1 }` powers stable $O(\log N)$ cursor pagination.

---

## 🔒 Security & Reliability Checklist

1. **Authentication Authorization:** Strict token verification on every protected REST route and Socket.IO handshake.
2. **Conversation Boundary:** Non-members cannot read, send, edit, delete, or search messages in private conversations.
3. **Message Ownership:** Only original senders can edit or delete their messages (with channel admin moderation support).
4. **Password Security:** Salted with 12 bcrypt rounds; plaintext passwords are never logged, stored, or returned.
5. **Rate Limiting:** Protects `/api/auth/*` against credential stuffing and brute-force attacks.
6. **MIME Validation & SVG Blocking:** Server rejects inline SVGs and executable extensions to protect against stored XSS attacks.
7. **Environment Secrets:** Secrets are loaded strictly from `.env` on the server and excluded from version control via `.gitignore`.
8. **Centralized Error Handling:** No sensitive server stack traces or database internal paths are leaked to clients.

---

## 🎓 Viva Preparation & Technical Architecture Decisions

Key technical trade-offs and rationale to explain to your examiners:

1. **Why Cursor-Based Pagination instead of Offset (`skip/limit`)?**  
   In active real-time chat apps, new messages are constantly inserted at the top. Offset pagination causes shifted pages where users see duplicate messages or miss records when scrolling up. Cursor pagination uses `{ createdAt: { $lt: cursorDate }, _id: { $lt: cursorId } }`, guaranteeing stable $O(\log N)$ index lookups.

2. **How is DM Uniqueness Solved in MongoDB?**  
   MongoDB multi-key array indexes treat `[A, B]` and `[B, A]` as distinct permutations. ChatLive generates a deterministic sorted string `dmKey = [idA, idB].sort().join(":")` with a unique index. Any attempt to start a second DM between the same two users is caught at the database level and returns the existing conversation idempotently.

3. **Why Soft-Deletion for Messages?**  
   Hard-deleting messages breaks foreign key references for message replies and quotes. Setting `deletedAt = new Date()` and masking text to `[This message was deleted]` preserves the conversational thread tree.

4. **How are Duplicate Sockets and Network Retries Prevented?**  
   Every sent message includes a unique `clientTempId`. If a client disconnects and resends during reconnection, MongoDB detects the existing `clientTempId` and returns the existing message without inserting a duplicate or re-broadcasting.

5. **Why Separate Frontend & Backend Configurations?**  
   Vite prefixes client variables with `VITE_` and bundles them into client JavaScript. Keeping backend configuration in `server/.env` ensures database connection strings, JWT secrets, and salts are never bundled or exposed in browser network inspection.
