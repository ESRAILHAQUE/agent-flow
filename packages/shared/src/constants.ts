// ============================================================
// AgentFlow — Shared Constants
// ============================================================

/** User roles across the platform */
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORG_OWNER: 'ORG_OWNER',
  TEAM_MEMBER: 'TEAM_MEMBER',
} as const;

/** Organization subscription plans */
export const ORG_PLANS = {
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const;

/** Plan limits (messages per month) */
export const PLAN_LIMITS = {
  FREE: {
    messagesPerMonth: 100,
    documentsPerMonth: 5,
    maxDocumentSizeMb: 10,
    maxTeamMembers: 3,
  },
  PRO: {
    messagesPerMonth: 5000,
    documentsPerMonth: 50,
    maxDocumentSizeMb: 50,
    maxTeamMembers: 25,
  },
  ENTERPRISE: {
    messagesPerMonth: Infinity,
    documentsPerMonth: Infinity,
    maxDocumentSizeMb: 200,
    maxTeamMembers: Infinity,
  },
} as const;

/** Lead statuses */
export const LEAD_STATUSES = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST',
} as const;

/** Document processing statuses */
export const DOCUMENT_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  ERROR: 'ERROR',
} as const;

/** Agent types */
export const AGENT_TYPES = {
  DEFAULT: 'default',
  MANAGER: 'manager',
  RESEARCH: 'research',
  WRITER: 'writer',
  REVIEWER: 'reviewer',
} as const;

/** API response status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
