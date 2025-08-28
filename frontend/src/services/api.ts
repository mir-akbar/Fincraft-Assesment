import type { PassengerData, InvoiceData, InvoiceSummary, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Passenger endpoints
  async getPassengers(): Promise<ApiResponse<PassengerData[]>> {
    return this.makeRequest<PassengerData[]>('/passengers');
  }

  async getPassenger(id: string): Promise<ApiResponse<PassengerData>> {
    return this.makeRequest<PassengerData>(`/passengers/${id}`);
  }

  async downloadInvoice(id: string): Promise<ApiResponse<PassengerData>> {
    return this.makeRequest<PassengerData>(`/passengers/${id}/download`, {
      method: 'POST',
    });
  }

  async parseInvoice(id: string): Promise<ApiResponse<PassengerData>> {
    return this.makeRequest<PassengerData>(`/passengers/${id}/parse`, {
      method: 'POST',
    });
  }

  // Invoice endpoints
  async getInvoices(): Promise<ApiResponse<InvoiceData[]>> {
    return this.makeRequest<InvoiceData[]>('/invoices');
  }

  async getInvoiceSummary(): Promise<ApiResponse<InvoiceSummary>> {
    return this.makeRequest<InvoiceSummary>('/invoices/summary');
  }

  async getHighValueInvoices(threshold: number = 30000): Promise<ApiResponse<InvoiceData[]>> {
    return this.makeRequest<InvoiceData[]>(`/invoices/high-value?threshold=${threshold}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message?: string }>> {
    return this.makeRequest<{ status: string; message?: string }>('/health');
  }
}

export const apiService = new ApiService();
