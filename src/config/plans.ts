export type PlanType = "base" | "pro" | "enterprise" | "custom";

export const PLANS: PlanType[] = ["base", "pro", "enterprise", "custom"];

// Plans whose caps are negotiated — the requester/admin can edit the counts.
export const EDITABLE_PLANS: PlanType[] = ["enterprise", "custom"];

export type PlanLimit = { maxStaff: number; maxDoctors: number };

// Fixed caps for the standard tiers. Enterprise values act as defaults that
// the admin can override; custom is fully admin-defined.
export const PLAN_LIMITS: Record<Exclude<PlanType, "custom">, PlanLimit> = {
  base: { maxStaff: 2, maxDoctors: 3 },
  pro: { maxStaff: 5, maxDoctors: 10 },
  enterprise: { maxStaff: 20, maxDoctors: 50 },
};

/**
 * Resolve the effective limits for a clinic.
 * - base / pro → fixed tier caps.
 * - enterprise → provided caps if given, else the enterprise defaults.
 * - custom → fully provided caps.
 */
export const resolvePlanLimits = (
  plan: PlanType,
  custom?: Partial<PlanLimit>
): PlanLimit => {
  if (plan === "custom") {
    return {
      maxStaff: custom?.maxStaff ?? 0,
      maxDoctors: custom?.maxDoctors ?? 0,
    };
  }
  if (plan === "enterprise") {
    return {
      maxStaff: custom?.maxStaff ?? PLAN_LIMITS.enterprise.maxStaff,
      maxDoctors: custom?.maxDoctors ?? PLAN_LIMITS.enterprise.maxDoctors,
    };
  }
  return PLAN_LIMITS[plan];
};
