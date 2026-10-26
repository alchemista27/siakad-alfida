export type WorkdayPolicyInput = {
  date: string | Date;
  hasHoliday?: boolean;
  hasApprovedLeave?: boolean;
  hasSaturdayDuty?: boolean;
  configuredIsWorkday?: boolean;
};

export type WorkdayPolicyReason =
  | "holiday"
  | "approved_leave"
  | "sunday"
  | "saturday_without_duty"
  | "saturday_duty"
  | "configured_workday"
  | "configured_nonworkday"
  | "weekday";

export type WorkdayPolicy = {
  required: boolean;
  reason: WorkdayPolicyReason;
};

export function toUtcDateKey(value: string | Date): string {
  if (typeof value === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error("Tanggal harus menggunakan format YYYY-MM-DD.");
    }
    return value;
  }

  if (Number.isNaN(value.getTime())) {
    throw new Error("Tanggal tidak valid.");
  }

  return value.toISOString().slice(0, 10);
}

export function utcDate(value: string | Date): Date {
  return new Date(`${toUtcDateKey(value)}T00:00:00.000Z`);
}

export function resolveWorkdayPolicy(input: WorkdayPolicyInput): WorkdayPolicy {
  const date = utcDate(input.date);

  if (input.hasHoliday) return { required: false, reason: "holiday" };
  if (input.hasApprovedLeave) return { required: false, reason: "approved_leave" };
  if (date.getUTCDay() === 6 && input.hasSaturdayDuty) return { required: true, reason: "saturday_duty" };
  if (input.configuredIsWorkday !== undefined) return {
    required: input.configuredIsWorkday,
    reason: input.configuredIsWorkday ? "configured_workday" : "configured_nonworkday",
  };
  if (date.getUTCDay() === 0) return { required: false, reason: "sunday" };

  if (date.getUTCDay() === 6) {
    return input.hasSaturdayDuty
      ? { required: true, reason: "saturday_duty" }
      : { required: false, reason: "saturday_without_duty" };
  }

  return { required: true, reason: "weekday" };
}
