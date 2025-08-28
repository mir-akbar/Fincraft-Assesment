import { PassengerData, InvoiceData, Status } from '../types';
import { PdfService } from './pdfService';
import { AirlineService } from './airlineService';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class PassengerService {
  private passengers: Map<string, PassengerData> = new Map();
  private pdfService = new PdfService();
  private airlineService = new AirlineService();
  private dataFile = path.join(__dirname, '../../data/passengers.json');
  private isLoaded = false;

  constructor() {
    // Don't load in constructor - load when first accessed
  }

  private async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      // Try to load existing JSON data first to preserve states
      try {
        const data = await fs.readFile(this.dataFile, 'utf-8');
        const existingPassengers: PassengerData[] = JSON.parse(data);
        existingPassengers.forEach(passenger => {
          this.passengers.set(passenger.id, passenger);
        });
        console.log(`Loaded ${existingPassengers.length} passengers from JSON data`);
      } catch (error) {
        // File doesn't exist, load from CSV data instead
        console.log('No existing passenger data found, loading from CSV');
        const csvData = await this.loadPassengersFromCsv();
        csvData.forEach(passenger => {
          this.passengers.set(passenger.id, passenger);
        });
        console.log(`Loaded ${csvData.length} passengers from CSV data`);
        // Save the CSV data as JSON for future use
        await this.savePassengers();
      }
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading passengers:', error);
      this.isLoaded = true; // Set to true to avoid infinite retry
    }
  }

  private async loadPassengersFromCsv(): Promise<PassengerData[]> {
    const csvPath = path.join(__dirname, '../../data/data.csv');
    try {
      const csvContent = await fs.readFile(csvPath, 'utf-8');
      const lines = csvContent.split('\n').slice(1); // Skip header
      
      return lines
        .filter(line => line.trim() && !line.startsWith(',,')) // Filter empty lines
        .map(line => {
          const [ticketNumber, firstName, lastName] = line.split(',');
          return {
            id: uuidv4(),
            ticketNumber: ticketNumber?.trim() || '',
            firstName: firstName?.trim() || '',
            lastName: lastName?.trim() || '',
            downloadStatus: 'pending' as const,
            parseStatus: 'pending' as const
          };
        })
        .filter(passenger => passenger.ticketNumber); // Only include passengers with ticket numbers
    } catch (error) {
      console.error('Error reading CSV file:', error);
      return [];
    }
  }

  private async savePassengers(): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      const passengers = Array.from(this.passengers.values());
      await fs.writeFile(this.dataFile, JSON.stringify(passengers, null, 2));
    } catch (error) {
      console.error('Error saving passengers:', error);
    }
  }

  async getAllPassengers(): Promise<PassengerData[]> {
    await this.ensureLoaded();
    return Array.from(this.passengers.values());
  }

  async getPassengerById(id: string): Promise<PassengerData | undefined> {
    await this.ensureLoaded();
    return this.passengers.get(id);
  }

  async downloadInvoice(id: string): Promise<PassengerData> {
    console.log(`PassengerService: downloadInvoice called for ID: ${id}`);
    
    await this.ensureLoaded();
    const passenger = this.passengers.get(id);
    if (!passenger) {
      console.log(`Passenger not found with ID: ${id}`);
      throw new Error('Passenger not found');
    }

    console.log(`Found passenger: ${passenger.firstName} ${passenger.lastName}`);

    try {
      // Update status to indicate download in progress
      passenger.downloadStatus = 'pending';
      await this.savePassengers();
      console.log('Updated passenger status to pending');

      // Simulate download from airline portal
      console.log('Calling airline service...');
      const pdfPath = await this.airlineService.downloadInvoice(passenger);
      console.log(`Airline service returned: ${pdfPath}`);
      
      if (pdfPath) {
        passenger.downloadStatus = 'success';
        passenger.pdfPath = pdfPath;
        passenger.errorMessage = undefined;
        console.log('Download successful');
      } else {
        passenger.downloadStatus = 'not_found';
        passenger.errorMessage = 'Invoice not found for this passenger';
        console.log('Download failed - invoice not found');
      }
    } catch (error) {
      console.error('Download error in PassengerService:', error);
      passenger.downloadStatus = 'error';
      passenger.errorMessage = error instanceof Error ? error.message : 'Download failed';
    }

    this.passengers.set(id, passenger);
    await this.savePassengers();
    console.log('Passenger data saved, returning result');
    return passenger;
  }

  async parseInvoice(id: string): Promise<PassengerData> {
    await this.ensureLoaded();
    const passenger = this.passengers.get(id);
    if (!passenger) {
      throw new Error('Passenger not found');
    }

    if (!passenger.pdfPath || passenger.downloadStatus !== 'success') {
      throw new Error('No PDF available to parse. Please download the invoice first.');
    }

    try {
      passenger.parseStatus = 'pending';
      await this.savePassengers();

      const invoiceData = await this.pdfService.parseInvoice(passenger.pdfPath);
      
      if (invoiceData) {
        passenger.parseStatus = 'success';
        passenger.invoiceData = invoiceData;
        passenger.errorMessage = undefined;
      } else {
        passenger.parseStatus = 'error';
        passenger.errorMessage = 'Failed to extract invoice data from PDF';
      }
    } catch (error) {
      passenger.parseStatus = 'error';
      passenger.errorMessage = error instanceof Error ? error.message : 'Parsing failed';
    }

    this.passengers.set(id, passenger);
    await this.savePassengers();
    return passenger;
  }
}
