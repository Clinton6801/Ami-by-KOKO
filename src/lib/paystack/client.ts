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

/** Subscription pricing in kobo */
export const PRICING = {
  individual_monthly: 150000,  // ₦1,500/month
  individual_annual: 1500000,  // ₦15,000/year
  school_annual: 5000000,      // ₦50,000/year per school
} as const;
