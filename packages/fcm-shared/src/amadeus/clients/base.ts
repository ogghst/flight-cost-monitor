import axios, { AxiosError } from 'axios'
import { ErrorResponse } from '../types/common.js'

export class AmadeusApiError extends Error {
  constructor(public response: ErrorResponse) {
    super(
      response.errors[0]?.detail ||
        response.errors[0]?.title ||
        'Unknown Amadeus API Error'
    )
    this.name = 'AmadeusApiError'
  }
}

export class ClientConfig {
  baseUrl?: string
  clientId: string
  clientSecret: string
  timeout: number

  constructor(config: {
    baseUrl?: string
    clientId: string
    clientSecret: string
    timeout: number
  }) {
    this.baseUrl = config.baseUrl || 'https://test.api.amadeus.com'
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.timeout = config.timeout
  }
}

export abstract class BaseClient {
  protected baseUrl: string
  protected accessToken: string | null
  protected clientId: string
  protected clientSecret: string
  protected tokenExpiration: number
  protected timeout: number

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl || 'https://test.api.amadeus.com'
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.accessToken = null
    this.tokenExpiration = 0
    this.timeout = config.timeout
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data
      if (data) {
        return `${data.error_description || data.error || 'Unknown error'} (Code: ${data.code || 'N/A'})`
      }
      return error.message
    }
    return 'Unknown error occurred'
  }

  public async getAccessToken(): Promise<string | null> {
    try {
      console.log('Requesting access token from Amadeus API...')

      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      })

      const url = `${this.baseUrl}/v1/security/oauth2/token`

      console.log('Token request URL:', url)
      console.log('Client ID:', this.clientId)
      console.log('Request parameters:', params.toString())

      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: this.timeout,
      })

      console.log('Token response status:', response.status)

      this.accessToken = response.data.access_token
      this.tokenExpiration = Date.now() + response.data.expires_in * 1000

      console.log('Successfully obtained access token')
      return this.accessToken
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error)
      console.error('Token retrieval error details:', errorMessage)

      if (error instanceof AxiosError) {
        console.error('Full error response:', error.response?.data)
      }

      throw new Error(`Failed to retrieve access token: ${errorMessage}`)
    }
  }

  private async ensureValidToken(): Promise<string | null> {
    if (!this.accessToken || Date.now() >= this.tokenExpiration) {
      return this.getAccessToken()
    }
    return this.accessToken
  }

  protected async request<T>(path: string, options: any = {}): Promise<T> {
    try {
      const accessToken = await this.ensureValidToken()
      const url = `${this.baseUrl}${path}`
      
      const axiosConfig = {
        ...options,
        url,
        timeout: this.timeout,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.amadeus+json',
          ...options.headers,
        },
      }

      console.log('Making API request to:', url)
      console.log('Request config:', axiosConfig)

      const response = await axios(axiosConfig)
      return response.data as T
    } catch (error) {
      console.error('Request failed:', error)
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new AmadeusApiError(error.response.data as ErrorResponse)
      }
      throw error
    }
  }

  protected async get<T>(path: string, options: any = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  protected async post<T>(path: string, body: unknown, options: any = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      data: body,
      headers: {
        'Content-Type': 'application/vnd.amadeus+json',
        ...options.headers,
      },
    })
  }
}
