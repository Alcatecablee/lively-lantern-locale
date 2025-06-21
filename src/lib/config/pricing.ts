
export const PRICING_PLANS = {
  free: {
    name: "Free",
    price: 0,
    monthlyTransformations: 10,
    layers: [1, 2, 3], // Config, Entities, Components only
    features: [
      "10 transformations/month",
      "Basic layers (Config, Entities, Components)",
      "Public code processing",
      "Community support"
    ],
    cta: "Get Started Free",
    popular: false
  },
  pro: {
    name: "Pro",
    price: 19,
    monthlyTransformations: -1, // Unlimited
    layers: [1, 2, 3, 4, 5, 6], // All layers
    features: [
      "Unlimited transformations",
      "All 6 transformation layers",
      "Private code processing",
      "Priority support",
      "Batch processing",
      "API access"
    ],
    cta: "Start Pro Trial",
    popular: true
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    monthlyTransformations: -1, // Unlimited
    layers: [1, 2, 3, 4, 5, 6], // All layers
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom rules & layers",
      "On-premise deployment",
      "Dedicated support",
      "SLA guarantee"
    ],
    cta: "Contact Sales",
    popular: false
  }
} as const;

export type PlanType = keyof typeof PRICING_PLANS;

export const PAYPAL_CONFIG = {
  sandbox: {
    clientId: process.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || "",
    environment: "sandbox" as const
  },
  production: {
    clientId: process.env.VITE_PAYPAL_CLIENT_ID_PRODUCTION || "",
    environment: "live" as const
  }
};

export const CLERK_CONFIG = {
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY || "",
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/app",
  afterSignUpUrl: "/app"
};
