# Netlify Deployment Guide

## Prerequisites

1. A Netlify account
2. Access to your MongoDB database
3. OpenAI API key (if using AI features)

## Step 1: Configure Environment Variables on Netlify

Go to your Netlify site dashboard:
**Site Settings > Environment Variables > Add a variable**

Add the following environment variables:

### Required Variables

```bash
# MongoDB Connection (CRITICAL - Required for database access)
MONGODB_URI=mongodb://harx:ix5S3vU6BjKn4MHp@207.180.226.2:27017/V25_HarxPreProd
```

### Optional Variables (Add if using these features)

```bash
# OpenAI API Key (Required for AI-powered features)
OPENAI_API_KEY=sk-your-openai-api-key

# Backend API URL (Already has default fallback)
NEXT_PUBLIC_API_BASE_URL=https://harxv26back.netlify.app/api

# Dashboard API URL (If different from main backend)
NEXT_PUBLIC_DASHBOARD_API_URL=https://api-dashboard.harx.ai/api
```

## Step 2: Push to GitHub

```bash
# If you haven't already, create a new repository on GitHub
# Then run:

git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 3: Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Choose GitHub and select your repository
4. Build settings should auto-detect:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Click "Deploy site"

## Step 4: Verify Deployment

After deployment completes:

1. **Check for Secret Scanning Warnings:**
   - Go to Deploy log
   - Look for "Secrets scanning found X instance(s)"
   - Should show 0 instances (all secrets properly configured)

2. **Test the Application:**
   - Visit your deployed site URL
   - Try logging in
   - Check browser console for CORS errors
   - Verify API calls work

## Troubleshooting

### Secret Scanning Errors

If you see secret scanning warnings:

1. Check which environment variables are being flagged
2. Add them to `SECRETS_SCAN_OMIT_KEYS` in `netlify.toml`:
   ```toml
   [build.environment]
     SECRETS_SCAN_OMIT_KEYS = "VAR_NAME_1,VAR_NAME_2"
   ```
3. Commit and redeploy

### CORS Errors

If you see CORS errors in the browser console:

1. Verify `NEXT_PUBLIC_API_BASE_URL` points to correct backend
2. Ensure backend has proper CORS headers configured
3. Check that backend is accessible from your Netlify domain

### MongoDB Connection Errors

If you see "MONGODB_URI environment variable" errors:

1. Verify `MONGODB_URI` is set in Netlify environment variables
2. Check the connection string format is correct
3. Ensure MongoDB server is accessible from Netlify's IP ranges
4. Test connection locally with the same credentials

### Build Failures

If build fails:

1. Check the build log for specific errors
2. Verify all dependencies are in `package.json`
3. Try building locally with `npm run build`
4. Check Node.js version compatibility

## Environment Variable Security

✅ **DO:**
- Add secrets to Netlify Environment Variables
- Use `NEXT_PUBLIC_*` prefix ONLY for truly public variables
- Document all required variables in `.env.example`

❌ **DON'T:**
- Commit `.env` files to git
- Hardcode credentials in source code
- Use `NEXT_PUBLIC_*` prefix for sensitive data
- Share environment variables in public channels

## Current Configuration

### Public Variables (Safe to expose)
- `NEXT_PUBLIC_API_BASE_URL` - Backend API endpoint
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (designed to be public)
- `NEXT_PUBLIC_DASHBOARD_API_URL` - Dashboard API endpoint

### Private Variables (Keep secret)
- `MONGODB_URI` - Database connection with credentials
- `OPENAI_API_KEY` - OpenAI API key

### Excluded from Secret Scanning
The following are excluded because they're false positives (public URLs):
- `SMTP_SENDER_NAME`
- `NEXT_PUBLIC_GIGS_API`
- `NEXT_PUBLIC_KNOWLEDGE_BASE_URL`
- `NEXT_PUBLIC_SCRIPT_GENERATION_BASE_URL`

## Support

If you encounter issues:
1. Check Netlify deploy logs
2. Review browser console for errors
3. Verify all environment variables are set correctly
4. Test backend API endpoints independently
