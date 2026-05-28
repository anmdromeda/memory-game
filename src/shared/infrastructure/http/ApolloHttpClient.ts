import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { HttpLink } from "@apollo/client";
import type { HttpClient, HttpRequestConfig } from "../../application/HttpClient";

export class ApolloHttpClient implements HttpClient {
  private client: ApolloClient;

  constructor(readonly config?: { baseUrl: string }) {
    this.client = new ApolloClient({
      cache: new InMemoryCache({
        dataIdFromObject(responseObject) {
          if (responseObject.id) return `${responseObject.__typename}:${responseObject.id}`;
          return responseObject.__typename;
        },
      }),
      link: new HttpLink({ uri: this.config?.baseUrl }),
    });
  }

  async get<T>(query: string, config?: Omit<HttpRequestConfig, "body">): Promise<T> {
    const DYNAMIC_QUERY = gql`
      ${query}
    `;

    const response = await this.client.query<T>({
      query: DYNAMIC_QUERY,
      variables: { ...config?.params },
      context: { headers: config?.headers },
      fetchPolicy: "network-only",
    });

    return response.data as T;
  }
}
