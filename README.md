# SecureShare — Controlled File Sharing Platform

> **SecureShare** is a controlled file-sharing SaaS application built for high-security file distribution. It gives users granular authority over **who** can access their files, **how long** they remain accessible, and **how many times** they can be downloaded. Every shared file has an explicit access policy and a complete audit trail.

---

## 🌟 Core Differentiators

| Control Dimension | Feature Description |
| :--- | :--- |
| **WHO?** | **Restricted User Access Control**: Share files exclusively with specified registered user email addresses. |
| **WHEN?** | **Automated Expiry Policy**: Links automatically lock after 1h, 6h, 24h, 7d, or a custom timestamp. |
| **HOW?** | **Hashed Passcode Protection**: Optional password protection verified server-side with bcrypt hashing. |
| **HOW MANY?** | **Download Counter & Limits**: Auto-lock access after reaching designated max download quota. |
| **WHAT HAPPENED?** | **Audit Activity Log**: Comprehensive timestamped history tracking every upload, share creation, download, and revocation. |
| **CAN I STOP IT?** | **Instant Access Revocation**: Owners can revoke active share links immediately with zero latency. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT Interceptor
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Dropzone**: React Dropzone

### Backend
- **Runtime**: Node.js & Express.js
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Multipart Uploads**: Multer
- **Storage Service**: Cloudinary (Abstraction ready for AWS S3)

### Database
- **Database**: MongoDB Atlas with Mongoose ODM
- **Indexes**: Compound indexes on `ownerId`, `token`, `status`, and `expiresAt`

---

## 📁 Repository Structure

```
secure-share/
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── FileUploadModal.jsx
│   │   │   ├── SecureShareModal.jsx
│   │   │   └── SecuritySummaryCard.jsx
│   │   ├── context/             # React AuthContext
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/             # Responsive Layouts
│   │   │   └── Layout.jsx
│   │   ├── pages/               # Application Pages
│   │   │   ├── ActivityPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Files.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SharedFiles.jsx
│   │   │   └── ShareView.jsx
│   │   ├── services/            # Axios API config
│   │   │   └── api.js
│   │   ├── utils/               # Formatting helpers
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # MongoDB & Cloudinary config
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   ├── middleware/          # Auth & Multer upload middleware
│   │   │   ├── auth.js
│   │   │   └── upload.js
│   │   ├── models/              # Mongoose Data Models
│   │   │   ├── User.js
│   │   │   ├── File.js
│   │   │   ├── Share.js
│   │   │   ├── Download.js
│   │   │   └── Activity.js
│   │   ├── routes/              # REST API Controllers & Routes
│   │   │   ├── activity.js
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── files.js
│   │   │   ├── publicShare.js
│   │   │   ├── shares.js
│   │   │   └── users.js
│   │   ├── services/            # Storage abstraction service
│   │   │   └── storage.js
│   │   ├── utils/               # Token & helper generators
│   │   │   └── helpers.js
│   │   └── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL or local MongoDB instance
- Cloudinary credentials (free tier supported)

### 1. Environment Configuration

Copy `.env.example` to `server/.env` and update credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/secureshare?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies

From the root directory:

```bash
npm run install:all
```

### 3. Run Development Environment

Run backend server and frontend client concurrently:

```bash
npm run dev
```

- **Client App**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 🔌 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create account & return JWT
- `POST /api/auth/login` - Authenticate & return JWT
- `GET /api/auth/me` - Fetch authenticated profile

### Files
- `POST /api/files/upload` - Secure file upload
- `GET /api/files` - List user files with search/filter
- `GET /api/files/:id` - File detail audit data
- `GET /api/files/:id/download` - Owner file download stream
- `DELETE /api/files/:id` - Soft delete file & revoke active links

### Shares
- `POST /api/shares` - Generate share policy with tokens, expiry, and limits
- `GET /api/shares` - List shared policies with status breakdown
- `POST /api/shares/:id/revoke` - Instant revocation

### Public Shared Links
- `GET /api/share/:token` - Retrieve public share info & verify authorization
- `POST /api/share/:token/verify` - Verify share password
- `GET /api/share/:token/download` - Download stream with quota checking

---

## 🚀 Live Demo Workflow (Hackathon Verification Flow)

1. **User Registers & Logs in** -> Navigates to Dashboard.
2. **File Upload** -> Uploads `Project_Report.pdf` (stored in Cloudinary, metadata in MongoDB).
3. **Configure Sharing** -> Clicks **Share**, adds recipient email, sets 24-hour expiry, enables passcode, sets download limit = 2.
4. **Link Generation** -> System produces cryptographically random token URL & short code.
5. **Recipient Verification** -> Recipient opens link, passes authorization check, verifies passcode, downloads file.
6. **Audit & Revoke** -> Owner views download in Activity log and clicks **Revoke Access**. Next attempt by recipient receives **"ACCESS REVOKED"**.

---

## 🔒 Security Practices
- Password Hashing using `bcrypt` (12 rounds).
- JWT Token expiration & header authorization.
- Server-side access control validation (never client-only security).
- Helmet & Express Rate Limiting against brute-force attacks.
