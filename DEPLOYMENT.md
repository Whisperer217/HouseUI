# Deployment Guide

Your Family AI Creative Platform is ready to deploy! Here are your best options.

## Quick Deploy Options

### Option 1: Vercel (Recommended - 2 Minutes)

**Why Vercel?**
- Free hobby tier
- Automatic deployments from Git
- Built-in CI/CD
- Global CDN
- Zero configuration for Vite apps
- Perfect for React + Supabase

**Deploy Steps:**

1. **Push to GitHub** (if not already):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/family-ai-platform.git
git push -u origin main
```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite settings
   - Add environment variables:
     - `VITE_SUPABASE_URL` = `https://urqddoybmgbtimbqszti.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
   - Click "Deploy"

3. **Done!** Your app will be live at:
   - `https://your-project.vercel.app`

**Auto-Deploy:**
- Every push to `main` branch = automatic deployment
- Preview deployments for pull requests
- Instant rollbacks if needed

---

### Option 2: Netlify (Also Great - 2 Minutes)

**Why Netlify?**
- Free tier with generous limits
- Great for static sites
- Built-in forms & functions
- Easy domain management

**Deploy Steps:**

1. **Push to GitHub** (same as Vercel)

2. **Deploy to Netlify**:
   - Go to https://netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repo
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy site"

3. **Done!** Live at:
   - `https://your-site-name.netlify.app`

---

### Option 3: Cloudflare Pages (Free & Fast)

**Why Cloudflare?**
- Free unlimited requests
- Fastest global CDN
- Built-in analytics
- Great DDoS protection

**Deploy Steps:**

1. **Push to GitHub** (same as above)

2. **Deploy to Cloudflare**:
   - Go to https://pages.cloudflare.com
   - Click "Create a project"
   - Connect GitHub repo
   - Build settings:
     - Framework: Vite
     - Build command: `npm run build`
     - Output directory: `dist`
   - Environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Save and Deploy"

3. **Done!** Live at:
   - `https://your-project.pages.dev`

---

### Option 4: GitHub Pages (Free Static Hosting)

**Setup:**

1. **Install gh-pages**:
```bash
npm install --save-dev gh-pages
```

2. **Update package.json**:
```json
{
  "homepage": "https://yourusername.github.io/family-ai-platform",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Update vite.config.ts**:
```typescript
export default defineConfig({
  base: '/family-ai-platform/',
  plugins: [react()],
});
```

4. **Deploy**:
```bash
npm run deploy
```

5. **Enable GitHub Pages**:
   - Go to repo Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Save

**Note:** Environment variables need to be embedded at build time or use GitHub Secrets.

---

## Environment Variables Setup

All platforms need these two variables:

```env
VITE_SUPABASE_URL=https://urqddoybmgbtimbqszti.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVycWRkb3libWdidGltYnFzenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDQwMzEsImV4cCI6MjA3NjA4MDAzMX0.jOLF-OfSI4An5S40mXPp9oyrphCYp6LRYv8ghfXpcPw
```

**Important:**
- These are safe to expose (they're public keys)
- RLS policies protect your database
- Never expose service role keys

---

## Custom Domain Setup

After deployment, add your custom domain:

### Vercel:
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify:
1. Domain Settings → Add custom domain
2. Follow DNS configuration steps

### Cloudflare Pages:
1. Custom domains → Set up a custom domain
2. Automatic SSL included

---

## Quick Comparison

| Platform | Free Tier | Build Time | CDN | Auto Deploy | Best For |
|----------|-----------|------------|-----|-------------|----------|
| **Vercel** | ✅ Generous | ~2 min | ✅ Global | ✅ Yes | React apps |
| **Netlify** | ✅ Good | ~2 min | ✅ Global | ✅ Yes | Static sites |
| **Cloudflare** | ✅ Unlimited | ~2 min | ✅ Fastest | ✅ Yes | Performance |
| **GitHub Pages** | ✅ Free | ~3 min | ✅ Good | ⚠️ Manual | Open source |

---

## Recommended: Vercel

**One-Command Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, add env vars when asked
# Done!
```

---

## Post-Deployment Checklist

After deploying:

- [ ] Test all features on production URL
- [ ] Verify Supabase connection works
- [ ] Test theme switching
- [ ] Test AI chat (if connected to Ollama/WebUI)
- [ ] Check all projects load correctly
- [ ] Test profile switching
- [ ] Verify compute node management
- [ ] Test on mobile devices

---

## Monitoring & Analytics

### Vercel Analytics (Built-in):
```bash
npm install @vercel/analytics
```

Then in `main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// Add to render
<Analytics />
```

### Google Analytics:
Add to `index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Troubleshooting

### Build Fails

**Issue:** Build errors
**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

**Issue:** Supabase connection fails
**Fix:**
1. Verify env vars start with `VITE_`
2. Check spelling and values
3. Rebuild after adding vars
4. Clear browser cache

### 404 on Refresh

**Issue:** Page not found on direct URL access
**Fix:**
Add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Or `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Slow Load Times

**Fix:**
1. Enable gzip compression (usually default)
2. Use CDN (Vercel/Netlify have this)
3. Optimize images
4. Consider code splitting

---

## Scaling Considerations

Your app is production-ready, but for heavy usage:

### Database (Supabase):
- Free tier: 500MB database, 2GB bandwidth/month
- Pro tier ($25/mo): 8GB database, 250GB bandwidth
- Upgrade when needed at dashboard.supabase.com

### Hosting:
- Vercel Free: 100GB bandwidth/month
- Netlify Free: 100GB bandwidth/month
- Both scale automatically

### AI Compute:
- Runs on your local network (free!)
- Or upgrade to cloud AI if needed

---

## Security Best Practices

**Already Implemented:**
- ✅ RLS enabled on all tables
- ✅ Anon key used (not service key)
- ✅ Environment variables for secrets
- ✅ HTTPS by default (all platforms)

**Additional (Optional):**
- Set up Supabase Auth (currently using profiles)
- Add rate limiting for AI endpoints
- Configure CORS if needed
- Regular Supabase backups

---

## Cost Estimate

**Free Tier (Current Setup):**
- Hosting: $0 (Vercel/Netlify free)
- Database: $0 (Supabase free tier)
- AI: $0 (self-hosted Ollama)
- Total: **$0/month**

**If you need to scale:**
- Supabase Pro: $25/month (8GB database)
- Vercel Pro: $20/month (if needed)
- Total: ~$25-45/month

**vs Traditional Cloud AI:**
- OpenAI/Claude: $100-300/month
- Savings: **$75-275/month!**

---

## Production Checklist

Before going live:

- [x] Build succeeds locally
- [x] All environment variables configured
- [ ] Choose deployment platform
- [ ] Push to GitHub
- [ ] Deploy to platform
- [ ] Test production URL
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Share with family!

---

## Quick Start (Copy-Paste)

**Fastest path to deployment:**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# When prompted:
# - Set up and deploy? Y
# - Link to existing project? N
# - Project name? family-ai-platform
# - Directory? ./
# - Override settings? N

# 3. Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste: https://urqddoybmgbtimbqszti.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key

# 4. Deploy to production
vercel --prod

# 5. Done! 🎉
```

Your app is now live!

---

## Support

**Issues during deployment?**

1. Check build logs in your platform's dashboard
2. Verify environment variables are set correctly
3. Test local build: `npm run build && npm run preview`
4. Check Supabase dashboard for connection issues

**Platform Docs:**
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com
- Cloudflare: https://developers.cloudflare.com/pages
- GitHub Pages: https://docs.github.com/pages

---

## Next Steps After Deployment

1. **Share with family** - Everyone can access from any device
2. **Set up AI compute nodes** - Follow DISTRIBUTED_AI_SETUP.md
3. **Add authentication** - Optional, for external access
4. **Customize themes** - Each family member picks their favorite
5. **Create projects** - Start building together!

**Your family creative platform is ready for the world!**
