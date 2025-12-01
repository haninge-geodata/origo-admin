import envStore from "@/stores/Environment";
import { RestClient } from "./restClient";
import { globalEventEmitter } from "@/utils/EventEmitter";

export class BaseApiService<T> {
  private _baseUrlEnv = "BASE_URL";
  private _baseUrl: string | null = null;
  private _baseUrlFetched: boolean = false;
  private _restClient: RestClient;
  resourcePath: string;

  constructor(resourcePath: string, baseUrl = "") {
    this.resourcePath = resourcePath;
    this._baseUrl = baseUrl;

    this._restClient = new RestClient();
    if (baseUrl) {
      this._baseUrl = baseUrl;
      this._baseUrlFetched = true;
    }
  }
  async getBaseUrl() {
    if (this._baseUrlFetched) {
      return this._baseUrl!;
    } else {
      return this.fetchBaseUrlAsync();
    }
  }

  protected async executeWithEvents(operation: () => Promise<any>) {
    globalEventEmitter.emit("loading", true);
    try {
      const result = await operation();
      return result;
    } catch (error: any) {
      globalEventEmitter.emit("error", error.message || "An error occurred");
      throw error;
    } finally {
      globalEventEmitter.emit("loading", false);
    }
  }

  async getRestClient() {
    this._restClient.setBaseUrl(await this.getBaseUrl());
    return this._restClient;
  }
  private async fetchBaseUrlAsync(): Promise<string> {
    if (!this._baseUrl) {
      this._baseUrl = await envStore(this._baseUrlEnv);
      this._baseUrlFetched = true;
    }
    return this._baseUrl;
  }
  async fetch(id: string, subPath?: string): Promise<T> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<T>(`${this.resourcePath}${subPath ? `/${subPath}` : ''}/${id}`);
      return response;
    });
  }

  async fetchAll(subPath?: string): Promise<T[]> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).get<T[]>(`${this.resourcePath}${subPath ? `/${subPath}` : ''}`);
      return response;
    });
  }

  async add(resource: T, subPath?: string): Promise<T> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<T>(`${this.resourcePath}${subPath ? `/${subPath}` : ''}`, resource);
      return response;
    });
  }

  async addRange(resource: T[], subPath?: string): Promise<T[]> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).post<T[]>(`${this.resourcePath}${subPath ? `/${subPath}` : ''}`, resource);
      return response;
    });
  }

  async update(id: string, resource: T, subPath?: string): Promise<T> {
    return this.executeWithEvents(async () => {
      const response = (await this.getRestClient()).put<T>(`${this.resourcePath}${subPath ? `/${subPath}` : ''}/${id}`, resource);
      return response;
    });
  }

  async delete(id: string, subPath?: string): Promise<T> {
    return this.executeWithEvents(async () => {
      await this._restClient.delete<T>(`${this.resourcePath}${subPath ? `/${subPath}` : ''}/${id}`);
    });
  }
}
