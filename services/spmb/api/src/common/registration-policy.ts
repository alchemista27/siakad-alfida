export type ActiveRegistrationPolicy = "single_parent_application" | "multiple_child_applications";

// Parents may have multiple children per period. A child is identified only in
// the post-payment student form; until then each parent may hold one anonymous
// pending-payment draft per period to avoid indistinguishable duplicates.
export const ACTIVE_REGISTRATION_POLICY: ActiveRegistrationPolicy =
  "multiple_child_applications";
