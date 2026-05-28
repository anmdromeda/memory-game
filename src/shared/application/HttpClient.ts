export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
}

export interface HttpClient {
  get<T>(url: string, config?: Omit<HttpRequestConfig, "body">): Promise<T>;
}
