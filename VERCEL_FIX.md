# 🚨 URGENT FIX: Vercel Environment Variables

## ⚡ Quick Fix (5 Minutes)

### 1. Go to Vercel
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### 2. Add These 3 Variables

**Copy these EXACT names:**

```
VITE_API_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 3. Set Values

| Variable | Where to Get Value |
|----------|-------------------|
| `VITE_API_KEY` | https://aistudio.google.com/app/apikey |
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |

### 4. Select Environments
For each variable, check:
- ✅ Production
- ✅ Preview
- ✅ Development

### 5. Redeploy
Deployments tab → Latest deployment → ⋯ → Redeploy

---

## 🎯 What This Fixes

- ❌ **Before**: "Error: API Key is missing"
- ✅ **After**: AI content generation works

- ❌ **Before**: Tailwind CDN warning
- ✅ **After**: Proper Tailwind build

---

## 📋 Checklist

- [ ] Added `VITE_API_KEY` to Vercel
- [ ] Added `VITE_SUPABASE_URL` to Vercel
- [ ] Added `VITE_SUPABASE_ANON_KEY` to Vercel
- [ ] Selected all 3 environments for each
- [ ] Clicked "Save" for each variable
- [ ] Redeployed from Deployments tab
- [ ] Waited for deployment to complete
- [ ] Tested the app - content generation works!

---

## 🔍 Verify It Worked

1. Open your app URL
2. Click any agent (e.g., "Ad Copy Agent")
3. Fill in the form
4. Click "Generate Content"
5. ✅ Should see streaming text appear!

If you still see "API Key is missing":
- Check variable names are EXACT (case-sensitive)
- Make sure you redeployed AFTER adding variables
- Clear browser cache and try again

---

## 💡 Why This Happened

**Vite requires `VITE_` prefix for environment variables!**

- ❌ `API_KEY` → Not exposed to client
- ✅ `VITE_API_KEY` → Exposed to client

The code was using `process.env.API_KEY` (Node.js style)  
But Vite uses `import.meta.env.VITE_API_KEY` (Vite style)

**Now fixed in code** ✅

---

## 🆘 Still Having Issues?

1. Screenshot your Vercel environment variables page
2. Screenshot deployment logs
3. Screenshot browser console (F12)
4. Share in GitHub Issues

---

**Time to Fix**: ⏱️ 5 minutes  
**Difficulty**: ⭐ Easy  
**Impact**: 🔥 Critical - App won't work without this
