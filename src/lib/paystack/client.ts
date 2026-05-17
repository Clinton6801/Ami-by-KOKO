/**
 * Paystack payment client helpers.
 * Uses the Paystack inline JS for client-side payment initiation.
 *
 * Docs: https://paystack.com/docs/payments/accept-payments/#popup
 */

export interface PaystackConfig {
  email: string;
  /** Amount in kobo (₦1 = 100 kobo) */
  amount: number;
  reference: string;
  planId?: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

/**
 * Opens the Paystack payment popup.
 * Requires the Paystack inline script to be loaded in the page.
 * Add to layout: <Script src="https://js.paystack.co/v1/inline.js" />
 */
export function openPaystackPopup(config: PaystackConfig): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PaystackPop = (window as any).PaystackPop;

  if (!PaystackPop) {
    console.error("Paystack inline script not loaded.");
    return;
  }

  const handler = PaystackPop.setup({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email: config.email,
    amount: config.amount,
    ref: config.reference,
    metadata: { plan: config.planId ?? "explorer-monthly" },
    callback: (response: { reference: string }) => {
      config.onSuccess(response.reference);
    },
    onClose: config.onClose,
  });

  handler.openIframe();
}

/**
 * Generates a unique payment reference.
 */
export function generateReference(prefix = "ami"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Subscription plans ───────────────────────────────────────────────────────

export const PAYSTACK_PLANS = {
  EXPLORER_MONTHLY: {
    id: "explorer-monthly",
    name: "Explorer",
    amount: 150000,           // ₦1,500/month in kobo
    interval: "monthly" as const,
    description: "Full access for 1 child",
    maxChildren: 1,
    displayPrice: "₦1,500/month",
    displayPriceYearly: "₦15,000/year",
  },
  EXPLORER_YEARLY: {
    id: "explorer-yearly",
    name: "Explorer (Annual)",
    amount: 1500000,          // ₦15,000/year in kobo
    interval: "annually" as const,
    description: "2 months free",
    maxChildren: 1,
    displayPrice: "₦15,000/year",
  },
  FAMILY_MONTHLY: {
    id: "family-monthly",
    name: "Family",
    amount: 250000,           // ₦2,500/month in kobo
    interval: "monthly" as const,
    description: "Full access for up to 4 children",
    maxChildren: 4,
    displayPrice: "₦2,500/month",
    displayPriceYearly: "₦25,000/year",
  },
  FAMILY_YEARLY: {
    id: "family-yearly",
    name: "Family (Annual)",
    amount: 2500000,          // ₦25,000/year in kobo
    interval: "annually" as const,
    description: "2 months free",
    maxChildren: 4,
    displayPrice: "₦25,000/year",
  },
} as const;

export type PaystackPlanId = typeof PAYSTACK_PLANS[keyof typeof PAYSTACK_PLANS]["id"];

/** Legacy alias — kept for backward compatibility */
export const PRICING = {
  individual_monthly: PAYSTACK_PLANS.EXPLORER_MONTHLY.amount,
  explorer_monthly:   PAYSTACK_PLANS.EXPLORER_MONTHLY.amount,
  explorer_annual:    PAYSTACK_PLANS.EXPLORER_YEARLY.amount,
  family_monthly:     PAYSTACK_PLANS.FAMILY_MONTHLY.amount,
  family_annual:      PAYSTACK_PLANS.FAMILY_YEARLY.amount,
  school_annual:      5000000, // ₦50,000/year — invoiced manually
} as const;
