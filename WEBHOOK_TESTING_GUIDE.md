# Payment Webhook Testing Guide

## Prerequisites

Before testing the payment webhook, ensure:

1. **Environment variables are set** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   ```

2. **Supabase Real-time is enabled** on the `subscriptions` table:
   - Go to Supabase dashboard
   - Project Settings → Replication → Toggle "Enable" on `subscriptions`

3. **Paystack Webhook is configured**:
   - Log into Paystack dashboard
   - Settings → API Keys & Webhooks
   - Enter Webhook URL: `https://your-domain.com/api/paystack/webhook` (or localhost for testing)
   - Test with Paystack test keys

## Local Testing with Paystack Test Mode

### Step 1: Set Up Test Keys
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Click on "Settings"
3. Select "API Keys & Webhooks"
4. Copy your **Public Key (Test)** and **Secret Key (Test)**
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   ```

### Step 2: Test with Paystack Sandbox
Paystack provides test card numbers:

**Successful payment:**
- Card Number: `4084 0843 5095 3220`
- Expiry: Any future date (e.g., 12/25)
- CVV: `408`

**Failed payment (for testing):**
- Card Number: `5060 6666 6666 6666`
- Expiry: Any future date
- CVV: `123`

### Step 3: Run Local Dev Server
```powershell
cd "c:\Users\User\Desktop\ami new\Ami-by-KOKO"
npm run dev
```

Visit `http://localhost:3000`

### Step 4: Test Payment Flow

1. **Create a parent account**
   - Go to login page
   - Create account with your email (not @amibykoko.app)

2. **Create a child profile**
   - Go to settings or home
   - Create a child (e.g., "Test Child")

3. **Try free content first**
   - Go to Phonics → English
   - Learn letters A–F (free tier)

4. **Attempt to unlock Yorùbá**
   - Go to Phonics → Yorùbá
   - Click "Unlock" button
   - Select a plan and click "Pay Now"

5. **Complete test payment**
   - Use test card: `4084 0843 5095 3220`
   - Use any expiry date (12/25)
   - Use CVV: `408`
   - Click "Pay"

6. **Verify unlock**
   - **Expected:** Page reloads after ~2s, Yorùbá letters appear unlocked
   - **Check console** for real-time listener logs:
     ```
     [useAccess] Real-time subscription update detected, hasPaid: true
     ```

## Server Testing with ngrok (for Webhook)

To test the webhook locally (since Paystack needs a public URL):

### Step 1: Install ngrok
```powershell
# Download from https://ngrok.com/download
# Or use Chocolatey
choco install ngrok
```

### Step 2: Expose Local Server
```powershell
# Start ngrok tunnel to port 3000
ngrok http 3000
```

You'll see:
```
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

### Step 3: Update Paystack Webhook URL
1. Paystack Dashboard → Settings → API Keys & Webhooks
2. Change webhook URL to: `https://abc123.ngrok.io/api/paystack/webhook`
3. Save

### Step 4: Monitor Webhook Logs
In your local terminal, you should see webhook logs:
```
[Paystack webhook] Received request
[Paystack webhook] ✓ Signature verified
[Paystack webhook] Processing payment for email: user@example.com
[Paystack webhook] ✓ Found user: uuid-123...
[Paystack webhook] ✓ Subscription created/updated for user: uuid-123...
```

## Debugging Failed Webhooks

### Issue: "No user found for email"
**Cause:** The email in the Paystack charge doesn't match an existing auth user

**Fix:**
1. Verify the email is correct in Paystack test mode
2. Ensure the parent account is created with that exact email
3. Check `supabase.auth.admin.listUsers()` includes that email

**Debug Log:**
```
[Paystack webhook] No user found for email: user@example.com
```

### Issue: "Invalid signature"
**Cause:** `PAYSTACK_SECRET_KEY` is wrong or doesn't match the test key

**Fix:**
1. Go to Paystack → Settings → API Keys
2. Copy the **SECRET KEY (TEST)** exactly
3. Update `.env.local`
4. Restart dev server

**Debug Log:**
```
[Paystack webhook] Invalid signature
```

### Issue: "DB write failed"
**Cause:** Subscription table doesn't exist or doesn't have real-time enabled

**Fix:**
1. Check Supabase dashboard → SQL Editor
2. Verify `subscriptions` table exists with columns:
   - `profile_id` (UUID)
   - `active` (boolean)
   - `expires_at` (timestamp)
   - `plan` (text)
   - `paystack_reference` (text)
3. Enable real-time: Settings → Replication → Toggle `subscriptions`

**Debug Log:**
```
[Paystack webhook] Failed to upsert subscription: {"message": "..."}
```

### Issue: Letters don't unlock after payment
**Cause:** Real-time listener not working or subscription not created

**Debug Checklist:**
1. Check browser console for `[useAccess] Real-time subscription update` logs
2. Check Vercel/local logs for `[Paystack webhook]` logs
3. Verify Supabase real-time is enabled on `subscriptions`
4. Check subscription row exists in Supabase dashboard
5. Verify `profile_id` matches the logged-in user's ID

**Commands to verify in Supabase SQL Editor:**
```sql
-- Check subscription was created
SELECT * FROM subscriptions WHERE profile_id = 'user-uuid-here';

-- Check it's active
SELECT active, expires_at FROM subscriptions WHERE profile_id = 'user-uuid-here';
```

## Production Deployment

### Before Going Live:

1. **Update to Paystack production keys**
   - Settings → API Keys → Get live keys
   - Update Vercel environment variables:
     ```
     NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
     PAYSTACK_SECRET_KEY=sk_live_xxxxx
     ```

2. **Update webhook URL in Paystack**
   - Settings → API Keys & Webhooks
   - Change URL to: `https://ami-by-koko.vercel.app/api/paystack/webhook`

3. **Verify Supabase real-time is enabled**
   - Check production Supabase project
   - Ensure `subscriptions` table has real-time enabled

4. **Test with small real payment** (e.g., ₦100)
   - Create test parent account
   - Make real payment
   - Verify letters unlock
   - Check webhook logs in Vercel dashboard

## Webhook Event Details

Paystack sends the following fields in the webhook:

```json
{
  "event": "charge.success",
  "data": {
    "id": 123456,
    "reference": "ami_1234567890_abcde",
    "amount": 150000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "user@example.com",
      "id": 12345,
      "customer_code": "CUS_xxxxx"
    },
    "metadata": {
      "plan": "individual"
    }
  }
}
```

The webhook handler:
1. Extracts `customer.email`
2. Looks up user by email in Supabase auth
3. Creates/updates subscription with `active=true, expires_at=+30 days`
4. Real-time listener notifies browser of change

## Performance Tips

- Real-time listeners add ~500ms latency (depends on connection)
- Use 2-second timeout to ensure webhook processes before reload
- Consider showing a loading spinner while waiting
- Add toast notification when unlock succeeds

## Further Support

- Paystack Docs: https://paystack.com/docs/payments/webhooks/
- Supabase Real-time: https://supabase.com/docs/guides/realtime
- Check `.env.local` has all required variables
- Review logs in Vercel dashboard: Deployments → Function Logs
