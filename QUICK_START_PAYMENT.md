# Quick Start - Payment Letter Unlock

## What's New ✨

After completing payment, letters now unlock automatically with:
- ✅ Real-time updates (instant UI change)
- ✅ Confirmation popup (see payment status)
- ✅ Smart polling (checks every 500ms for up to 10 seconds)
- ✅ Debug tools (3 endpoints to diagnose issues)

---

## For Users: Testing Payment

### 1. Setup (First Time Only)
```bash
cd c:\Users\User\Desktop\ami new\Ami-by-KOKO
npm run dev
```

Visit: http://localhost:3000

### 2. Create Account & Child
- Click "Get Started"
- Enter parent email
- Set password
- Create a child profile

### 3. Try Free Content
- Go to Phonics → English
- Letters A-F are free

### 4. Test Payment Unlock
- Click on letter G or beyond (locked)
- Click "Unlock with Explorer"
- Select "Explorer Monthly" (₦1,500)
- Click "Pay Now"
- Use test card: `4084 0843 5095 3220` (Exp: `12/25`, CVV: `408`)

### 5. Watch the Magic ✨
You should see:
1. **Processing...** popup (⏳ hourglass)
2. **Success!** popup (✨ checkmark) 
3. **Automatic reload** (🔄)
4. **Letters unlock** (🎉)

### 6. Verify in Browser Console
Press `F12` → Console tab, look for:
```
[UpgradePrompt] Payment callback received
[UpgradePrompt] Waiting for webhook...
[UpgradePrompt] ✓ Subscription found
[useAccess] Real-time subscription update detected
```

---

## For Developers: Debugging

### Quick Test (No Paystack Needed)

Test if everything is working:
```bash
curl -X POST "http://localhost:3000/api/debug/webhook-test?email=your-parent@email.com"
```

**Should return:**
```json
{
  "success": true,
  "user": { "id": "...", "email": "your-parent@email.com" },
  "subscription": { "id": "...", "active": true }
}
```

**If it fails:** See `PAYMENT_FIX_DEBUG_GUIDE.md` for step-by-step fixes

### Check Current Subscription Status
```bash
curl "http://localhost:3000/api/debug/subscription-status?email=your-parent@email.com"
```

### Test Real-time Listener
```bash
curl -X POST "http://localhost:3000/api/debug/realtime-test?email=your-parent@email.com"
```

Then watch browser console for `[useAccess]` logs

---

## Key Files Modified

| File | What Changed | Impact |
|------|--------------|--------|
| `src/hooks/useAccess.ts` | Added real-time listener | Instant UI updates after payment |
| `src/components/ui/UpgradePrompt.tsx` | Added payment modal + polling | Users see payment status |
| `src/app/(app)/settings/page.tsx` | Added payment modal + polling | Settings page payment support |
| `src/app/api/paystack/webhook/route.ts` | Enhanced logging | Better debugging |

---

## Common Questions

### Q: Letters don't unlock after payment?
**A:** Check the debug guide: `PAYMENT_FIX_DEBUG_GUIDE.md` (7-step diagnosis)

### Q: Payment modal shows but nothing happens?
**A:** Run: `curl -X POST "http://localhost:3000/api/debug/webhook-test?email=..."`
If it fails, your `.env.local` is missing values.

### Q: How long does it take?
**A:** Usually 1-3 seconds. Max 10 seconds before showing error.

### Q: Does real-time reload work?
**A:** Letters unlock before the reload thanks to real-time listener. Reload just ensures everything is fresh.

### Q: Is this production-ready?
**A:** Yes! Debug endpoints are disabled in production (NODE_ENV check). All logging is console-based.

---

## Troubleshooting Quick Reference

| Symptom | First Try | Then Check |
|---------|-----------|-----------|
| "Processing..." hangs | Refresh page | Browser console logs |
| Success shows but no unlock | Manual refresh (F5) | Supabase subscription row |
| Payment modal won't open | Create account first | DevTools console for errors |
| Letters still locked | Try different letter | Paystack webhook URL in settings |

---

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Missing? Get from:
- **Supabase:** Project Settings → API
- **Paystack:** Settings → API Keys (TEST mode)

---

## What Happens Behind the Scenes

```
User clicks "Pay Now"
    ↓
Paystack payment form opens
    ↓
User completes payment
    ↓
✅ Payment callback (browser): Show "Processing..."
    + Start polling database
    ↓
✅ Webhook event (server): Create subscription, insert to DB
    ↓
✅ Real-time event (browser): Detect change, show success
    ↓
✅ Page reload (browser): Fresh load with unlocked letters
    ↓
🎉 Letters now unlocked!
```

---

## Next: Production Deployment

1. Get Paystack **live keys** (not test)
2. Update Vercel environment variables
3. Change webhook URL in Paystack dashboard
4. Test with small real payment (₦100)

See: `PAYMENT_IMPLEMENTATION_SUMMARY.md` for details

---

## Documentation

- **Detailed Implementation:** `PAYMENT_IMPLEMENTATION_SUMMARY.md`
- **Full Troubleshooting:** `PAYMENT_FIX_DEBUG_GUIDE.md`
- **Original Fix Details:** `PAYMENT_UNLOCK_FIX.md`
- **Testing Guide:** `WEBHOOK_TESTING_GUIDE.md`

---

**Status:** ✅ Ready to test!  
**Last Updated:** August 18, 2026  
**Questions?** Check the comprehensive guides above.
