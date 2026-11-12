# Online Library Management System

A starter MERN application with React (Vite), Express, MongoDB/Mongoose and JWT authentication.

## Requirements
- Node.js 18+
- MongoDB Atlas connection string or local MongoDB

## 1. Configure the backend
```bash
cd backend
copy .env.example .env
```
Open `.env` and set `MONGO_URI` to your MongoDB connection string and change `JWT_SECRET`.

Install and run:
```bash
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 2. Configure and run the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

## Included features
- User registration and login (JWT + bcrypt)
- Book catalogue, search and category filter
- Borrow and return books
- Reservations
- User borrowing history
- Admin book CRUD and basic dashboard statistics
- Protected admin routes

## First admin account
Register normally, then change that user's `role` to `admin` in the MongoDB `users` collection. Log out and log in again to receive an admin token.

## Notes
- This is an academic starter project. Email reminders, payment processing, production deployment hardening and automated tests are not included.
- Borrowing period is 14 days. Stock is adjusted when a book is borrowed or returned.
- Configure a real MongoDB URI before starting the backend.
