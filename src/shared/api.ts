import type { Session } from "@/shared/types";

export type RequestOptions = {
  path: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, unknown>;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type ListSessionsResponse = {
  items: readonly Session[];
  pagination: Pagination;
};

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
};
