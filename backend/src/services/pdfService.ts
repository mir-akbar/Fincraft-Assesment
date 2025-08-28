import { InvoiceData } from '../types';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

export class PdfService {
  async parseInvoice(pdfPath: string): Promise<InvoiceData | null> {
    try {
      console.log(`Reading PDF file: ${pdfPath}`);
      
      // First, check if we have real extracted data from the airline service
      const extractedData = (global as any).lastExtractedInvoiceData;
      
      if (extractedData && extractedData.invoiceNumber) {
        console.log('Using real extracted data from Thai Airways portal:', extractedData);
        
        // Convert the extracted data to our format
        const invoiceData: InvoiceData = {
          invoiceNumber: extractedData.invoiceNumber,
          date: this.formatDate(extractedData.invoiceDate),
          airline: 'Thai Airways International',
          amount: parseFloat(extractedData.totalAmount?.replace(/,/g, '') || '0'),
          gstin: extractedData.gstNumber
        };
        
        // Clear the global data after use
        delete (global as any).lastExtractedInvoiceData;
        
        console.log('Converted to invoice data format:', invoiceData);
        return invoiceData;
      }
      
      // Fallback: try to parse from PDF if no extracted data available
      console.log('No extracted data available, attempting to parse PDF...');
      const pdfBuffer = await fs.readFile(pdfPath);
      const data = await pdfParse(pdfBuffer);
      
      // Extract text from PDF
      const text = data.text;
      console.log('PDF text length:', text.length);
      console.log('First 1000 characters of PDF text:');
      console.log(text.substring(0, 1000));
      console.log('---');
      
      // Parse invoice data using regex patterns
      const invoiceData = this.extractInvoiceData(text);
      
      return invoiceData;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  private extractInvoiceData(text: string): InvoiceData | null {
    try {
      console.log('Extracting data from PDF text...');
      console.log('PDF text preview:', text.substring(0, 500));
      
      // Clean the text of any problematic characters
      const cleanText = text.replace(/\s+/g, ' ').trim();
      
      // Thai Airways specific patterns based on the REAL invoice format
      // From the screenshot: Invoice No: 27P2410IV002348, Date: 14/10/2024, etc.
      const invoiceNumberPattern = /Invoice\s*No[\.:]?\s*([0-9]{2}[A-Z][0-9]{4}[A-Z]{2}[0-9]{6})/i;
      const datePattern = /(?:Invoice\s*Date|Date)\s*:?\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;
      const totalAmountPattern = /Total\s*(\d{1,3}(?:,\d{3})*\.?\d{0,2})/i;
      const gstNumberPattern = /GST\s*No[\.:]?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9])/i;
      const passengerNamePattern = /Passenger\s*Name\s*:?\s*([A-Z\/\s]+(?:MR|MS|MRS)?)/i;
      
      // Alternative patterns for robustness
      const altInvoicePattern = /([0-9]{2}[A-Z][0-9]{4}[A-Z]{2}[0-9]{6})/; // Pattern like 27P2410IV002348
      const altDatePattern = /(\d{1,2}\/\d{1,2}\/\d{4})/;
      const altAmountPattern = /(\d{1,3}(?:,\d{3})*\.?\d{0,2})/g;
      const altGstPattern = /([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9][A-Z][0-9])/; // Pattern like 27AABCB3524G1Z1
      
      // Thai Airways specific patterns
      const thaiAirwaysPattern = /THAI\s*AIRWAYS/i;
      
      let airline = 'Unknown';
      if (thaiAirwaysPattern.test(cleanText)) {
        airline = 'Thai Airways International';
      }

      // Try to extract invoice number
      let invoiceNumber = '';
      const invoiceNumberMatch = cleanText.match(invoiceNumberPattern) || cleanText.match(altInvoicePattern);
      if (invoiceNumberMatch) {
        invoiceNumber = invoiceNumberMatch[1];
      }

      // Try to extract date
      let date = '';
      const dateMatch = cleanText.match(datePattern) || cleanText.match(altDatePattern);
      if (dateMatch) {
        date = this.formatDate(dateMatch[1]);
      }

      // Try to extract total amount
      let amount = 0;
      const totalMatch = cleanText.match(totalAmountPattern);
      if (totalMatch) {
        amount = parseFloat(totalMatch[1].replace(/,/g, ''));
      } else {
        // Fallback: find all amounts and take the largest one
        const allAmounts = cleanText.match(altAmountPattern);
        if (allAmounts && allAmounts.length > 0) {
          const amounts = allAmounts.map(amt => parseFloat(amt.replace(/,/g, '')));
          amount = Math.max(...amounts);
        }
      }

      // Try to extract GST number
      let gstin = undefined;
      const gstMatch = cleanText.match(gstNumberPattern) || cleanText.match(altGstPattern);
      if (gstMatch) {
        gstin = gstMatch[1];
      }

      console.log('Extracted data:', { invoiceNumber, date, airline, amount, gstin });

      // Only fallback to simulated data if we can't extract ANY real data
      if (!invoiceNumber && !amount && !gstin) {
        console.log('No real invoice data found in PDF, this might be a generated mock PDF');
        console.log('PDF content does not match expected Thai Airways format');
        return null; // Don't generate fake data, return null to indicate parsing failure
      }

      return {
        invoiceNumber: invoiceNumber || 'N/A',
        date: date || new Date().toISOString().split('T')[0],
        airline,
        amount: amount || 0,
        gstin
      };
    } catch (error) {
      console.error('Error extracting invoice data:', error);
      return null; // Return null instead of generating fake data
    }
  }

  private formatDate(dateString: string): string {
    try {
      // Convert various date formats to YYYY-MM-DD
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  private generateSimulatedInvoiceData(): InvoiceData {
    const airlines = ['Air India', 'IndiGo', 'SpiceJet', 'Vistara', 'GoAir'];
    const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
    
    return {
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString().split('T')[0],
      airline: randomAirline,
      amount: Math.floor(Math.random() * 50000) + 5000, // Random amount between 5000-55000
      gstin: `22AAAAA0000A1Z${Math.floor(Math.random() * 10)}`
    };
  }
}
