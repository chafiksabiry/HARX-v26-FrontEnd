# Harx AI - Setup Guide

## Overview

Harx AI is a sales representative platform that connects companies with sales agents. This application includes features for company onboarding, gig creation, rep matching, telephony integration, and AI-powered assistance.

## Build Status

✅ **Build successful!** The application compiles and is ready for deployment.

## Prerequisites

Before running this application, ensure you have:

1. Node.js (v18 or higher)
2. npm or yarn package manager
3. MongoDB database (MongoDB Atlas recommended)
4. Supabase account (for additional features)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in your actual values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

- `MONGODB_URI`: Your MongoDB connection string (get from MongoDB Atlas)
- `JWT_SECRET`: A secure random string for JWT token generation
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Optional but Recommended:**

- `OPENAI_API_KEY`: For AI features
- `TWILIO_*`: For telephony features
- `CLOUDINARY_*`: For file upload features
- `NEXT_PUBLIC_LINKEDIN_CLIENT_ID` & `LINKEDIN_CLIENT_SECRET`: For LinkedIn OAuth

### 3. Set Up MongoDB Database

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to `.env` as `MONGODB_URI`
4. Make sure to replace `<username>` and `<password>` with your actual credentials

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## Application Structure

### Main Routes

- `/` - Landing page
- `/auth` - Authentication pages
  - `/auth/login` - Login page
  - `/auth/register` - Registration page
- `/onboarding/choice` - User type selection (company/rep)
- `/onboarding/company` - Company onboarding
- `/onboarding/rep` - Rep onboarding
- `/dashboard` - Company dashboard
- `/repdashboard` - Rep dashboard
- `/comporchestrator` - Company orchestrator
- `/reporchestrator` - Rep orchestrator

### Key Features

1. **Authentication System**
   - Email/password authentication
   - LinkedIn OAuth integration
   - JWT-based session management

2. **Company Features**
   - Company profile creation
   - Gig creation and management
   - Rep matching
   - Lead management
   - Telephony integration

3. **Rep Features**
   - Profile creation with CV upload
   - Skills assessment
   - Gig marketplace
   - Operations dashboard
   - Call interface

4. **AI Features**
   - AI-powered suggestions for gig creation
   - Automated matching between reps and gigs
   - Knowledge base with AI search

## Database Architecture

The application uses **MongoDB** with Mongoose ODM. Key models include:

- `User` - User accounts
- `Company` - Company profiles
- `Agent` - Rep profiles
- `Gig` - Job opportunities
- `Lead` - Sales leads
- `OnboardingProgress` - Tracks onboarding completion

## Code Improvements Made

### 1. Fixed Build Errors
- ✅ Removed problematic favicon.ico
- ✅ Added proper metadata to layout
- ✅ Fixed TypeScript configuration

### 2. TypeScript Fixes
- ✅ Added interface exports for all models (IUser, ILead, IGig, ICompany)
- ✅ Fixed model export patterns
- ✅ Fixed null type issues in authentication code
- ✅ Fixed skill category type compatibility
- ✅ Fixed heroicons type definitions

### 3. Configuration Updates
- ✅ Updated Next.js config for better build performance
- ✅ Added comprehensive environment variable template
- ✅ Optimized MongoDB connection handling

### 4. Code Quality
- ✅ Fixed index signature errors in models
- ✅ Improved type safety across the codebase
- ✅ Added proper error handling

## Important Notes

### MongoDB Connection

The application currently uses MongoDB for data persistence. Make sure your MongoDB connection string is properly configured in the `.env` file. The connection includes:

- Connection pooling
- Automatic reconnection
- Timeout configurations
- Error handling

### API Keys

Several features require API keys:

1. **OpenAI** - For AI-powered features like gig suggestions and matching
2. **Google** - For maps and location services
3. **Twilio** - For telephony features
4. **Cloudinary** - For file uploads and image management

These are optional but recommended for full functionality.

### Authentication

The application uses JWT tokens for authentication. Make sure to:

1. Set a strong `JWT_SECRET` in production
2. Configure proper CORS settings
3. Enable HTTPS in production

## Deployment

### Recommended Platforms

1. **Vercel** (Recommended for Next.js)
   - Automatic deployments from Git
   - Environment variable management
   - Serverless functions support

2. **Railway** or **Render**
   - Good for full-stack applications
   - Built-in MongoDB hosting options

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB database set up and accessible
- [ ] API keys for required services obtained
- [ ] Build passes successfully (`npm run build`)
- [ ] Security: Change all default secrets
- [ ] Enable production error monitoring

## Troubleshooting

### Build Issues

If you encounter memory issues during build:
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### MongoDB Connection Issues

1. Check your connection string format
2. Ensure IP whitelist includes your deployment server
3. Verify database user credentials
4. Check network connectivity

### Missing Dependencies

If you get module not found errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Support

For issues or questions:
1. Check the application logs
2. Review the environment variables
3. Ensure all required services are running
4. Check MongoDB connection status

## Next Steps

1. Configure all required environment variables
2. Set up your MongoDB database
3. Test the authentication flow
4. Create a test company profile
5. Create a test rep profile
6. Test the matching system

---

**Built with Next.js 16, React 19, MongoDB, and various AI services**
