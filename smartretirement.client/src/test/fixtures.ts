import { PLAN_TYPE } from "../types/api.ts";
import type {
  ApiProblemDetails,
  Contribution,
  CreateContributionRequest,
  EmployerSummary,
  Participant,
  Plan,
  UpdateParticipantRequest,
} from "../types/api.ts";

export const northstarEmployer = {
  id: 1,
  name: "Northstar Analytics",
  industry: "Financial Technology",
} as const satisfies EmployerSummary;

export const mayaParticipant = {
  id: 1,
  firstName: "Maya",
  lastName: "Chen",
  email: "maya.chen@example.com",
  dateOfBirth: "1989-04-12",
  createdAtUtc: "2025-01-10T14:30:00Z",
} as const satisfies Participant;

export const maya401kPlan = {
  id: 1,
  participantId: mayaParticipant.id,
  employerId: northstarEmployer.id,
  name: "Northstar 401(k)",
  type: PLAN_TYPE.K401,
  openedOn: "2021-06-01",
  currentBalance: 18_000,
  annualContributionLimit: 23_500,
  isActive: true,
  employer: northstarEmployer,
} as const satisfies Plan;

export const mayaIraPlan = {
  id: 2,
  participantId: mayaParticipant.id,
  employerId: null,
  name: "Maya Traditional IRA",
  type: PLAN_TYPE.IRA,
  openedOn: "2020-02-15",
  currentBalance: 4_500,
  annualContributionLimit: 7_000,
  isActive: true,
  employer: null,
} as const satisfies Plan;

export const mayaPlans = [maya401kPlan, mayaIraPlan] as const satisfies readonly Plan[];

export const maya401kContributions = [
  {
    id: 1,
    planId: maya401kPlan.id,
    amount: 8_500,
    contributionDate: "2025-01-31",
    taxYear: 2025,
    description: "Employee payroll contributions",
  },
  {
    id: 2,
    planId: maya401kPlan.id,
    amount: 9_500,
    contributionDate: "2025-07-31",
    taxYear: 2025,
    description: "Employee payroll contributions",
  },
] as const satisfies readonly Contribution[];

export const validContributionRequest = {
  planId: maya401kPlan.id,
  amount: 500,
  contributionDate: "2025-10-15",
  taxYear: 2025,
  description: "Additional employee contribution",
} as const satisfies CreateContributionRequest;

export const overLimitContributionRequest = {
  planId: maya401kPlan.id,
  amount: 6_000,
  contributionDate: "2025-10-15",
  taxYear: 2025,
  description: null,
} as const satisfies CreateContributionRequest;

export const mayaProfileUpdate = {
  firstName: mayaParticipant.firstName,
  lastName: mayaParticipant.lastName,
  email: "maya.chen@retirewise.example",
  dateOfBirth: mayaParticipant.dateOfBirth,
} as const satisfies UpdateParticipantRequest;

export const annualLimitProblem = {
  title: "Annual contribution limit exceeded",
  status: 409,
  detail:
    "The contribution would raise the 2025 total to 24000, exceeding the plan limit of 23500.",
  code: "AnnualLimitExceeded",
} as const satisfies ApiProblemDetails;
