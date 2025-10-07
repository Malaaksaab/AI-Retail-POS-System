# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Configure Environment Variables in Vercel Dashboard**
```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Done!** Your app is live.

---

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Build**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

4. **Add Environment Variables**
Go to Netlify Dashboard → Site Settings → Environment Variables

---

### Option 3: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Build Image**
```bash
docker build -t pos-system .
```

3. **Run Container**
```bash
docker run -p 80:80 pos-system
```

---

### Option 4: Static Host (GitHub Pages, AWS S3, etc.)

1. **Build**
```bash
npm run build
```

2. **Upload `dist/` folder** to your static host

3. **Configure environment variables** in build settings

---

## Environment Variables

**Required Variables:**
```bash
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Note:** The anon key is safe to expose in frontend code. Supabase uses Row Level Security (RLS) to protect data.

---

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] App loads without errors
- [ ] Login works with demo accounts
- [ ] Database connection successful
- [ ] Real-time updates working
- [ ] All CRUD operations functional
- [ ] SSL certificate active (HTTPS)

---

## Custom Domain Setup

### Vercel
```bash
vercel domains add yourdomain.com
```

### Netlify
Go to Domain Settings → Add Custom Domain

---

## Performance Optimization

### Enable Compression
Most hosts enable Gzip/Brotli by default. Verify in browser DevTools.

### CDN Configuration
Vercel and Netlify automatically use CDN. No configuration needed.

### Caching Headers
Add to `netlify.toml` or `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Monitoring

### Supabase Dashboard
Monitor database performance, queries, and auth logs:
https://app.supabase.com/project/0ec90b57d6e95fcbda19832f

### Error Tracking
Consider adding:
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics (usage metrics)

---

## Scaling Considerations

### Current Setup Supports:
- ✅ Thousands of products
- ✅ Thousands of customers
- ✅ Hundreds of concurrent users
- ✅ Multiple stores
- ✅ Real-time updates

### If You Need More:
1. **Upgrade Supabase Plan** (more database resources)
2. **Enable Connection Pooling** (handle more connections)
3. **Add Redis Cache** (faster queries)
4. **CDN for Assets** (faster load times)

---

## Backup & Restore

### Automatic Backups
Supabase automatically backs up your database daily.

### Manual Backup
```bash
# Export from Supabase dashboard
# Database → Backups → Export
```

### Restore
```bash
# Database → Backups → Restore
```

---

## SSL/HTTPS

All recommended hosts (Vercel, Netlify) provide free SSL certificates automatically.

---

## Deployment Status

### Backend (Supabase)
- ✅ Already deployed and live
- ✅ Database running
- ✅ Authentication active
- ✅ Realtime enabled

### Frontend
- ⏳ Ready to deploy (follow steps above)
- ✅ Build successful
- ✅ All dependencies resolved
- ✅ Production optimized

---

## Quick Deploy Commands

```bash
# Vercel
vercel --prod

# Netlify
npm run build && netlify deploy --prod --dir=dist

# Docker
docker build -t pos-system . && docker run -p 80:80 pos-system
```

---

## Support

If deployment fails:
1. Check environment variables are set correctly
2. Verify build completes without errors
3. Check browser console for errors
4. Verify Supabase URL and keys are correct

---

**Your app is production-ready!** Choose a deployment option above and go live in minutes.
