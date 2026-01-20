# CVision - AI-Powered Resume Analyzer

<div align="center">

![CVision Logo](https://img.shields.io/badge/CVision-AI%20Resume%20Analyzer-8b5cf6?style=for-the-badge&logo=sparkles&logoColor=white)

**Transform your resume into your competitive advantage**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 🌟 Overview

**CVision** is a cutting-edge, AI-powered resume analysis platform that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS) and stand out to recruiters. Built with modern web technologies and powered by advanced AI, CVision provides actionable insights to improve your chances of landing your dream job.

### ✨ Key Features

- 🤖 **AI-Powered Analysis** - Leverages Groq's Llama 3.3 70B model for intelligent resume evaluation
- 📊 **ATS Optimization** - Get specific tips to improve your ATS compatibility score
- 🎯 **Job-Specific Feedback** - Tailored analysis based on your target job description
- 📈 **Detailed Scoring** - Comprehensive breakdown across 4 key categories:
  - **Tone & Style** - Professional language and presentation
  - **Content** - Relevance and impact of your experience
  - **Structure** - Organization and readability
  - **Skills** - Technical and soft skills alignment
- 🎨 **Modern UI** - Beautiful, responsive design with glassmorphic effects
- 📱 **Fully Responsive** - Seamless experience across desktop, tablet, and mobile
- 🔒 **Secure** - Built-in authentication and row-level security

---

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **React Router v7** - File-based routing with SSR capabilities
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Beautiful, consistent icons

### Backend & Services
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Row Level Security (RLS)
- **Groq AI** - Ultra-fast LLM inference
  - Model: `llama-3.3-70b-versatile`
  - JSON mode for structured responses

### Libraries
- **PDF.js** - Client-side PDF rendering and text extraction
- **Groq SDK** - Official Groq API client

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Supabase** account ([sign up here](https://supabase.com))
- **Groq API** key ([get one here](https://console.groq.com))

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cvision.git
cd cvision
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key
```

**How to get these values:**

#### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy `Project URL` and `anon public` key

#### Groq
1. Visit [Groq Console](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key

### 4. Database Setup

Run these SQL commands in your Supabase SQL Editor:

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Storage Setup

In Supabase Dashboard:
1. Go to **Storage**
2. Create a new bucket named `resumes`
3. Set it to **Public** (for PDF previews)
4. Configure CORS if needed

---

## 🎯 Usage

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run start
```

---

## 📖 How It Works

### 1. **Upload Your Resume**
- Drag and drop or select a PDF file
- Enter the job title and description you're targeting
- Provide company name for context

### 2. **AI Analysis**
CVision performs a comprehensive analysis:
- Extracts text from your PDF
- Analyzes content against job requirements
- Evaluates ATS compatibility
- Generates detailed feedback

### 3. **Review Insights**
Get actionable feedback across multiple dimensions:
- **Overall Score** - Calculated from all categories
- **ATS Score** - Specific optimization tips
- **Category Breakdowns** - Detailed analysis of tone, content, structure, and skills
- **Recommendations** - Prioritized action items

### 4. **Optimize & Iterate**
- Review strengths and weaknesses
- Implement suggested improvements
- Re-analyze to track progress

---

## 🎨 Design Philosophy

CVision follows a **"Modern Professional"** design approach inspired by products like Linear, Raycast, and Vercel:

- **Deep Dark Mode** - Slate-950 background for reduced eye strain
- **Glassmorphism** - Frosted glass effects for depth and elegance
- **Gradient Accents** - Violet-to-fuchsia gradients for visual interest
- **Smooth Animations** - CSS-based transitions for performance
- **Responsive Design** - Mobile-first approach

---

## 📁 Project Structure

```
cvision/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Accordion.tsx
│   │   ├── ATS.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Details.tsx
│   │   ├── FileUploader.tsx
│   │   ├── Navbar.tsx
│   │   ├── ScoreBadge.tsx
│   │   ├── ScoreCircle.tsx
│   │   ├── ScoreGauge.tsx
│   │   └── Summary.tsx
│   ├── lib/                 # Utilities
│   │   ├── pdf2img.ts       # PDF processing
│   │   ├── supabase.ts      # Supabase client
│   │   └── utils.ts         # Helper functions
│   ├── routes/              # Pages
│   │   ├── auth.tsx         # Authentication
│   │   ├── home.tsx         # Dashboard
│   │   ├── resume.tsx       # Resume detail view
│   │   ├── upload.tsx       # Upload & analyze
│   │   └── api.analyze.ts   # AI analysis API
│   ├── services/
│   │   └── ai.server.ts     # Groq AI integration
│   ├── app.css              # Global styles
│   └── routes.ts            # Route configuration
├── scripts/                 # Utility scripts
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔐 Security

CVision implements multiple security layers:

- **Row Level Security (RLS)** - Database-level access control
- **Server-Side API Keys** - Groq API key never exposed to client
- **Authentication Tokens** - JWT-based session management
- **Input Validation** - All user inputs are validated
- **HTTPS Only** - Enforced in production

---

## 🚀 Deployment

### Recommended Platforms

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Backend (Supabase)
Already hosted! Just ensure your environment variables are set correctly.

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
GROQ_API_KEY=your_groq_api_key
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Groq** - For providing ultra-fast AI inference
- **Supabase** - For the amazing backend platform
- **React Router** - For the excellent routing solution
- **Tailwind CSS** - For the utility-first CSS framework

<div align="center">

**Built with ❤️ by the Sanatan Singh Vishen**

</div>
