
# 🌐 Nexora

**Nexora** is a modern full-stack **Discord-style community platform** built with the **MERN stack**.  
It allows users to create communities, chat in real-time channels, play multiplayer games, and connect with friends.

Live Demo: https://nexora.vercel.app/ *(update this)*

This project demonstrates scalable backend architecture with **service-based organization**, clean frontend state management, hybrid **REST + WebSocket** communication, and real-time multiplayer gaming — perfect for portfolio showcase.

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
- Typing indicators *(coming soon)*

### 🎮 Multiplayer Games
- Play **Tic-Tac-Toe** inside channels
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

---

## 📁 Project Structure

```
Nexora/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── games/
│   │   │   ├── servers/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Server.jsx
│   │   │   ├── Channel.jsx
│   │   │   ├── Game.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ServerContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── assets/
│   └── package.json
│
├── backend/
│   ├── 📂 authentication/           # Auth service
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   ├── auth.middleware.js
│   │   └── index.js
│   │
│   ├── 📂 user-profile/             # User profile service
│   │   ├── profile.controller.js
│   │   ├── profile.routes.js
│   │   ├── user.model.js
│   │   ├── profile.model.js
│   │   └── index.js
│   │
│   ├── 📂 friends/                  # Friends service
│   │   ├── friend.controller.js
│   │   ├── friend.routes.js
│   │   ├── friend-request.model.js
│   │   └── index.js
│   │
│   ├── 📂 servers/                  # Servers service
│   │   ├── server.controller.js
│   │   ├── server.routes.js
│   │   ├── server.model.js
│   │   ├── server-member.model.js
│   │   └── index.js
│   │
│   ├── 📂 channels/                 # Channels service
│   │   ├── channel.controller.js
│   │   ├── channel.routes.js
│   │   ├── channel.model.js
│   │   ├── channel-message.model.js
│   │   └── index.js
│   │
│   ├── 📂 dm-chat/                   # Direct message service
│   │   ├── chat.controller.js
│   │   ├── chat.routes.js
│   │   ├── chat-room.model.js
│   │   └── index.js
│   │
│   ├── 📂 games/                     # Games service
│   │   ├── game.controller.js
│   │   ├── game.routes.js
│   │   ├── game-session.model.js
│   │   └── index.js
│   │
│   ├── 📂 notifications/             # Notifications service
│   │   ├── notification.controller.js
│   │   ├── notification.routes.js
│   │   ├── notification.model.js
│   │   └── index.js
│   │
│   ├── 📂 real-time/                 # Real-time socket service
│   │   ├── chat.socket.js
│   │   ├── channel.socket.js
│   │   ├── game.socket.js
│   │   └── index.js
│   │
│   ├── 📂 utils/                     # Shared utilities
│   │   ├── cloudinary.js
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── index.js
│   │
│   ├── 📂 config/                    # Configuration
│   │   ├── db.js
│   │   ├── cloud_config.js
│   │   └── index.js
│   │
│   ├── 📂 temp/                       # Temporary upload folder
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## 🚦 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm / yarn

### Installation

```bash
git clone https://github.com/rajnishkumar1906/Nexora.git
cd Nexora
```

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd ../backend
npm install
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
VITE_API_URL=https://your-backend-domain.com/api
# or for local testing: http://localhost:5000/api
```

---

## 🚀 Deployment

### Backend (Render)
1. Create new Web Service
2. Connect GitHub repo
3. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add all environment variables
5. Deploy 🚀

### Frontend (Vercel)
1. Import GitHub repo
2. Set:
   - **Root Directory:** `frontend`
   - **Environment Variable:** `VITE_API_URL` = your Render URL
3. Deploy 🚀

---

## ✅ Minimum Launch Requirements (10 Essentials)

### 1. User Authentication & Account Safety ✅
- JWT + HTTP-only cookies
- Persistent sessions
- Password hashing

### 2. Communities (Servers) ✅
- Create/join/leave servers
- Invite links
- Public discovery

### 3. Channels with Real-Time Chat ✅
- Text channels
- Message history
- Socket.IO integration

### 4. Multiplayer Game (Tic-Tac-Toe) ✅
- Fully playable
- Real-time moves
- Win/lose/draw

### 5. User Profiles, Friends & DMs ✅
- Profile customization
- Friend requests
- 1-on-1 chat

### 6. Real-Time Presence ✅
- Online/offline status
- Socket events
- Last seen tracking

### 7. Notifications ✅
- Friend requests
- Game invites
- Unread counts

### 8. Responsive UI ✅
- Mobile friendly
- Touch optimized
- Collapsible sidebar

### 9. Security & Anti-Abuse ✅
- Input sanitization
- Rate limiting
- CORS configuration

### 10. UX Polish ✅
- Loading states
- Error toasts
- Empty states

---

## 🗺️ Roadmap

### Phase 1: Core Features (✅ Completed)
- [x] Authentication system
- [x] User profiles
- [x] Servers & channels
- [x] Real-time chat
- [x] Friend system
- [x] Tic-Tac-Toe game
- [x] Notifications
- [x] Responsive design
- [x] Service-based architecture

### Phase 2: Enhanced Gaming (Coming Soon)
- [ ] Rock-Paper-Scissors
- [ ] Chess (basic)
- [ ] Game history & stats
- [ ] Leaderboards

### Phase 3: Community Features (Planned)
- [ ] Voice channels (WebRTC)
- [ ] Server roles & permissions
- [ ] Message threads
- [ ] Emoji reactions
- [ ] File sharing
- [ ] Dark mode

### Phase 4: Moderation & Admin
- [ ] Server moderation tools
- [ ] Report system
- [ ] Ban/kick members
- [ ] Audit logs

---

## 🔒 Security Features

- HTTP-only cookies for JWT storage
- XSS protection via input sanitization
- Rate limiting on API endpoints
- CORS properly configured
- Password hashing with bcrypt
- MongoDB injection prevention

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

**Rajnish Kumar**
- GitHub: [@rajnishkumar1906](https://github.com/rajnishkumar1906)
- LinkedIn: [@rajnishkumar](https://linkedin.com/in/rajnishkumar)

---

## 🙏 Acknowledgments

- Discord for UI/UX inspiration
- Socket.IO for real-time capabilities
- MongoDB Atlas for database hosting
- Vercel & Render for deployment

---

## 📬 Contact

For questions or feedback:
- Email: rajnishkumar1906@email.com *(update this)*
- Twitter: @rajnishdev *(update this)*

---
