// network/httpClient.ts
import { env } from "@/config/env";

import { HttpError } from "./errors/HttpError";
import { NetworkError } from "./errors/NetworkError";

export class HttpClient {
  private readonly baseUrl = env.apiUrl;

  get<T>(
    path: string,
    query?: Record<string, unknown>,
  ) {
    return this.request<T>({
      path,
      method: "GET",
      query,
    });
  }

  post<T>(
    path: string,
    body?: unknown,
  ) {
    return this.request<T>({
      path,
      method: "POST",
      body,
    });
  }

  patch<T>(
    path: string,
    body?: unknown,
  ) {
    return this.request<T>({
      path,
      method: "PATCH",
      body,
    });
  }

  put<T>(
    path: string,
    body?: unknown,
  ) {
    return this.request<T>({
      path,
      method: "PUT",
      body,
    });
  }

  protected appendHeaders(headers: Headers): void {}

  protected async request<T>({
    path,
    method,
    body,
    query,
  }:{
    path: string;
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    query?: Record<string, unknown>;
  }): Promise<T> {

    const url = new URL(path, this.baseUrl);

    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v != null) {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const headers = this.buildHeaders();

    if (
      body != null &&
      !(body instanceof FormData)
    ) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }

    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers,
        body:
          body == null
            ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      });
    } catch (error) {
      throw new NetworkError(error);
    }

    if (!response.ok) {
      throw new HttpError(
        response.status,
        await response.json(),
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json() as T;
  }

  private buildHeaders(): Headers {
    const headers = new Headers();

    this.appendHeaders(headers);

    return headers;
  }
}