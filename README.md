# BidVault MERN Authentication System

This project now includes a full authentication flow with React frontend and Node.js + Express + MongoDB backend.

## Features Implemented

- Login / Signup button in navbar (top-right).
- Signup with Name, Email, Password, Role (Buyer/Seller or Admin).
- Email OTP verification before signup completion.
- Login with JWT-based authentication.
- Role-based route protection:
	- Admin -> Admin Dashboard
	- Buyer/Seller -> User Home
- Admin approval workflow for new admin signups.
- Password hashing with bcrypt.
- Persisted login using localStorage token.
- Logout support.
- Username shown in navbar after login.

## Folder Structure

### Frontend

- src/context/AuthContext.jsx
- src/utils/authApi.js
- src/components/AuthPage.jsx
- src/components/ProtectedRoute.jsx
- src/components/AuthNavActions.jsx

### Backend

- backend/src/server.js
- backend/src/config/db.js
- backend/src/models/User.js
- backend/src/controllers/authController.js
- backend/src/middleware/auth.js
- backend/src/routes/authRoutes.js
- backend/src/utils/sendOtpEmail.js
- backend/src/utils/token.js

## User Model Fields

- name
- email
- password (hashed)
- role (buyer_seller or admin)
- isVerified

Additional fields used for workflow:

- isAdminApproved
- otpHash
- otpExpiresAt

## Setup Instructions

## 1) Backend Setup

1. Open terminal in backend folder.
2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Update backend/.env values:

- MONGODB_URI
- JWT_SECRET
- CLIENT_URL
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (for real email OTP)
- PAYMENT_GATEWAY (mock, razorpay, stripe)
- PAYMENT_CURRENCY (INR recommended)
- PAYMENT_PLATFORM_FEE_PERCENT (example: 2)
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (when using Razorpay)
- RAZORPAY_WEBHOOK_SECRET (for Razorpay webhook signature validation)
- STRIPE_SECRET_KEY (when using Stripe)

5. Start backend:

```bash
npm run dev
```

Backend base URL: http://localhost:5000/api

## 2) Frontend Setup

From project root:

```bash
npm install
npm run dev
```

Frontend URL: http://localhost:5173

Optional frontend env:

- VITE_API_URL=http://localhost:5000/api

## API Endpoints

- POST /api/auth/signup/request-otp
- POST /api/auth/signup/verify-otp
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/admin-requests (admin only)
- POST /api/auth/admin-requests/:userId/approve (admin only)

### Payment & Escrow APIs

- GET /api/payments/me
- POST /api/payments/create-escrow-order
- POST /api/payments/confirm-payment
- POST /api/payments/:transactionId/request-release
- POST /api/payments/:transactionId/release
- POST /api/payments/:transactionId/dispute

## Admin Approval Logic

- First admin can be auto-approved if no approved admin exists.
- Any later admin signup remains pending until an approved admin approves it.
- Pending admin cannot log in to dashboard until approved.

## Notes

- In development (non-production), OTP is also returned in API response as devOtp for easier testing.
- For production, configure SMTP and set NODE_ENV=production to disable dev OTP exposure.
