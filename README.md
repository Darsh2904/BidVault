# BidVault
BidVault is a modern auction platform where buyers and sellers can trade high-value items with more confidence.
The idea is simple: make online auctions feel exciting, but keep payments safe through an escrow-style flow.

# This project includes:

A React frontend for browsing, bidding, account dashboards, and admin actions
A Node.js and Express backend with MongoDB for auth, listings, approvals, and payment workflows
Razorpay integration for secure payment collection and escrow state tracking
What Makes BidVault Different
Most auction apps either feel outdated or risky when money is involved.
BidVault focuses on both:

A clean, fast user experience
A safer transaction lifecycle from listing to payment release
The platform supports role-based behavior for:

Buyer and Seller users
Admin users for moderation and control
Core Features
Authentication and Access
OTP-enabled signup and login flow
JWT-based protected APIs
Admin approval flow for elevated access
Blocked email handling for abuse prevention
Auction Lifecycle
Sellers can create listings with category, condition, bids, and details
Admin reviews listings and approves or rejects them
Approved listings appear in Browse
Sold or payment-locked items are removed from live Browse visibility
Escrow Payment Flow
Razorpay order creation from approved listings
Payment confirmation with signature verification
Escrow state transitions such as unpaid, escrow held, release requested, released, and disputed
Buyer, seller, and admin actions for post-payment states
Notifications and Dashboard
In-app notifications for approvals, rejections, and payment milestones
Dashboard views for user activity, listings, and escrow transactions
Seller-focused listing visibility and status updates
UI and Experience
Shared theme system for light and dark mode
Unified typography and color behavior across major screens
Responsive layout for desktop and mobile
INR currency display throughout key user flows

# Tech Stack
Frontend:
-React
-React Router
-Vite

# Backend:
-Node.js
-Express
-MongoDB with Mongoose
-JWT Auth

# Payments:
-Razorpay Checkout
-Webhook signature verification
-Escrow transaction tracking

# Project Structure
-frontend/src: frontend app code
-frontend/src/components: pages and major UI views
-frontend/src/context: authentication and theme context providers
-frontend/src/utils: frontend API helper layer
-backend/src/controllers: backend request handlers
-backend/src/models: MongoDB schemas
-backend/src/routes: API route definitions
-backend/src/utils: payment and helper utilities

# Local Setup
-Prerequisites
-Node.js 18+
-MongoDB running locally
-Razorpay account for payment testing

# Install Dependencies 
In frontend folder:
cd frontend
npm install

In backend folder:
cd backend
npm install

# Environment Variables
Create backend environment values for:

PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
MAIL_FROM
PAYMENT_GATEWAY
PAYMENT_CURRENCY
PAYMENT_PLATFORM_FEE_PERCENT
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET

# Run the App
Frontend:
cd frontend
npm run dev

Backend:
cd backend
npm run dev

Then open:
http://localhost:5173

# Payment Testing Notes
-In Razorpay test mode, QR scanning can be inconsistent in some cases
-If QR is not reliable, test checkout with other available payment options first
-Merchant branding shown in checkout can depend on the connected Razorpay account profile
-For production-like behavior, live keys and completed Razorpay account setup are required

# API Highlights
-Auth and profile routes for login and session handling
-Auction routes for creation, moderation, approved listings, and personal listings
-Payment routes for escrow order creation, confirmation, release, dispute, and user transaction history
-Notification routes for user updates and system events

# Current Status
-BidVault is production-minded but still evolving.
-Core flows are functional:

-Listing creation and approval
-Browse and auction detail
-Escrow payment initiation and confirmation
-Role-based dashboards and transaction visibility

# Roadmap Ideas
Real-time bidding updates with sockets
Better listing analytics for sellers
Stronger dispute workflow and admin tooling
Automated payout and refund control panel
Improved audit logs for payment and state transitions

# Author
Built by Darsh Patel and contributors as a practical MERN project focused on trust-first auctions.

# License
This project is licensed under the MIT License. See LICENSE for details.
