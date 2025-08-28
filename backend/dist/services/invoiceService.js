"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const passengerService_1 = require("./passengerService");
class InvoiceService {
    constructor() {
        this.passengerService = new passengerService_1.PassengerService();
    }
    async getAllInvoices() {
        const passengers = await this.passengerService.getAllPassengers();
        return passengers
            .filter(p => p.invoiceData && p.parseStatus === 'success')
            .map(p => p.invoiceData)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    async getSummary() {
        const invoices = await this.getAllInvoices();
        const totalInvoices = invoices.length;
        const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        // Calculate airline-wise totals
        const airlineTotals = {};
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
    async getHighValueInvoices(threshold = 30000) {
        const invoices = await this.getAllInvoices();
        return invoices.filter(invoice => invoice.amount > threshold);
    }
}
exports.InvoiceService = InvoiceService;
