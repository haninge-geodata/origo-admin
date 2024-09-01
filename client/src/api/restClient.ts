class RestClient {
  private _baseUrl: string | null = null;
  private _proxyUrl: string;

  constructor() {
    this._proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || "/api/proxy";
  }

  setBaseUrl(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    return headers;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    if (!this._baseUrl) {
      throw new Error("Base URL is not set");
    }

    const apiUrl = new URL(path, this._baseUrl).toString();
    const proxyUrl = new URL(this._proxyUrl, window.location.origin);
    proxyUrl.searchParams.append("url", apiUrl);

    const headers = this.getHeaders();
    const options: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(proxyUrl.toString(), options);

    if (!response.ok) {
      console.error("Error Response not ok");
      console.error("Error Response:", response);
      const errorText = await response.text();
      console.error("Error Details:", errorText);
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data as T;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const requestBody = body == null || body === undefined || Object.keys(body).length === 0 ? {} : body;
    return this.request<T>("POST", path, requestBody);
  }

  async put<T>(path: string, body: any): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async delete<T>(path: string): Promise<void> {
    await this.request<T>("DELETE", path);
  }
}

export { RestClient };
