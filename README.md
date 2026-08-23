# Dinolibre - MERN Stack Application

A full-stack web application built with MongoDB, Express, React, and Node.js (MERN).

## Project Structure

```
dinolibre/
├── server/              # Express backend server
│   ├── package.json
│   ├── server.js       # Entry point
│   ├── .env.example    # Environment variables template
│   ├── routes/         # API route handlers
│   ├── models/         # MongoDB models
│   └── middleware/     # Custom middleware
├── client/             # React frontend (Vite)
│   ├── package.json
│   ├── src/
│   ├── public/
│   └── vite.config.js
├── package.json        # Root package.json for concurrently running
├── .gitignore
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas connection string)

### Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the `server` directory
   - Update MongoDB connection string and other variables

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   - Backend runs on: `http://localhost:5000`
   - Frontend runs on: `http://localhost:5173`

## Running Individually

- **Backend only:** `npm run server`
- **Frontend only:** `npm run client`

## Technologies

- **Frontend:** React, Vite, Oxlint
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Development:** Nodemon, Concurrently

## License

ISC
