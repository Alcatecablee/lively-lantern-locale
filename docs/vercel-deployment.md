
# Vercel Deployment Guide

## Quick Deployment

1. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project

2. **Environment Variables**
   Set these in your Vercel dashboard under Settings > Environment Variables:
   
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
   VITE_APP_URL=https://your-project.vercel.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app will be available at `https://your-project.vercel.app`

## Custom Domain Setup

1. **Add Domain**
   - Go to Project Settings > Domains
   - Add your custom domain (e.g., `yourdomain.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   ```
   VITE_APP_URL=https://yourdomain.com
   ```

## Automatic Deployments

- Every push to your main branch triggers a new deployment
- Pull requests get preview deployments
- Vercel provides deployment previews for testing

## Build Configuration

The `vercel.json` file in the root directory configures:
- Build settings for Vite
- Routing for SPA behavior
- Security headers
- Static asset caching
- Environment variable references

## Troubleshooting

### Build Errors
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

### Routing Issues
- The `vercel.json` handles SPA routing
- All routes redirect to `index.html`
- Client-side routing handles the rest

### Environment Variables
- Variables must start with `VITE_` to be accessible
- Set them in Vercel dashboard, not in code
- Restart deployment after changing variables

## Performance Optimization

Vercel automatically provides:
- Global CDN
- Automatic HTTPS
- Image optimization
- Edge functions support
- Built-in analytics

For more details, see the main [deployment guide](./deployment.md).
