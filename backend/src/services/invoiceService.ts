import { InvoiceData, InvoiceSummary, PassengerData } from '../types';
import { PassengerService } from './passengerService';

export class InvoiceService {
  private passengerService = new PassengerService();

  async getAllInvoices(): Promise<InvoiceData[]> {
    const passengers = await this.passengerService.getAllPassengers();
    
    return passengers
      .filter(p => p.invoiceData && p.parseStatus === 'success')
      .map(p => p.invoiceData!)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getSummary(): Promise<InvoiceSummary> {
    const invoices = await this.getAllInvoices();
    
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    
    // Calculate airline-wise totals
    const airlineTotals: Record<string, { count: number; amount: number }> = {};
    invoices.forEach(invoice => {
      if (!airlineTotals[invoice.airline]) {
        airlineTotals[invoice.airline] = { count: 0, amount: 0 };
      }
      airlineTotals[invoice.airline].count++;
      airlineTotals[invoice.airline].amount += invoice.amount;
    });

    // Get high-value invoices (above 30,000)
    const highValueInvoices = invoices.filter(invoice => invoice.amount > 30000);

    return {
      totalInvoices,
      totalAmount,
      airlineTotals,
      highValueInvoices
    };
  }

  async getHighValueInvoices(threshold: number = 30000): Promise<InvoiceData[]> {
    const invoices = await this.getAllInvoices();
    return invoices.filter(invoice => invoice.amount > threshold);
  }
}
