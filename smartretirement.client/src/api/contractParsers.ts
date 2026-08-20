import { ApiContractError } from './errors.ts'
import { PLAN_TYPE } from '../types/api.ts'
import type {
  ApiProblemDetails,
  Contribution,
  EmployerSummary,
  Participant,
  Plan,
  PlanType,
  ServiceErrorCode,
} from '../types/api.ts'

type JsonRecord = Record<string, unknown>

const planTypeValues = new Set<number>(Object.values(PLAN_TYPE))
const serviceErrorCodes = new Set<string>([
  'Validation',
  'NotFound',
  'Conflict',
  'PlanInactive',
  'AnnualLimitExceeded',
] satisfies readonly ServiceErrorCode[])

function contractFailure(contract: string, field: string, expected: string): never {
  throw new ApiContractError(
    `${contract}.${field} did not match the expected ${expected} value.`,
  )
}

function expectRecord(value: unknown, contract: string): JsonRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiContractError(`${contract} must be a JSON object.`)
  }

  return value as JsonRecord
}

function expectString(
  record: JsonRecord,
  field: string,
  contract: string,
): string {
  const value = record[field]

  if (typeof value !== 'string') {
    return contractFailure(contract, field, 'string')
  }

  return value
}

function expectNullableString(
  record: JsonRecord,
  field: string,
  contract: string,
): string | null {
  const value = record[field]

  if (value !== null && typeof value !== 'string') {
    return contractFailure(contract, field, 'string or null')
  }

  return value
}

function expectFiniteNumber(
  record: JsonRecord,
  field: string,
  contract: string,
): number {
  const value = record[field]

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return contractFailure(contract, field, 'finite number')
  }

  return value
}

function expectInteger(
  record: JsonRecord,
  field: string,
  contract: string,
): number {
  const value = expectFiniteNumber(record, field, contract)

  if (!Number.isInteger(value)) {
    return contractFailure(contract, field, 'integer')
  }

  return value
}

function expectPositiveInteger(
  record: JsonRecord,
  field: string,
  contract: string,
): number {
  const value = expectInteger(record, field, contract)

  if (value <= 0) {
    return contractFailure(contract, field, 'positive integer')
  }

  return value
}

function expectNullablePositiveInteger(
  record: JsonRecord,
  field: string,
  contract: string,
): number | null {
  if (record[field] === null) {
    return null
  }

  return expectPositiveInteger(record, field, contract)
}

function expectBoolean(
  record: JsonRecord,
  field: string,
  contract: string,
): boolean {
  const value = record[field]

  if (typeof value !== 'boolean') {
    return contractFailure(contract, field, 'boolean')
  }

  return value
}

function expectDateOnly(
  record: JsonRecord,
  field: string,
  contract: string,
): string {
  const value = expectString(record, field, contract)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (match === null) {
    return contractFailure(contract, field, 'YYYY-MM-DD date')
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, monthIndex, day)

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return contractFailure(contract, field, 'valid calendar date')
  }

  return value
}

function expectUtcDateTime(
  record: JsonRecord,
  field: string,
  contract: string,
): string {
  const value = expectString(record, field, contract)
  const includesTimeZone = /(Z|[+-]\d{2}:\d{2})$/i.test(value)
  const normalizedValue = includesTimeZone ? value : `${value}Z`

  if (!Number.isFinite(Date.parse(normalizedValue))) {
    return contractFailure(contract, field, 'ISO-8601 date-time')
  }

  return normalizedValue
}

function expectPlanType(
  record: JsonRecord,
  field: string,
  contract: string,
): PlanType {
  const value = expectInteger(record, field, contract)

  if (!planTypeValues.has(value)) {
    return contractFailure(contract, field, 'supported plan type')
  }

  return value as PlanType
}

function parseArray<T>(
  value: unknown,
  contract: string,
  parseItem: (item: unknown) => T,
): readonly T[] {
  if (!Array.isArray(value)) {
    throw new ApiContractError(`${contract} must be a JSON array.`)
  }

  return value.map(parseItem)
}

export function parseParticipant(value: unknown): Participant {
  const contract = 'Participant'
  const record = expectRecord(value, contract)

  return {
    id: expectPositiveInteger(record, 'id', contract),
    firstName: expectString(record, 'firstName', contract),
    lastName: expectString(record, 'lastName', contract),
    email: expectString(record, 'email', contract),
    dateOfBirth: expectDateOnly(record, 'dateOfBirth', contract),
    createdAtUtc: expectUtcDateTime(record, 'createdAtUtc', contract),
  }
}

export function parseParticipants(value: unknown): readonly Participant[] {
  return parseArray(value, 'Participant[]', parseParticipant)
}

function parseEmployerSummary(value: unknown): EmployerSummary {
  const contract = 'EmployerSummary'
  const record = expectRecord(value, contract)

  return {
    id: expectPositiveInteger(record, 'id', contract),
    name: expectString(record, 'name', contract),
    industry: expectNullableString(record, 'industry', contract),
  }
}

export function parsePlan(value: unknown): Plan {
  const contract = 'Plan'
  const record = expectRecord(value, contract)
  const employerId = expectNullablePositiveInteger(record, 'employerId', contract)
  const employer =
    record.employer === null ? null : parseEmployerSummary(record.employer)

  if ((employerId === null) !== (employer === null)) {
    throw new ApiContractError(
      'Plan employerId and employer must either both be null or both be present.',
    )
  }

  if (employer !== null && employer.id !== employerId) {
    throw new ApiContractError('Plan employerId must match employer.id.')
  }

  return {
    id: expectPositiveInteger(record, 'id', contract),
    participantId: expectPositiveInteger(record, 'participantId', contract),
    employerId,
    name: expectString(record, 'name', contract),
    type: expectPlanType(record, 'type', contract),
    openedOn: expectDateOnly(record, 'openedOn', contract),
    currentBalance: expectFiniteNumber(record, 'currentBalance', contract),
    annualContributionLimit: expectFiniteNumber(
      record,
      'annualContributionLimit',
      contract,
    ),
    isActive: expectBoolean(record, 'isActive', contract),
    employer,
  }
}

export function parsePlans(value: unknown): readonly Plan[] {
  return parseArray(value, 'Plan[]', parsePlan)
}

export function parseContribution(value: unknown): Contribution {
  const contract = 'Contribution'
  const record = expectRecord(value, contract)

  return {
    id: expectPositiveInteger(record, 'id', contract),
    planId: expectPositiveInteger(record, 'planId', contract),
    amount: expectFiniteNumber(record, 'amount', contract),
    contributionDate: expectDateOnly(record, 'contributionDate', contract),
    taxYear: expectPositiveInteger(record, 'taxYear', contract),
    description: expectNullableString(record, 'description', contract),
  }
}

export function parseContributions(value: unknown): readonly Contribution[] {
  return parseArray(value, 'Contribution[]', parseContribution)
}

function optionalString(record: JsonRecord, field: string): string | undefined {
  const value = record[field]

  if (value === undefined || value === null) {
    return undefined
  }

  return typeof value === 'string' ? value : undefined
}

export function tryParseProblemDetails(
  value: unknown,
): ApiProblemDetails | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined
  }

  const record = value as JsonRecord
  const status = record.status
  const code = record.code

  if (
    status !== undefined &&
    status !== null &&
    (typeof status !== 'number' || !Number.isInteger(status))
  ) {
    return undefined
  }

  if (
    code !== undefined &&
    code !== null &&
    (typeof code !== 'string' || !serviceErrorCodes.has(code))
  ) {
    return undefined
  }

  return {
    ...record,
    type: optionalString(record, 'type'),
    title: optionalString(record, 'title'),
    status: typeof status === 'number' ? status : undefined,
    detail: optionalString(record, 'detail'),
    instance: optionalString(record, 'instance'),
    code: typeof code === 'string' ? (code as ServiceErrorCode) : undefined,
  }
}
