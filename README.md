# AuthEngine

A production-ready authentication and authorization system built with Node.js, Express, MongoDB, JWT, OTP, OAuth2, session management, and role-based access control.

AuthEngine demonstrates how modern authentication systems are designed in real-world applications with support for:

- Email/Password Authentication
- OTP Authentication
- Google OAuth
- GitHub OAuth
- Admin 2FA Security
- Multi-device Session Handling
- Refresh Token Rotation
- Secure Cookie Authentication
- RBAC (Role-Based Access Control)

---

# Live Demo

Frontend: https://authengine.netlify.app

Backend API: https://authengine-production.up.railway.app

---

# Features

## Authentication Methods

### User Authentication

Users can login using:

- Email + Password
- OTP Login
- Google OAuth
- GitHub OAuth

### Admin Authentication (2FA)

Admins have stricter security rules.

Admin login requires:

- Email + Password + OTP
OR
- OAuth + OTP

Admins are NOT allowed to directly login using OTP-only authentication.

---

# Authentication Flows

## 1. Email & Password Login

```txt
User enters email/password
→ Credentials verified
→ Access Token + Refresh Token generated
→ User logged in


# Tech Stack

Backend:-
 Node.js
 Express.js
 MongoDB
 Mongoose
 JWT
 OAuth APIs
 Express Session
 Connect Mongo
 bcrypt


Frontend:-
 React.js
 React Router
 Context API
 Axios
 Tailwind CSS
 React Hot Toast


# Security Features

JWT Authentication
Access Tokens
Refresh Tokens
OTP Tokens
Reset Tokens
Secure Cookie Handling

# Cookies use:

httpOnly
secure
sameSite protection
Session Management
Multi-device login support
Session persistence using MongoDB
Logout from current device
Logout from all devices
OTP Security
OTP hashing using bcrypt
OTP expiry
OTP invalidation after use
Attempt tracking
Resend OTP support
OAuth Security

# Implemented protections:

CSRF state validation
Verified email enforcement
Provider account linking validation
Account takeover prevention
Password Security
Password hashing using bcrypt
Password reset flow
Secure reset token validation
Additional Security
Rate limiting
Account blocking
Protected admin routes
Error handling middleware
Secure environment configuration


# Project Structure
AuthEngine/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── models/
│   ├── utils/
│   ├── configs/
│   └── scripts/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── services/
│   └── app/


# Environment Variables

PORT=
MONGO_URL=

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
OTP_TOKEN_SECRET=
RESET_TOKEN_SECRET=

ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=
OTP_TOKEN_EXPIRY=
RESET_TOKEN_EXPIRY=

SESSION_SECRET=

FRONTEND_SUCCESS_REDIRECT_URL=
FRONTEND_FAILURE_REDIRECT_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=


# API Features
Auth APIs
Register
Login
Logout
Logout All Devices
Get Current User
Change Password
Forgot Password
Reset Password
OTP APIs
Send OTP
Verify OTP
Resend OTP
OAuth APIs
Google OAuth
GitHub OAuth
Deployment

Frontend deployed on:

Netlify

Backend deployed on:

Railway

Database:

MongoDB Atlas
Learning Goals of This Project

This project was built to deeply understand:

# Real-world authentication systems
OAuth2 flows
Session handling
JWT architecture
Security best practices
RBAC implementation
Multi-step authentication flows
Production deployment challenges
Future Improvements

# Planned improvements:

Redis-based OTP storage
Advanced rate limiting
Queue-based email handling
Device management dashboard
Audit logs
Refresh token rotation tracking
Group/session monitoring
WebAuthn / Passkeys


Author
Piyush Rai