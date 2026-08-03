# Super Admin Dashboard — Quick Start

## ⚡ 60-Second Setup

### 1. Run SQL Migration (2 min)
Go to Supabase > SQL Editor > paste file content from:
```
supabase/migrations/20240006_super_admin.sql
```
Click "Run" ✅

### 2. Install Resend
```bash
npm install
```

### 3. Add API Key
Update `.env.local`:
```
RESEND_API_KEY=your-key-from-resend.com
```

### 4. Deploy
```bash
git add -A
git commit -m "feat: super admin dashboard"
git push origin main
```

### 5. Access
Log in as: `akinwoleolaclinton@gmail.com`
Visit: `/super-admin`

---

## 📍 Pages & Features

| Page | URL | Features |
|------|-----|----------|
| **Overview** | `/super-admin` | Stats cards, recent signups |
| **Users** | `/super-admin/users` | Activate/deactivate subscriptions |
| **Schools** | `/super-admin/schools` | School list, pupil count |
| **Revenue** | `/super-admin/revenue` | Subscriptions, MRR, plans breakdown |
| **Broadcast** | `/super-admin/broadcast` | Email composer, send history |
| **Content** | `/super-admin/content` | Letter mastery charts, song plays |
| **System** | `/super-admin/system` | Health checks |

---

## 🔐 Security

✅ Only `akinwoleolaclinton@gmail.com` can access  
✅ Double protection: middleware + API routes  
✅ No public links to `/super-admin`  
✅ All credentials server-side  
✅ Service role for privileged DB writes  

---

## 📊 Key Metrics

- **Total Users**: All profiles
- **Free vs Paid**: Based on subscriptions.active
- **Schools**: Count of schools table
- **Students**: Count of children table
- **Conversion Rate**: (paid / total) × 100
- **MRR**: (explorers × ₦1,500) + (families × ₦2,500)

---

## 🎯 Common Tasks

### Activate User Subscription
1. `/super-admin/users`
2. Find user → **Activate**
3. Active for 1 year from now

### Send Mass Email
1. `/super-admin/broadcast`
2. Pick recipients (all, free, paid, admins, new week)
3. Write subject & message
4. **Send Broadcast**
5. Check history below

### Check System Status
1. `/super-admin/system`
2. Green = OK, Yellow = Warning, Red = Error
3. Refreshes every 5 min

---

## 🛠 If Something Breaks

| Issue | Fix |
|-------|-----|
| "Forbidden" | Check you're logged in as super admin email |
| No stats | Verify users/subscriptions exist in Supabase |
| Broadcast fails | Check RESEND_API_KEY in .env.local + Vercel env vars |
| Sidebar stuck | Hard refresh (Ctrl+Shift+R) or clear browser cache |

---

## 📞 Next Steps

- ✅ Run SQL migration
- ✅ `npm install` (adds Resend)
- ✅ Add RESEND_API_KEY to .env.local
- ✅ Deploy to Vercel
- ✅ Log in as super admin & visit `/super-admin`

Dashboard will be **live and secure**. 🦜
