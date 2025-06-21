# Deployment Guide

## Quick Start

### Vercel (Recommended)
See our [Vercel Deployment Guide](./vercel-deployment.md) for detailed instructions.

**Quick steps:**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

```bash
# Manual deployment
npm install -g vercel
vercel --prod
```

#### Netlify
1. Connect repository in Netlify dashboard
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables

#### Self-hosted
```bash
# Build the application
npm run build

# Serve with nginx, Apache, or any static file server
# Point server to the `dist` directory
```

### Database Setup

#### Supabase Configuration
1. Create new Supabase project
2. Run database migrations
3. Set up Row Level Security policies
4. Configure authentication providers

```sql
-- Example RLS policy
CREATE POLICY "Users can view own data" ON profiles
FOR SELECT USING (auth.uid() = user_id);
```

### Performance Optimization

#### Bundle Analysis
```bash
npm run build
npm run analyze  # View bundle composition
```

#### Optimization Checklist
- [ ] Enable gzip compression
- [ ] Configure CDN
- [ ] Set up proper caching headers
- [ ] Optimize images
- [ ] Enable service worker
- [ ] Monitor Core Web Vitals

### Monitoring & Analytics

#### Error Tracking
- Set up Sentry or similar service
- Monitor JavaScript errors
- Track performance metrics

#### Analytics
- Google Analytics 4
- User behavior tracking
- Conversion funnel analysis

### Security Configuration

#### HTTPS Setup
- Use SSL/TLS certificates
- Redirect HTTP to HTTPS
- Set secure headers

#### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

### Backup & Recovery

#### Database Backups
- Daily automated backups
- Point-in-time recovery
- Cross-region replication

#### Application Backups
- Regular deployment snapshots
- Version control for configurations
- Disaster recovery plan

### CI/CD Pipeline

#### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy
        run: npm run deploy
```

### Health Checks

#### Application Monitoring
- Uptime monitoring
- API response times
- Database performance
- User experience metrics

#### Alerting
- Error rate thresholds
- Performance degradation alerts
- Capacity planning alerts
