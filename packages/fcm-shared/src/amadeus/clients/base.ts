/* eslint-disable max-classes-per-file */
import axios, { AxiosError } from 'axios';
import { ErrorResponse } from '../types/common.js';

export class AmadeusApiError extends Error {
  constructor(public response: ErrorResponse) {
    super(
      response.errors[0]?.detail ||
        response.errors[0]?.title ||
        'Unknown Amadeus API Error',
    );
    this.name = 'AmadeusApiError';
  }
}

export class ClientConfig {
  baseUrl?: string;
  clientId: string;
  clientSecret: string;

  constructor(config: {
    baseUrl?: string;
    clientId: string;
    clientSecret: string;
  }) {
    this.baseUrl = config.baseUrl || 'https://test.api.amadeus.com';
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
  }
}

export abstract class BaseClient {
  protected baseUrl: string;
  protected accessToken: string | null;
  protected clientId: string;
  protected clientSecret: string;
  protected tokenExpiration: number;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl || 'https://test.api.amadeus.com';
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = null;
    this.tokenExpiration = 0;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data;
      if (data) {
        return `${data.error_description || data.error || 'Unknown error'} (Code: ${data.code || 'N/A'})`;
      }
      return error.message;
    }
    return 'Unknown error occurred';
  }

  public async getAccessToken(): Promise<string> {
    try {
      console.log('Requesting access token from Amadeus API...');
      
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const url = `${this.baseUrl}/v1/security/oauth2/token`;
      
      console.log('Token request URL:', url);
      console.log('Client ID:', this.clientId);
      console.log('Request parameters:', params.toString());

      const response = await axios.post(
        url,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log('Token response status:', response.status);

      this.accessToken = response.data.access_token;
      this.tokenExpiration = Date.now() + response.data.expires_in * 1000;

      console.log('Successfully obtained access token');
      return this.accessToken;
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Token retrieval error details:', errorMessage);
      
      if (error instanceof AxiosError) {
        console.error('Full error response:', error.response?.data);
      }
      
      throw new Error(`Failed to retrieve access token: ${errorMessage}`);
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiration) {
      return this.getAccessToken();
    }
    return this.accessToken;
  }

  protected async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const accessToken = await this.ensureValidToken();
      const url = `${this.baseUrl}${path}`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.amadeus+json',
        ...options.headers,
      };

      console.log('Making API request to:', url);
      console.log('Request headers:', headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API request failed:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new AmadeusApiError(data as ErrorResponse);
      }

      return data as T;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  protected async get<T>(
    path: string,
    options: Omit<RequestInit, 'method'> = {},
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  protected async post<T>(
    path: string,
    body: unknown,
    options: Omit<RequestInit, 'method' | 'body'> = {},
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/vnd.amadeus+json',
        ...options.headers,
      },
    });
  }
}