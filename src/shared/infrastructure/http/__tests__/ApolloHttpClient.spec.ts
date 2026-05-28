import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ApolloClient, gql } from "@apollo/client";
import { ApolloHttpClient } from "../ApolloHttpClient";

vi.mock("@apollo/client", async (importOriginal) => {
  const original = await importOriginal<typeof import("@apollo/client")>();

  const MockApolloClient = vi.fn().mockImplementation(function () {
    return {
      query: vi.fn(),
    };
  });

  return {
    ...original,
    ApolloClient: MockApolloClient,
    HttpLink: vi.fn(),
    InMemoryCache: vi.fn(),
    gql: original.gql,
  };
});

describe("ApolloHttpClient - Unit Test", () => {
  let apolloClientMockInstance: { query: CallableFunction };
  let httpClient: ApolloHttpClient;
  const baseUrl = "https://api.example.com/graphql";

  beforeEach(() => {
    vi.clearAllMocks();

    httpClient = new ApolloHttpClient({ baseUrl });
    apolloClientMockInstance = vi.mocked(ApolloClient).mock.results[0].value;
  });

  describe("Initialization & Infrastructure Setup", () => {
    it("should instantiate an ApolloClient instance with the correct default configuration profiles", () => {
      expect(ApolloClient).toHaveBeenCalledTimes(1);
      expect(ApolloClient).toHaveBeenCalledWith(
        expect.objectContaining({
          link: expect.any(Object),
          cache: expect.any(Object),
        }),
      );
    });
  });

  describe("get (GraphQL Queries)", () => {
    it("should transform raw string queries into a valid DocumentNode and resolve data matching server response contract", async () => {
      const mockServerPayload = {
        users: [
          { id: "1", firstName: "Angel" },
          { id: "2", firstName: "Core" },
        ],
      };

      const queryString = `
        query GetUsers($role: String!) {
          users(role: $role) {
            id
            firstName
          }
        }
      `;

      const requestConfig = {
        params: { role: "developer" },
        headers: { Authorization: "Bearer mock-jwt-token" },
      };

      vi.mocked(apolloClientMockInstance.query as Mock).mockResolvedValue({
        data: mockServerPayload,
        loading: false,
        networkStatus: 7,
      });

      const result = await httpClient.get<typeof mockServerPayload>(queryString, requestConfig);
      expect(result).toEqual(mockServerPayload);
      expect(apolloClientMockInstance.query).toHaveBeenCalledTimes(1);
      expect(apolloClientMockInstance.query).toHaveBeenCalledWith({
        query: gql`
          ${queryString}
        `,
        variables: { role: "developer" },
        context: { headers: { Authorization: "Bearer mock-jwt-token" } },
        fetchPolicy: "network-only",
      });
    });

    it("should propagate exceptions up the execution tree if the ApolloClient client query driver crashes", async () => {
      const graphQLError = new Error("GraphQL Error: Field 'lastName' does not exist on type 'User'");
      vi.mocked(apolloClientMockInstance.query as Mock).mockRejectedValue(graphQLError);
      const invalidQuery = `query { invalidField }`;
      await expect(httpClient.get(invalidQuery)).rejects.toThrow(
        "GraphQL Error: Field 'lastName' does not exist on type 'User'",
      );
    });
  });
});
