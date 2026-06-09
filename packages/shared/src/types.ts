// ============================================================
// AgentFlow — Shared Types
// Common interfaces used across frontend and backend
// ============================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Pagination query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

/** JWT payload */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  orgId?: string;
}

/** Auth tokens */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** User profile (safe to send to frontend) */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

/** Organization summary */
export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  role: string;
}

/** Analytics dashboard data */
export interface DashboardAnalytics {
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
  tokensUsed: number;
  leadsGenerated: number;
  emailsSent: number;
  conversationTrend: { date: string; count: number }[];
  tokenUsageTrend: { date: string; tokens: number }[];
}

/** Chat message for frontend */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tokens: number;
  toolCalls?: unknown;
  createdAt: string;
}

/** Conversation summary */
export interface ConversationSummary {
  id: string;
  title: string;
  agentType: string;
  lastMessage?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}
