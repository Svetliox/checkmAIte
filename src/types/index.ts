/**
 * Central export for all TypeScript types
 */

export * from './chess';

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/** Pagination parameters */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** User session (for future auth) */
export interface UserSession {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
