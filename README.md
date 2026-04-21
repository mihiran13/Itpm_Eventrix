# 🚀 Eventrix - Advanced Event Management System

[![GitHub contributors](https://img.shields.io/github/contributors/mihiran13/Itpm_Eventrix)](https://github.com/mihiran13/Itpm_Eventrix/graphs/contributors)
[![GitHub stars](https://img.shields.io/github/stars/mihiran13/Itpm_Eventrix?style=social)](https://github.com/mihiran13/Itpm_Eventrix/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Eventrix** is a full-stack MERN application designed to streamline event planning, registration, and management. Built for university ecosystems, it provides a seamless experience for administrators, organizers, and students.

---

## 🌟 Key Features

### 🛠️ Admin Dashboard
- **User Management**: Oversee all users, organizers, and students.
- **Analytics**: Real-time stats on event registrations and engagement.
- **System Logs**: Audit trails for all critical system actions.

### 📅 Organizer Flow
- **Event Creation**: Advanced event builder with image uploads (Cloudinary).
- **Session Management**: Break down events into multiple sessions/workshops.
- **Attendee Tracking**: Manage registrations and check-ins.

### 🎓 Student Experience
- **Discovery**: Search and filter events by category, date, and popularity.
- **Registration**: Quick 1-click registration for events and specific sessions.
- **Personalized Feed**: A social-media style feed for event updates and announcements.

---

## 💻 Tech Stack

### Frontend
- **React.js**: Functional components with Hooks.
- **State Management**: Redux Toolkit / Context API.
- **Styling**: TailwindCSS & Custom CSS Modules.
- **Icons**: React Icons (Lucide, FontAwesome).

### Backend
- **Node.js & Express**: Scalable RESTful API architecture.
- **MongoDB**: NoSQL database with Mongoose ODM.
- **Authentication**: JWT & Google OAuth 2.0 (Passport.js).
- **Security**: Helmet, Rate Limiting, XSS Protection.
- **Testing**: Jest & Supertest for E2E and Unit testing.

---

## 👥 Team & Contributions

| Member | Role | Responsibilities |
| :--- | :--- | :--- |
| **Yositha Mihiran** | Project Lead / Backend | Core API, Admin Security, System Architecture |
| **Vidushika Madhushani** | Frontend Engineer | Organizer Dashboard, Event Management UI |
| **O.K.D. Sithmi Kaushalya** | UX / Frontend | Student Portal, Registration Flow, Social Feed |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Cloudinary API Keys

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mihiran13/Itpm_Eventrix.git
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file with your variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

---

## 📸 Screenshots
*(Add screenshots here for a 100% mark)*

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.