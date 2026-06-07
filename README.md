# CVision - AI-Powered Resume Analyzer

<div align="center">

![CVision Logo](https://img.shields.io/badge/CVision-AI%20Resume%20Analyzer-8b5cf6?style=for-the-badge&logo=sparkles&logoColor=white)

**Transform your resume into your competitive advantage**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat&logo=redis&logoColor=white)](https://upstash.com/)

</div>

---

## 🌟 Overview

**CVision** is a cutting-edge, AI-powered resume analysis platform that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS) and stand out to recruiters. Built with modern web technologies, backed by a robust job-queue architecture, and powered by advanced AI, CVision provides actionable insights to improve your chances of landing your dream job.

### ✨ Key Features

- 🤖 **AI-Powered Analysis** - Leverages Groq's Llama 3.3 70B model for ultra-fast, intelligent resume evaluation
- 📊 **ATS Optimization** - Get specific tips to improve your ATS compatibility score
- 🎯 **Job-Specific Feedback** - Tailored analysis based on your target job description and company
- 📈 **Detailed Scoring** - Comprehensive breakdown across key categories (Tone & Style, Content, Structure, Skills)
- ⚡ **High-Performance Architecture** - Backed by Redis caching, BullMQ background jobs, and robust rate limiting
- 🎨 **Modern UI** - Beautiful, responsive design with glassmorphic effects and real-time polling updates
- 🔒 **Secure** - Built-in JWT authentication and Row Level Security (RLS) via Supabase

---

## 🚀 Tech Stack

### Frontend (`/app`)
- **React 19** & **React Router v7** - Modern SPA framework and routing
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth UI animations
- **Lucide React** - Beautiful, consistent icons

### Backend (`/backend`)
- **Node.js & Express** - Robust API server
- **TypeScript** - Type-safe development across the stack
- **BullMQ** - Reliable background job processing
- **Upstash Redis** - Used for:
  - Strict Sliding-Window Rate Limiting (10/hr, 25/day)
  - SHA-256 Prompt Caching to save AI tokens on identical requests
  - TCP connections for the background queue worker
- **Groq AI** - Ultra-fast LLM inference (`llama-3.3-70b-versatile`)
- **Zod** - Schema validation and structured LLM JSON parsing

### Database
- **Supabase (PostgreSQL)** - Stores users, usage logs, resumes, and analysis feedback

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ installed
- **npm** or **yarn** package manager
- **Supabase** account ([sign up here](https://supabase.com))
- **Groq API** key ([get one here](https://console.groq.com))
- **Upstash Redis** database ([create one free here](https://upstash.com))

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cvision.git
cd cvision
```

### 2. Install Dependencies

Install dependencies for both the frontend and the backend.

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup

Copy `.env.example` to `.env` in both the root folder and the `/backend` folder.

#### Root `.env` (Frontend)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

#### `/backend/.env` (Backend)
```env
PORT=3000
ALLOWED_ORIGIN=http://localhost:5173

# Supabase Admin access
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Upstash Redis (Rate Limiting & Caching)
UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Upstash Redis (BullMQ Job Queue)
UPSTASH_REDIS_URL=rediss://default:password@your-upstash-url:port
```

### 4. Database Setup

Run these SQL commands in your Supabase SQL Editor to set up the tables and policies:

```sql
-- Create resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  job_title TEXT,
  job_description TEXT,
  resume_path TEXT,
  image_path TEXT,
  feedback JSONB,
  status TEXT DEFAULT 'pending',
  overall_score INTEGER,
  analysis_version INTEGER DEFAULT 1,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  company_name TEXT,
  job_title TEXT,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  cache_hit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create basic policies
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);
```

---

## 🎯 Usage

To run the application locally, you need to start both the backend server and the frontend development server.

### Start the Backend
```bash
cd backend
npm run dev
```

### Start the Frontend
In a new terminal window:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

---

## 🏗️ Architecture

CVision utilizes a highly scalable, decoupled architecture designed for heavy AI workloads:

1. **Authentication:** The frontend authenticates directly with Supabase. The session JWT is sent to the Express backend.
2. **Rate Limiting:** The backend checks the JWT against an Upstash Redis sliding window.
3. **Queueing:** If rate limits allow, the backend immediately enqueues an `AnalysisJob` into BullMQ and returns a `jobId` to the frontend.
4. **Processing & Caching:** The BullMQ Worker picks up the job. It first generates a SHA-256 hash of the inputs. If a cached analysis exists in Redis, it skips Groq entirely. If not, it requests a structured JSON analysis from Llama 3.3 70B, caches the result, and writes it back to Supabase securely via the Service Role key.
5. **Polling:** The frontend polls the `/job/:jobId` endpoint every 2 seconds, updating a progress bar until completion, then redirects to the final `/resume/:id` dashboard.

---

## 🔐 Security

- **Row Level Security (RLS)** ensures users can only read/write their own data on the frontend.
- **Server-Side AI & DB Admin:** The `GROQ_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are kept strictly in the Node.js backend.
- **DDoS Protection:** IP & User-based rate limiting on all analysis routes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

**Built with ❤️ by Sanatan Singh Vishen**

</div>
