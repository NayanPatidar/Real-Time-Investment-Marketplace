# Real-Time Investment Marketplace

Welcome to the Real-Time Investment Marketplace! This project is a full-stack application designed to connect investors with founders. It features a React.js (TypeScript) frontend and a Node.js backend, enabling users to browse investment proposals, comment with nested replies, and invest using Razorpay.

- **Frontend**: Built with React.js, TypeScript, and Vite, located in the `frontend/` folder.
- **Backend**: Built with Node.js, Express, Prisma, and Redis, located in the `backend/` folder with `src/server.js` as the entry point.

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (comes with Node.js)
- **PostgreSQL**: v14.x or higher (for backend database)
- **Redis**: v6.x or higher (for backend caching/chat)
- **Git**: For cloning the repository

## Frontend Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Real-Time-Investment-Marketplace.git
cd Real-Time-Investment-Marketplace 
```

### 2. Enter directory
```bash
cd frontend
```

### 3. Dependencies Install
```bash
npm install
```

### 4. .env Setup
```bash
VITE_API_URL="hosted_url_backend"
```

### 5. Start the frontend
```bash
npm run dev
```

## Backend Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Real-Time-Investment-Marketplace.git
cd Real-Time-Investment-Marketplace 
```

### 2. Enter directory
```bash
cd backend
```

### 3. Dependencies Install
```bash
npm install
```

### 4. .env Setup
```bash
PORT=8080
DATABASE_URL=
JWT_SECRET=
REDIS_PASSWORD=
RAZORPAY_KEY_ID=	
RAZORPAY_SECRET=
REDIS_URL=
```

### 5. Migrate data to database
```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Start Server
```bash
node src/server.js 
```
