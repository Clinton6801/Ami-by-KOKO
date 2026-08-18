# Payment Webhook Letter Unlock Fix

## Problem
After a user completed a payment through Paystack, the locked letters were not being unlocked. The subscription was created in the database, but the browser UI didn't refresh to show the unlocked content.

## Root Causes

### 1. **No Real-time UI Updates**
The `useAccess` hook (client-side) only checked the subscription status once when the component mounted. It had no way to listen for real-time changes when the webhook created a new subscription.

**Impact:** Even after the webhook successfully created the subscription in the database, the browser never knew about it until a full page reload.

### 2. **Webhook Timing Race Condition**
Payment success callbacks used a fixed 1.5-second timeout before reloading:
```typescript
onSuccess: () => {
  setTimeout(() => window.location.reload(), 1500);
}
```

This caused a race condition:
- If the webhook processed in <1.5 seconds: Page reload happens before subscription exists
- If the webhook was slow: Page reload worked, but users saw a loading state

**Impact:** Users had to manually refresh multiple times to see unlocked letters.

### 3. **No Error Logging in Webhook**
The webhook had minimal logging, making it difficult to debug subscription creation failures.

## Solution

### 1. **Real-time Subscription Listener** ✓
Updated `useAccess` hook to listen for real-time changes on the `subscriptions` table using Supabase's real-time listeners.

**File:** `src/hooks/useAccess.ts`

```typescript
// Set up real-time listener for subscription changes
subscription = supabase
  .channel(`subscription-changes-${userId}`)
  .on(
    "postgres_changes",
    {
      event: "*", // INSERT, UPDATE, DELETE
      schema: "public",
      table: "subscriptions",
      filter: `profile_id=eq.${userId}`,
    },
    async () => {
      // Subscription changed — re-check access
      // UI updates instantly without page reload
      const paid = !!sub && (!sub.expires_at || sub.expires_at > now);
      setHasPaid(paid);
    }
  )
  .subscribe();
```

**Effect:** When the webhook creates a subscription, the browser listens for that change and immediately updates the UI.

### 2. **Improved Payment Callback Timing** ✓
Increased timeout from 1.5s to 2s and added better logging to the `onSuccess` callbacks.

**Files Modified:**
- `src/components/ui/UpgradePrompt.tsx`
- `src/app/(app)/settings/page.tsx`
- `src/app/(app)/phonics/page.tsx`

```typescript
onSuccess: () => {
  // Real-time listener will detect the subscription change
  // Reload after 2 seconds to ensure webhook has processed
  console.log("[UpgradePrompt] Payment successful, reloading page");
  setTimeout(() => window.location.reload(), 2000);
}
```

### 3. **Enhanced Webhook Logging** ✓
Added comprehensive logging to the webhook to track:
- Signature verification status
- User lookup results
- Subscription creation details
- Error messages at each step

**File:** `src/app/api/paystack/webhook/route.ts`

```
[Paystack webhook] ✓ Signature verified
[Paystack webhook] ✓ Found user: uuid-123...
[Paystack webhook] Creating/updating subscription: {...}
[Paystack webhook] ✓ Subscription created/updated for user: uuid-123...
```

## How the Payment Flow Works Now

1. **User clicks Upgrade** → Payment modal opens
2. **User completes payment** → Paystack confirms success
3. **onSuccess callback fires** → Browser waits 2 seconds (webhook processing time)
4. **Webhook receives event** → Verifies signature, finds user, creates subscription
5. **Subscription inserted into DB** → Real-time listener detects change
6. **useAccess hook updates** → `hasPaid` becomes `true`
7. **UI re-renders** → Locked letters unlock instantly
8. **Page reloads** (2s timeout) → Confirms subscription in fresh page load

## Testing the Fix

### Manual Testing
1. Create a test parent account
2. Start learning English (free letters A–F work)
3. Click "Unlock" to see pricing modal
4. Simulate payment (or use Paystack test keys)
5. After payment completes, verify letters are unlocked **without manual refresh**

### Verification Checklist
- [ ] Paystack webhook is configured in dashboard
- [ ] `PAYSTACK_SECRET_KEY` is set in .env.local
- [ ] Supabase real-time is enabled (check Project Settings)
- [ ] Browser console shows `[useAccess] Real-time subscription update detected` logs
- [ ] Webhook logs appear in Vercel dashboard / local logs

### Debug Logs to Look For
```
[useAccess] Real-time subscription update detected, hasPaid: true
[UpgradePrompt] Payment successful, reloading page to reflect subscription
[Paystack webhook] ✓ Signature verified
[Paystack webhook] ✓ Found user: {user_id}
[Paystack webhook] ✓ Subscription created/updated for user: {user_id}
```

## Database Requirements

Ensure these Supabase settings are configured:

1. **Real-time Enabled** on `subscriptions` table
   - Go to Project Settings → Replication
   - Ensure `subscriptions` table has real-time enabled

2. **Subscription Table Columns**
   - `profile_id` (UUID, primary key)
   - `active` (boolean, default: false)
   - `expires_at` (timestamp with timezone)
   - `plan` (text: 'individual' | 'school')
   - `paystack_reference` (text, unique)

## Architecture Diagram

```
Browser (useAccess hook)
    ↓
    ├─→ Check subscription status (initial fetch)
    ├─→ Set up real-time listener on subscriptions table
    │
User clicks Upgrade
    ↓
Payment modal (Paystack)
    ↓
Paystack webhook received
    ↓
Webhook handler
    ├─→ Verify signature
    ├─→ Find user by email
    ├─→ Create/update subscription (active=true)
    ├─→ Insert into Supabase DB
    │
Real-time event fires
    ↓
useAccess hook listener receives "postgres_changes" event
    ↓
useAccess re-checks subscription status
    ↓
setHasPaid(true) → UI updates instantly
    │
2 second timeout expires → window.location.reload()
    ↓
Fresh page load confirms subscription
```

## Files Changed
1. `src/hooks/useAccess.ts` - Added real-time subscription listener
2. `src/components/ui/UpgradePrompt.tsx` - Improved payment callback (2s timeout + logging)
3. `src/app/(app)/settings/page.tsx` - Improved payment callback (2s timeout + logging)
4. `src/app/(app)/phonics/page.tsx` - Improved payment callback (2s timeout + logging)
5. `src/app/api/paystack/webhook/route.ts` - Enhanced logging + error handling

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (for webhook)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Paystack public key
- `PAYSTACK_SECRET_KEY` - Paystack secret key (for webhook verification)

## Future Improvements
1. Add visual feedback while waiting for webhook (spinner/toast)
2. Implement retry logic if subscription check fails
3. Track webhook processing time metrics
4. Add analytics event when subscription is activated
5. Send push notification when unlock succeeds
