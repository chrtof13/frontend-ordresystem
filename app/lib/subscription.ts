export type SubscriptionPlan = "BASIC" | "STANDARD" | "BEDRIFT";

export function hasAtLeast(
  actual: SubscriptionPlan | null | undefined,
  required: SubscriptionPlan,
) {
  const plan = actual ?? "BASIC";

  if (required === "BASIC") return true;
  if (required === "STANDARD") {
    return plan === "STANDARD" || plan === "BEDRIFT";
  }
  return plan === "BEDRIFT";
}