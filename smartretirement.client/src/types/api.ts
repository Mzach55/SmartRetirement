/**
 * Wire-level contracts shared by the client and SmartRetirement.Api.
 *
 * These interfaces describe the JSON shape returned by ASP.NET Core. They are
 * not runtime validators: data received over the network must still be checked
 * by the API client before the application trusts it.
 */

/** A JSON DateOnly value, represented by the API as YYYY-MM-DD text. */
export type DateOnlyString = string;

/** A JSON UTC DateTime value, represented by the API as ISO-8601 text. */
export type UtcDateTimeString = string;

/**
 * Values from the backend PlanType enum.
 *
 * A const object is used instead of a TypeScript enum so the generated client
 * JavaScript stays small and the numeric API contract remains visible.
 * PlanType.Unknown (0) is deliberately excluded because it is not a valid
 * value in create/update operations or successful plan responses.
 */
export const PLAN_TYPE = {
  K401: 1,
  IRA: 2,
  HSA: 3,
  EDUCATION_529: 4,
  ABLE: 5,
} as const;

export type PlanType = (typeof PLAN_TYPE)[keyof typeof PLAN_TYPE];

export interface Participant {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly dateOfBirth: DateOnlyString;
  readonly createdAtUtc: UtcDateTimeString;
}

export interface EmployerSummary {
  readonly id: number;
  readonly name: string;
  readonly industry: string | null;
}

export interface Plan {
  readonly id: number;
  readonly participantId: number;
  readonly employerId: number | null;
  readonly name: string;
  readonly type: PlanType;
  readonly openedOn: DateOnlyString;
  readonly currentBalance: number;
  readonly annualContributionLimit: number;
  readonly isActive: boolean;
  readonly employer: EmployerSummary | null;
}

export interface Contribution {
  readonly id: number;
  readonly planId: number;
  readonly amount: number;
  readonly contributionDate: DateOnlyString;
  readonly taxYear: number;
  readonly description: string | null;
}

/** Body for PUT /api/participants/{participantId}. */
export interface UpdateParticipantRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly dateOfBirth: DateOnlyString;
}

/** Body for POST /api/contributions. */
export interface CreateContributionRequest {
  readonly planId: number;
  readonly amount: number;
  readonly contributionDate: DateOnlyString;
  readonly taxYear: number;
  readonly description: string | null;
}

/** Values written to the `code` extension of an API Problem Details response. */
export type ServiceErrorCode =
  | "Validation"
  | "NotFound"
  | "Conflict"
  | "PlanInactive"
  | "AnnualLimitExceeded";

/**
 * RFC 9457-style error payload produced by ApiControllerBase/ASP.NET Core.
 * Standard Problem Details members are optional; `code` is this API's custom
 * extension and lets the UI react without parsing human-readable messages.
 */
export interface ApiProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly code?: ServiceErrorCode;
  readonly [extension: string]: unknown;
}
