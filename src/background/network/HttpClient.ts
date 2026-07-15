// network/httpClient.ts

import { HttpError } from "./HttpError";
import { Storage } from "../storage/Storage";


export class HttpClient {
  private readonly baseUrl: string;
  private readonly storage: Storage;

  constructor(
    baseUrl: string,
    storage: Storage,
  ) {
    this.baseUrl = baseUrl;
    this.storage = storage;
  }

  get<T>(
    path: string,
    query?: Record<string, unknown>,
    requireAuth = true,
  ) {
    return this.request<T>({
      path,
      method: "GET",
      query,
      requireAuth,
    });
  }

  post<T>(
    path: string,
    body?: unknown,
    requireAuth = true,
  ) {
    return this.request<T>({
      path,
      method: "POST",
      body,
      requireAuth,
    });
  }

  patch<T>(
    path: string,
    body?: unknown,
    requireAuth = true,
  ) {
    return this.request<T>({
      path,
      method: "PATCH",
      body,
      requireAuth,
    });
  }

  put<T>(
    path: string,
    body?: unknown,
    requireAuth = true,
  ) {
    return this.request<T>({
      path,
      method: "PUT",
      body,
      requireAuth,
    });
  }

  async request<T>({
    path,
    method,
    body,
    query,
    requireAuth = true,
  }:{
    path: string;
    method: string;
    body?: unknown;
    query?: Record<string, unknown>;
    requireAuth?: boolean;
  }): Promise<T> {

    const url = new URL(path, this.baseUrl);

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v != null) {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const headers = new Headers();

    if (body) {
      headers.set("Content-Type", "application/json");
    }

    if (requireAuth) {
      const token = await this.storage.getToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body == null ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => undefined);

      throw new HttpError(
        response.status,
        error,
      );
    }

    if (response.status === 204)
      return undefined as T;

    return response.json();
  }
}