// api/_lib/skus.ts
// SERVER-SIDE source of truth for what each SKU costs and grants.
//
// For the CARD rail, the charged amount is owned by the Stripe Price (via env),
// so the client can't tamper with it. For the ETH rail, Coinbase Commerce needs
// us to state the USD price when creating the charge, so priceUsd here is the
// authoritative amount for that rail. Both must equal the Stripe Price and the
// UI catalog (data/catalog.ts). There are only a handful of SKUs; keep them in
// sync by hand.

export type SkuKind = 'credits' | 'course';

export interface ServerSku {
  kind: SkuKind;
  title: string;
  priceUsd: number;
  // Name of the env var holding this sku's Stripe Price id (price_...).
  // Set these in Vercel after creating the products in Stripe.
  stripePriceEnv: string;
  // Credits granted (credit packs only).
  credits?: number;
}

export const serverSkus: Record<string, ServerSku> = {
  'course-prompt-mastery': {
    kind: 'course',
    title: 'Prompt Engineering Mastery',
    priceUsd: 99,
    stripePriceEnv: 'STRIPE_PRICE_COURSE_PROMPT_MASTERY',
  },
  'credits-500':   { kind: 'credits', title: 'Starter Credits', priceUsd: 5,   stripePriceEnv: 'STRIPE_PRICE_CREDITS_500',   credits: 500 },
  'credits-2500':  { kind: 'credits', title: 'Builder Credits', priceUsd: 25,  stripePriceEnv: 'STRIPE_PRICE_CREDITS_2500',  credits: 2500 },
  'credits-10000': { kind: 'credits', title: 'Pro Credits',     priceUsd: 100, stripePriceEnv: 'STRIPE_PRICE_CREDITS_10000', credits: 10000 },
  // 'course-agentic-loops' is comingSoon in the UI — add it here when it launches.
};

export function getServerSku(sku: string): ServerSku | undefined {
  return serverSkus[sku];
}
