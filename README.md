# GK NEET MOCK - PRO PLATFORM

A complete full-stack NEET Mock Test Platform with professional modern UI, an exact NTA CBT simulation logic, advanced internal analytics, and PWA support.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4 + Framer Motion + Recharts + Vite PWA
- **Backend**: Node.js + Express + Helmet + Rate Limit + XSS Protection
- **Database**: MongoDB (Mongoose)
- **Authentication**: Firebase Auth

## Features Implemented
- **Exact NTA CBT Exam Simulation**: 
  - Fullscreen enforcement
  - Tab-switch detection & auto-submit after 3 warnings
  - Anti-cheat (Right-click & text selection disabled)
  - Color-coded question palette (Answered, Not Answered, Marked, Not Visited)
- **Advanced Internal Analytics System**:
  - NO external AI used. All recommendations generated using algorithmic MongoDB data logic.
  - Generates insights on weak chapters, negative marking rates, and accuracy trends using Recharts.
- **New Dashboard & Pages**:
  - **PYQ**: Previous Year Questions search & attempt.
  - **Chapter Tests**: Focused mini-mocks.
  - **Profile**: Detailed statistics, history, and streak trackers.
  - **Bookmarks**: Save difficult questions for revision.
  - **Notifications**: Internal alert system.
- **PWA Ready**: Can be installed on mobile devices.
- **Security Enhancements**: Helmet, express-rate-limit, mongo-sanitize, xss-clean included in the backend.

## Project Structure
- \`/frontend\`: React Vite project
- \`/backend\`: Node.js Express server

## Environment Variables
### Backend
Create a \`.env\` file in the \`backend\` directory:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gk-neet
JWT_SECRET=your_jwt_secret_key_here
\`\`\`

### Frontend
Update Firebase config in \`frontend/src/firebase.js\` with your Firebase project credentials.

## Installation & Setup

1. **Backend**:
   \`\`\`bash
   cd backend
   npm install
   npm run dev
   \`\`\`

2. **Frontend**:
   \`\`\`bash
   cd frontend
   npm install
   npm run dev
   \`\`\`

The frontend runs on \`http://localhost:3000\` and the backend runs on \`http://localhost:5000\`.

## Features Delivered
- Premium UI with dark mode, framer-motion animations, and glass panels.
- Exam timer and question palette logic.
- Database schemas for users, tests, and questions.
- Detailed Post-Test Analytics.
