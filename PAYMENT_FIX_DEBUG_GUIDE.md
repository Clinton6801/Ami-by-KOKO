# Payment Unlock Debug Guide

## Quick Diagnosis

Your payment isn't unlocking letters because **one of these is failing:**

1. **Paystack webhook isn't reaching your app** → Payment processed but no signal sent
2. **Webhook signature verification fails** → Signal rejected as invalid
3. **User lookup fails** → Webhook can't find the parent's account
4. **Subscription creation fails** → Database write error
5. **Real-time listener not working** → UI doesn't detect subscription change

---

## Step 1: Test Your Infrastructure (Local Development)

### Prerequisites
- Dev server running: `npm run dev`
- `.env.local` is filled with correct values

### Test the Debug Endpoint

This endpoint simulates the entire webhook flow without needing Paystack:

```bash
# Test if everything works
curl -X POST "http://localhost:3000/api/debug/webhook-test?email=your-parent@email.com"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "All webhook tests passed! Your infrastructure is working.",
  "user": {
    "id": "user-uuid-here",
    "email": "your-parent@email.com"
  },
  "subscription": {
    "id": "sub-id",
    "active": true,
    "expires_at": "2025-08-25T..."
  }
}
```

### What Each Response Means

**❌ Missing email parameter:**
```json
{ "error": "Missing email parameter: ?email=user@example.com" }
```
→ Add email to URL: `?email=your-parent@email.com`

**❌ PAYSTACK_SECRET_KEY not configured:**
```json
{ "error": "PAYSTACK_SECRET_KEY not configured" }
```
→ Fill in `.env.local`:
```
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

**❌ Failed to list users:**
```json
{ "error": "Failed to list users", "details": {...} }
```
→ Check your `SUPABASE_SERVICE_ROLE_KEY` - it's wrong or has insufficient permissions
→ Go to Supabase → Project Settings → API Keys → Copy the Service Role key exactly

**❌ User not found:**
```json
{
  "error": "User not found",
  "email": "your@email.com",
  "availableUsers": ["other@email.com", "test@email.com"]
}
```
→ The parent account doesn't exist with that email
→ Create a parent account first at `https://localhost:3000/auth/signup`
→ Use the exact same email in the debug test

**❌ Failed to create subscription:**
```json
{ "error": "Failed to create subscription", "details": {...} }
```
→ Your Supabase `subscriptions` table has issues
→ Go to Supabase → SQL Editor → Run:
```sql
-- Check if table exists
SELECT * FROM subscriptions LIMIT 1;

-- Check table schema
\d subscriptions;
```

**✅ All tests passed:**
→ Your infrastructure is working! The issue is in the payment flow or real-time listener.

---

## Step 2: Check Browser Console During Payment

### During Payment Processing

1. Open browser DevTools (F12)
2. Go to Console tab
3. Complete a test payment
4. Look for these logs:

**Expected logs:**
```
[UpgradePrompt] Payment callback received, reference: ami_1234567890_abcde
[UpgradePrompt] Waiting for webhook to process subscription...
[UpgradePrompt] Subscription not yet created (polling...)
[UpgradePrompt] Subscription not yet created (polling...)
[UpgradePrompt] ✓ Subscription found and valid: true
[UpgradePrompt] ✓ Subscription verified after 1500 ms
[UpgradePrompt] Reloading page to reflect unlocked content...
```

**Problem: "Subscription not found after 10 seconds"**
→ The webhook never created the subscription
→ Go to Step 3 below

**Problem: "ReferenceError: supabase is not defined"**
→ Supabase client not initialized
→ Check `src/lib/supabase/client.ts` is correct

**Problem: No logs at all**
→ Payment callback isn't firing
→ Check if Paystack script is loaded: `window.PaystackPop` in console should exist

---

## Step 3: Check Supabase Database

### See if Subscription Was Created

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Find the parent's email and check their subscription
SELECT 
  u.email,
  s.id,
  s.profile_id,
  s.active,
  s.expires_at,
  s.paystack_reference,
  s.created_at
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.profile_id
WHERE u.email = 'your-parent@email.com'
ORDER BY s.created_at DESC
LIMIT 1;
```

**Expected Result:**
```
email                  | id  | profile_id | active | expires_at           | paystack_reference
your-parent@email.com  | xxx | yyyy       | true   | 2025-08-25T12:00:00Z | ami_1234567890_abc
```

**Problem: No row appears (NULL on right side)**
→ Subscription was never created
→ Check webhook logs (Step 4)

**Problem: active = false**
→ Check `expires_at` - may have already expired
→ Run webhook test again

---

## Step 4: Check Webhook Logs

### Local Development (Vercel CLI)

If running locally with emulator:
```bash
# Logs appear in your terminal where you ran `npm run dev`
```

Look for:
```
[Paystack webhook] Received request
[Paystack webhook] ✓ Signature verified
[Paystack webhook] Processing payment for email: your-parent@email.com
[Paystack webhook] ✓ Found user: uuid-123
[Paystack webhook] ✓ Subscription created/updated for user: uuid-123
```

### Production (Vercel Dashboard)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. Click latest deployment
5. Click "Function Logs"
6. Search for `[Paystack webhook]`

### Common Webhook Errors

**[Paystack webhook] Invalid signature**
→ `PAYSTACK_SECRET_KEY` doesn't match what Paystack is using
→ Go to Paystack Dashboard → Settings → API Keys
→ Copy the SECRET KEY (TEST) exactly
→ Update in Vercel environment variables

**[Paystack webhook] No user found for email**
→ The parent account was created with a different email than what Paystack sent
→ Check the email in the webhook log vs the email in auth.users

**[Paystack webhook] Failed to upsert subscription**
→ Database permissions issue
→ Check `SUPABASE_SERVICE_ROLE_KEY` has write access to subscriptions table

---

## Step 5: Verify Real-time Listener

### Check Supabase Real-time is Enabled

1. Go to Supabase Dashboard
2. Project Settings → Replication
3. Look for `public.subscriptions` table
4. Should show a toggle that is ON ✓

**If not enabled:**
→ Click the toggle to enable
→ Wait 30 seconds for changes to propagate

### Test Real-time Listener

In browser console, run:
```javascript
// Should see subscription update logs
// Look for: "[useAccess] Real-time subscription update detected"
```

If you don't see this log after payment:
1. Open DevTools Network tab
2. Look for WebSocket connections
3. Should see `wss://project-id.supabase.co/realtime/v1/websocket?...`
4. If no WebSocket: Real-time not working

---

## Step 6: Manual End-to-End Test

### Scenario: Payment succeeded but unlock didn't work

1. **Check browser logs** (Step 2)
   - Did payment callback fire? ✓
   - Did it poll for subscription? ✓

2. **Check database** (Step 3)
   - Is subscription in DB? ✓

3. **Check webhook logs** (Step 4)
   - Did webhook receive event? ✓
   - Did it create subscription? ✓

4. **Manually trigger refresh**
   - Press F5 to reload page
   - Letters should now be unlocked ✓
   - If yes → Real-time listener isn't working (Step 5)
   - If no → Subscription wasn't actually created (Step 3)

---

## Step 7: Using Paystack Test Mode

### Get Test Keys

1. Go to https://dashboard.paystack.com
2. Click your avatar → Settings
3. API Keys & Webhooks
4. Copy **Public Key (Test)** and **Secret Key (Test)**
5. Update `.env.local`:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   ```

### Test Payment Cards

**Successful payment (MasterCard):**
- Card: `5060 6666 6666 6666`
- Exp: `12/25`
- CVV: `251`
- OTP: `123456` (when prompted)

**Successful payment (Visa):**
- Card: `4084 0843 5095 3220`
- Exp: Any future date
- CVV: `408`

### Test With ngrok (for webhook)

```bash
# Install ngrok
choco install ngrok

# In one terminal - start tunnel
ngrok http 3000

# You'll see: Forwarding https://abc123.ngrok.io -> http://localhost:3000

# Update Paystack webhook URL
# Settings → API Keys & Webhooks → Webhook URL
# https://abc123.ngrok.io/api/paystack/webhook
```

---

## Complete Troubleshooting Checklist

- [ ] `.env.local` has all 6 required variables
- [ ] `PAYSTACK_SECRET_KEY` matches Paystack test/live keys
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is from Project Settings → API
- [ ] Parent account exists with correct email
- [ ] Debug endpoint test passes: `curl -X POST "http://localhost:3000/api/debug/webhook-test?email=..."`
- [ ] Subscription table has real-time enabled in Supabase
- [ ] Browser DevTools Console shows `[UpgradePrompt]` logs during payment
- [ ] Webhook logs show `[Paystack webhook] ✓ Signature verified`
- [ ] Subscription appears in Supabase: `SELECT * FROM subscriptions WHERE profile_id = 'user-id'`
- [ ] Manual page reload shows unlocked letters (means subscription is there, real-time just didn't fire)

---

## Still Not Working?

### Create Minimal Test

1. **Disable real-time listener temporarily** to isolate issues
2. **Hard-code a subscription** in Supabase manually
3. **Reload page** - do letters unlock?
   - YES → Issue is in payment flow or webhook
   - NO → Issue is in access check logic

### Common Causes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Payment modal never shows | Paystack script not loaded | Check `Script` tag in layout |
| Payment modal shows but can't click button | Email not set | Create account first |
| "Processing Payment" hangs forever | Webhook not running | Check Vercel logs |
| Success message shows but no unlock | Real-time not enabled | Enable in Supabase Settings |
| Manual refresh unlocks letters | Real-time not working | Check WebSocket in DevTools |
| Letters still locked after manual refresh | Subscription table wrong | Run debug endpoint test |

---

## Files to Check

- `.env.local` - Environment variables
- `src/lib/paystack/client.ts` - Paystack integration
- `src/hooks/useAccess.ts` - Real-time listener setup
- `src/components/ui/UpgradePrompt.tsx` - Payment UI
- `src/app/api/paystack/webhook/route.ts` - Webhook handler
- `src/app/api/debug/webhook-test/route.ts` - Debug endpoint
