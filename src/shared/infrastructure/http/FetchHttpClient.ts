import type { HttpClient, HttpRequestConfig } from "../../application/HttpClient";

export class FetchHttpClient implements HttpClient {
  constructor(private readonly config?: { baseUrl: string }) {}

  private async request<T>(url: string, options: RequestInit, params?: Record<string, unknown>): Promise<T> {
    let baseUrl = this.config?.baseUrl;

    if (baseUrl && !baseUrl.endsWith("/")) {
      baseUrl += "/";
    }

    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

    const urlObj = new URL(cleanUrl, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(urlObj.toString(), options);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  }

  async get<T>(url: string, config?: Omit<HttpRequestConfig, "body">): Promise<T> {
    return this.request<T>(
      url,
      {
        method: "GET",
        headers: config?.headers,
      },
      config?.params,
    );
  }
}
