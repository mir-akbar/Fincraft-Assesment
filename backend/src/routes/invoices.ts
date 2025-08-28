import express from 'express';
import { InvoiceData, InvoiceSummary, ApiResponse } from '../types';
import { InvoiceService } from '../services/invoiceService'

const router = express.Router();
const invoiceService = new InvoiceService();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await invoiceService.getAllInvoices();
    const response: ApiResponse<InvoiceData[]> = {
      success: true,
      data: invoices
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch invoices'
    };
    res.status(500).json(response);
  }
});

// Get invoice summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await invoiceService.getSummary();
    const response: ApiResponse<InvoiceSummary> = {
      success: true,
      data: summary
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching invoice summary:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch invoice summary'
    };
    res.status(500).json(response);
  }
});

// Get high-value invoices
router.get('/high-value', async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold as string) || 30000;
    const highValueInvoices = await invoiceService.getHighValueInvoices(threshold);
    const response: ApiResponse<InvoiceData[]> = {
      success: true,
      data: highValueInvoices
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching high-value invoices:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch high-value invoices'
    };
    res.status(500).json(response);
  }
});

export { router as invoiceRoutes };
