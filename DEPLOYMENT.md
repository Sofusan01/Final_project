# Deployment Guide

## Option 1: Deploy to Vercel (Recommended)

Vercel is the best platform for Next.js applications with automatic deployments, preview deployments, and excellent performance.

### Steps:
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Set environment variables if needed
   - Deploy

### Environment Variables (if needed):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Option 2: Deploy to Firebase Hosting

### Steps:
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

### Note:
- This creates a static export in the `out` directory
- Client-side routing will work but with some limitations
- Make sure all environment variables are set in Firebase console

## Option 3: Deploy to Netlify

### Steps:
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   npm install -g netlify-cli
   netlify deploy --dir=out --prod
   ```

## Environment Variables Setup

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## Pre-deployment Checklist

- [ ] All environment variables are set
- [ ] Firebase project is configured
- [ ] Supabase project is configured
- [ ] Build passes without errors
- [ ] Navigation works correctly
- [ ] Authentication flows work
- [ ] Database connections are working

## Troubleshooting

### Navigation Issues:
- If using Firebase hosting, the static export may have routing limitations
- Consider using Vercel for better Next.js support

### Build Errors:
- Check that all dependencies are installed
- Verify TypeScript compilation passes
- Ensure all imports are correct

### Environment Variables:
- Make sure all `NEXT_PUBLIC_` variables are set in your deployment platform
- Test locally with `.env.local` file 