export interface PassengerData {
  id: string;
  ticketNumber: string;
  firstName: string;
  lastName: string;
  downloadStatus: 'pending' | 'success' | 'not_found' | 'error';
  parseStatus: 'pending' | 'success' | 'error';
  invoiceData?: InvoiceData;
  pdfPath?: string;
  errorMessage?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  airline: string;
  amount: number;
  gstin?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  airlineTotals: Record<string, { count: number; amount: number }>;
  highValueInvoices: InvoiceData[];
}

export type DownloadStatus = PassengerData['downloadStatus'];
export type ParseStatus = PassengerData['parseStatus'];
