# Admin Credentials Setup for Hosted Environment

## Problem
The admin login system was reading credentials from a local `admin-credentials.json` file, which doesn't work in hosted environments (like Vercel, AWS Amplify, Netlify, etc.) because:
- The file system is typically read-only
- Local files may not be deployed or accessible
- Security best practice is to use environment variables

## Solution
The system now uses environment variables for admin credentials in production, with automatic fallback to the local file in development.

## Priority Order
1. **Environment Variables** (Production) - `ADMIN_EMAIL` and `ADMIN_PASSWORD`
2. **Local File** (Development) - `admin-credentials.json`
3. **Default Fallback** - Built-in defaults (not recommended for production)

## Setup Instructions

### For Hosted Environments (Production)

#### Step 1: Set Environment Variables

Add these environment variables to your hosting platform:

**AWS Amplify:**
```bash
# In AWS Amplify Console:
# 1. Go to App Settings > Environment variables
# 2. Add these variables:

ADMIN_EMAIL=isaac@rightimagedigital.com
ADMIN_PASSWORD=Mommy1960!
```

**Vercel:**
```bash
# In Vercel Dashboard:
# 1. Go to Project Settings > Environment Variables
# 2. Add these variables for Production, Preview, and Development:

ADMIN_EMAIL=isaac@rightimagedigital.com
ADMIN_PASSWORD=Mommy1960!
```

**Netlify:**
```bash
# In Netlify Dashboard:
# 1. Go to Site Settings > Build & Deploy > Environment
# 2. Add these variables:

ADMIN_EMAIL=isaac@rightimagedigital.com
ADMIN_PASSWORD=Mommy1960!
```

#### Step 2: Redeploy Your Application

After adding the environment variables, trigger a new deployment:

**AWS Amplify:**
```bash
# Either push to your git branch or:
# In Amplify Console, click "Redeploy this version"
```

**Vercel:**
```bash
# Either push to your git branch or:
vercel --prod
```

**Netlify:**
```bash
# Either push to your git branch or:
# In Netlify Dashboard, click "Trigger deploy"
```

### For Local Development

Your local environment will continue to use the `admin-credentials.json` file automatically. No changes needed!

Current credentials from your local file:
- Email: `isaac@rightimagedigital.com`
- Password: `Mommy1960!`

## Testing

### Test Local Development
```bash
npm run dev
# Visit http://localhost:3000/admin/login
# Login with your credentials
```

### Test Production
```bash
# After deploying with environment variables set:
# Visit https://your-domain.com/admin/login
# Login with your credentials
```

## Security Recommendations

1. **Change Default Password**: After setting up, consider changing your admin password
2. **Use Strong Passwords**: Use a password manager to generate a strong password
3. **Don't Commit Credentials**: Never commit passwords to your git repository
4. **Rotate Regularly**: Change admin password periodically
5. **Use AWS Secrets Manager**: For enhanced security, consider using AWS Secrets Manager (optional)

## Using AWS Secrets Manager (Advanced - Optional)

For even better security, you can store admin credentials in AWS Secrets Manager:

### Step 1: Create Secrets
```bash
# Create admin email secret
aws secretsmanager create-secret \
  --name "qrewards/admin-email" \
  --description "Admin email for QRewards" \
  --secret-string "isaac@rightimagedigital.com" \
  --region us-west-1

# Create admin password secret
aws secretsmanager create-secret \
  --name "qrewards/admin-password" \
  --description "Admin password for QRewards" \
  --secret-string "Mommy1960!" \
  --region us-west-1
```

### Step 2: Update Code to Use Secrets Manager
If you want to use Secrets Manager, we'll need to modify `src/lib/admin-credentials.ts` to fetch from Secrets Manager similar to how OpenAI keys are handled.

## Troubleshooting

### Issue: "Invalid email or password" in production
**Solution:** 
- Verify environment variables are set correctly in your hosting platform
- Check for typos in variable names (must be exactly `ADMIN_EMAIL` and `ADMIN_PASSWORD`)
- Ensure you triggered a new deployment after adding the variables
- Check deployment logs for any errors

### Issue: Environment variables not being read
**Solution:**
- Restart your hosting platform's build/deployment
- Clear any cache in your hosting platform
- Verify the environment variables are set for the correct environment (Production/Preview)
- Check if your hosting platform requires a specific prefix (e.g., `NEXT_PUBLIC_`)

### Issue: Different credentials needed for different environments
**Solution:**
- Set different values in each environment (Production, Preview, Development)
- Use your hosting platform's environment-specific settings

## Current Configuration

After this update, your system:
- ✅ Works in hosted environments using environment variables
- ✅ Works in local development using the local file
- ✅ Has a secure fallback system
- ✅ Is compatible with AWS Secrets Manager (if you want to set it up)
- ✅ Follows security best practices

## Next Steps

1. **Immediate:** Set the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables in your hosting platform
2. **After Setting Variables:** Redeploy your application
3. **Test:** Try logging into the admin dashboard on your hosted site
4. **Optional:** Consider migrating to AWS Secrets Manager for enhanced security
5. **Recommended:** Change your admin password to something more secure

## Support

If you continue to have issues:
1. Check your hosting platform's logs for errors
2. Verify the environment variables are visible in your deployment logs (but never log the actual password!)
3. Test the `/api/admin/simple-login` endpoint directly with a tool like Postman
4. Ensure you're using the exact credentials you set in environment variables

