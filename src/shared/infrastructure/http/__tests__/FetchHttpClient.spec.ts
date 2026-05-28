import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FetchHttpClient } from "../FetchHttpClient";

describe("FetchHttpClient - Unit Test", () => {
  const mockBaseUrl = "https://api.example.com";
  let client: FetchHttpClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new FetchHttpClient({ baseUrl: mockBaseUrl });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should successfully perform a GET request and resolve JSON data", async () => {
    const mockData = { id: 1, name: "Item" };
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockData),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    const result = await client.get<typeof mockData>("/items");

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items", {
      method: "GET",
      headers: undefined,
    });
    expect(result).toEqual(mockData);
  });

  it("should correctly format and append query parameters to the URL string", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({}),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await client.get("/search", {
      params: { q: "vitest", limit: 10, active: true },
    });

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/search?q=vitest&limit=10&active=true", {
      method: "GET",
      headers: undefined,
    });
  });

  it("should normalize slashes properly when constructing final URLs", async () => {
    const mockResponse = { ok: true, status: 200, json: vi.fn().mockResolvedValue({}) };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    const customizedClient = new FetchHttpClient({ baseUrl: "https://api.example.com/" });
    await customizedClient.get("/items");

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items", expect.any(Object));
  });

  it("should return an empty object literal directly if the response status is 204 No Content", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      json: vi.fn(),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    const result = await client.get("/empty");

    expect(result).toEqual({});
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should forward request headers configured in the contract options", async () => {
    const mockResponse = { ok: true, status: 200, json: vi.fn().mockResolvedValue({}) };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);
    const headers = { Authorization: "Bearer token-123" };

    await client.get("/secure", { headers });

    expect(fetch).toHaveBeenCalledWith("https://api.example.com/secure", {
      method: "GET",
      headers,
    });
  });

  it("should throw an explicit Error when response flag ok is evaluated to false", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await expect(client.get("/not-found")).rejects.toThrow("HTTP Error: 404 - Not Found");
  });
});
