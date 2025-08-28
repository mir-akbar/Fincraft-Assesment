"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirlineService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class AirlineService {
    constructor() {
        this.uploadsDir = path_1.default.join(__dirname, '../../uploads');
        this.ensureUploadsDirectory();
    }
    async ensureUploadsDirectory() {
        try {
            await promises_1.default.mkdir(this.uploadsDir, { recursive: true });
        }
        catch (error) {
            console.error('Error creating uploads directory:', error);
        }
    }
    async downloadInvoice(passenger) {
        try {
            // Simulate airline portal interaction
            // In a real implementation, this would navigate to the airline portal
            // and download the actual PDF using the passenger's ticket number
            const simulatedSuccess = Math.random() > 0.3; // 70% success rate
            if (!simulatedSuccess) {
                // Simulate "invoice not found"
                return null;
            }
            // Generate a simulated PDF file for demonstration
            const pdfPath = await this.generateSimulatedPdf(passenger);
            return pdfPath;
        }
        catch (error) {
            console.error('Error downloading invoice:', error);
            throw new Error('Failed to download invoice from airline portal');
        }
    }
    async generateSimulatedPdf(passenger) {
        try {
            // Create a simple HTML invoice that we'll convert to PDF
            const htmlContent = this.generateInvoiceHtml(passenger);
            // Launch puppeteer to generate PDF
            const browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent);
            const fileName = `invoice_${passenger.ticketNumber}_${Date.now()}.pdf`;
            const filePath = path_1.default.join(this.uploadsDir, fileName);
            await page.pdf({
                path: filePath,
                format: 'A4',
                printBackground: true
            });
            await browser.close();
            return filePath;
        }
        catch (error) {
            console.error('Error generating simulated PDF:', error);
            throw new Error('Failed to generate invoice PDF');
        }
    }
    generateInvoiceHtml(passenger) {
        const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'GoAir'];
        const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
        const invoiceNumber = `INV-${passenger.ticketNumber}-${Date.now()}`;
        const amount = Math.floor(Math.random() * 50000) + 5000;
        const gstin = `22AAAAA0000A1Z${Math.floor(Math.random() * 10)}`;
        const currentDate = new Date().toLocaleDateString();
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .airline-name { font-size: 24px; font-weight: bold; color: #2c3e50; }
          .invoice-title { font-size: 20px; margin: 20px 0; }
          .details { margin: 20px 0; }
          .detail-row { margin: 10px 0; display: flex; justify-content: space-between; }
          .label { font-weight: bold; }
          .total { font-size: 18px; font-weight: bold; background: #f8f9fa; padding: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="airline-name">${randomAirline}</div>
          <div class="invoice-title">FLIGHT INVOICE</div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="label">Invoice Number:</span>
            <span>${invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date:</span>
            <span>${currentDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Ticket Number:</span>
            <span>${passenger.ticketNumber}</span>
          </div>
          <div class="detail-row">
            <span class="label">Passenger Name:</span>
            <span>${passenger.firstName} ${passenger.lastName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Airline:</span>
            <span>${randomAirline}</span>
          </div>
          <div class="detail-row">
            <span class="label">GSTIN:</span>
            <span>${gstin}</span>
          </div>
        </div>
        
        <div class="total">
          <div class="detail-row">
            <span class="label">Total Amount:</span>
            <span>Rs. ${amount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>This is a computer generated invoice.</p>
          <p>For any queries, please contact our customer service.</p>
        </div>
      </body>
      </html>
    `;
    }
}
exports.AirlineService = AirlineService;
