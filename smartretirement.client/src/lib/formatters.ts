import { PLAN_TYPE } from "../types/api.ts";
import type {
  DateOnlyString,
  EmployerSummary,
  Participant,
  PlanType,
  UtcDateTimeString,
} from "../types/api.ts";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const PLAN_TYPE_LABELS = {
  [PLAN_TYPE.K401]: "401(k)",
  [PLAN_TYPE.IRA]: "IRA",
  [PLAN_TYPE.HSA]: "HSA",
  [PLAN_TYPE.EDUCATION_529]: "529",
  [PLAN_TYPE.ABLE]: "ABLE",
} satisfies Record<PlanType, string>;

function requireValidDate(date: Date, source: string): Date {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date value: ${source}`);
  }

  return date;
}

function parseDateOnly(value: DateOnlyString): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) {
    throw new RangeError(`Date-only value must use YYYY-MM-DD: ${value}`);
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, monthIndex, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== monthIndex ||
    parsed.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }

  return parsed;
}

export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new TypeError("A currency amount must be a finite number.");
  }

  return currencyFormatter.format(amount);
}

/** Format a DateOnly value without shifting it across time zones. */
export function formatDateOnly(value: DateOnlyString): string {
  return dateOnlyFormatter.format(parseDateOnly(value));
}

/** Format a real UTC instant in the participant's local browser time zone. */
export function formatUtcDateTime(value: UtcDateTimeString): string {
  return dateTimeFormatter.format(requireValidDate(new Date(value), value));
}

export function formatPercentage(percentage: number): string {
  if (!Number.isFinite(percentage)) {
    throw new TypeError("A percentage must be a finite number.");
  }

  return percentageFormatter.format(percentage / 100);
}

export function formatPlanType(planType: PlanType): string {
  return PLAN_TYPE_LABELS[planType];
}

export function formatParticipantName(
  participant: Pick<Participant, "firstName" | "lastName">,
): string {
  return `${participant.firstName} ${participant.lastName}`;
}

export function formatParticipantInitials(
  participant: Pick<Participant, "firstName" | "lastName">,
): string {
  return `${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`.toUpperCase();
}

export function formatPlanSponsor(
  employer: EmployerSummary | null,
): string {
  return employer?.name ?? "Individual account";
}
