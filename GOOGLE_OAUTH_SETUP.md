# Google OAuth Setup Guide for Supabase

## 1. Google Cloud Console Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (now part of Google Identity)

### Step 2: Configure OAuth Consent Screen
1. Go to APIs & Services > OAuth consent screen
2. Choose "External" for user type
3. Fill in the required fields:
   - Application name: "Fintrack - Expense Tracker"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes: email, profile, openid
5. Save and continue

### Step 3: Create OAuth 2.0 Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:5174/auth/callback (for local development)
   ```
5. Save the Client ID and Client Secret

## 2. Supabase Configuration

### Step 1: Configure Google Provider
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Find Google and click "Configure"
4. Enable Google provider
5. Enter your Google OAuth credentials:
   - Client ID: from Google Cloud Console
   - Client Secret: from Google Cloud Console
6. Set redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

### Step 2: Update Site URL
1. Go to Authentication > Settings
2. Set Site URL to your production domain: `https://your-domain.com`
3. Add additional redirect URLs if needed

### Step 3: Configure Email Templates (Optional)
1. Go to Authentication > Email Templates
2. Customize the confirmation and recovery email templates

## 3. Environment Variables

Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 4. Testing

### Local Development
1. Start your dev server: `npm run dev`
2. Go to `/auth` page
3. Click "Continue with Google"
4. Complete OAuth flow
5. Should redirect back to your app

### Production
1. Deploy your app
2. Update redirect URIs in Google Cloud Console
3. Test the OAuth flow in production

## 5. Troubleshooting

### Common Issues:

1. **"Google authentication is not enabled"**
   - Check that Google provider is enabled in Supabase
   - Verify Client ID and Secret are correct

2. **Redirect URI mismatch**
   - Ensure redirect URIs match exactly in Google Cloud Console
   - Include both development and production URLs

3. **OAuth popup blocked**
   - Browser might be blocking popups
   - Try in incognito mode or different browser

4. **"popup_closed_by_user"**
   - User closed the OAuth popup
   - This is expected behavior when user cancels

### Debug Steps:
1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Supabase auth logs
4. Ensure Google Cloud Console settings match Supabase

## 6. Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for all sensitive data
- Regularly rotate your OAuth credentials
- Monitor OAuth usage in Google Cloud Console
- Set up proper CORS policies
