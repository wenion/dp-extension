import type { Session } from "@/shared/types";

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type ListSessionsResponse = {
  items: readonly Session[];
  pagination: Pagination;
};