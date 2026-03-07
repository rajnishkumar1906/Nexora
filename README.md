# 🌐 Nexora
**Nexora** is a modern full-stack **Discord-style community platform** built with the **MERN stack**.  
It allows users to create communities, chat in real-time channels, play multiplayer games, and connect with friends.

Live Demo: [https://nexora-teal.vercel.app/](https://nexora-teal.vercel.app/)

---

## 🚀 Features

### 🔐 Authentication & Users
- Secure signup/login using **JWT + HTTP-only cookies**
- Persistent login sessions
- Online/offline status tracking
- Password encryption with bcrypt

### 👤 User Profiles
- Customizable profiles (avatar, cover image, bio)
- Profile picture upload via **Cloudinary**
- View public profiles

### 👥 Friends System
- Send/accept/reject friend requests
- Real-time friend request notifications
- Friends list with online status
- Remove friends
- 1-on-1 DMs with friends only

### 🏘️ Communities (Servers)
- Create servers with name, description, icon
- Public servers or invite-link based joining
- Discover public servers by category
- Server member list with roles (owner/admin/member)
- Leave servers

### 💬 Channels & Real-Time Chat
- Text channels inside each server
- Create channels (admin only)
- Real-time messaging via **Socket.IO**
- Message history with pagination
- Typing indicators & read receipts
- Message replies & threads
- Emoji reactions

### 🎮 Multiplayer Games
- Play **Ludo** inside channels
- Real-time game moves via Socket.IO
- Join/waiting system for opponents
- Win/lose/draw detection
- Rematch option
- Game chat during matches

### 🔔 Real-Time Notifications
- New friend requests
- Game invites
- Channel mentions
- Unread message counts
- Read/unread status

### 📱 Responsive Design
- Mobile-friendly sidebar
- Touch-optimized game controls
- Collapsible navigation
- Works on all screen sizes

---

## ⚡ Real-Time Architecture

Hybrid communication model:

| Feature                | Technology           |
|------------------------|----------------------|
| Auth, Profile, Servers | REST (Axios)         |
| Channel messages       | WebSocket (Socket.IO)|
| Game moves             | WebSocket (Socket.IO)|
| Online status          | WebSocket (Socket.IO)|
| Notifications          | WebSocket (Socket.IO)|

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite**
- **React Router DOM** v7
- **Context API** (global state)
- **Axios** (HTTP client)
- **Tailwind CSS** (styling)
- **Socket.IO Client** (real-time)

### Backend
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose** (database)
- **JWT** + **HTTP-only cookies** (auth)
- **Bcrypt** (password hashing)
- **Multer** + **Cloudinary** (file uploads)
- **Socket.IO** (WebSocket server)
- **Compression** & **Helmet** (performance & security)

---

## 📁 Project Structure

```
Nexora/
├── frontend/                 # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── config/           # Axios & API config
│   │   ├── context/          # Nexora & Socket contexts
│   │   ├── pages/            # Page components
│   │   └── App.jsx
│   ├── vercel.json           # Vercel deployment config
│   └── package.json
│
├── backend/                  # Backend (Node + Express)
│   ├── auth/                 # Auth module
│   ├── channels/             # Channels module
│   ├── config/               # DB & Cloudinary config
│   ├── dm-chat/              # Direct messaging module
│   ├── friends/              # Friends module
│   ├── games/                # Multiplayer games module
│   ├── middleware/           # Auth & Upload middleware
│   ├── notifications/        # Notifications module
│   ├── profile/              # User profile module
│   ├── real-time/            # Socket.io event handlers
│   ├── servers/              # Servers module
│   ├── utils/                # Shared utilities
│   ├── server.js             # Entry point
│   └── package.json
│
└── .gitignore                # Global git ignore
```

---

## 🚦 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm / yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rajnishkumar1906/Nexora.git
   cd Nexora
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file based on Environment Variables section
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create .env file based on Environment Variables section
   npm run dev
   ```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
FRONTEND_URL=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend-domain.com
# Use the full URL (without /api) for the backend
```

---

## 🚀 Deployment

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repo.
3. Set the **Root Directory** to `backend`.
4. **Build Command:** `npm install`
5. **Start Command:** `node server.js`
6. Add all environment variables from the Backend section above.
7. Ensure `FRONTEND_URL` points to your Vercel URL.

### Frontend (Vercel)
1. Import your GitHub repo to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add the **Environment Variable** `VITE_API_URL` pointing to your Render backend URL.
5. Deploy 🚀

---

## 🔒 Security Features

- **HTTP-only cookies** for secure JWT storage.
- **Helmet.js** for secure HTTP headers.
- **CORS** configured for specific origins.
- **Compression** for faster data transfer.
- **Rate limiting** on sensitive API endpoints.
- **Bcrypt** for secure password hashing.

---

## 👤 Author

**Rajnish Kumar**
- GitHub: [@rajnishkumar1906](https://github.com/rajnishkumar1906)
- LinkedIn: [rajnishkumar](https://linkedin.com/in/rajnishkumar)
