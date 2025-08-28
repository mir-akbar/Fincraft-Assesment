"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassengerService = void 0;
const pdfService_1 = require("./pdfService");
const airlineService_1 = require("./airlineService");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
class PassengerService {
    constructor() {
        this.passengers = new Map();
        this.pdfService = new pdfService_1.PdfService();
        this.airlineService = new airlineService_1.AirlineService();
        this.dataFile = path_1.default.join(__dirname, '../../data/passengers.json');
        this.isLoaded = false;
        // Don't load in constructor - load when first accessed
    }
    async ensureLoaded() {
        if (this.isLoaded)
            return;
        try {
            // Load from CSV data first
            const csvData = await this.loadPassengersFromCsv();
            csvData.forEach(passenger => {
                this.passengers.set(passenger.id, passenger);
            });
            // Then try to load existing JSON data to preserve states
            try {
                const data = await promises_1.default.readFile(this.dataFile, 'utf-8');
                const existingPassengers = JSON.parse(data);
                existingPassengers.forEach(passenger => {
                    this.passengers.set(passenger.id, passenger);
                });
            }
            catch (error) {
                // File doesn't exist yet, that's ok
                console.log('No existing passenger data found, starting fresh');
            }
            this.isLoaded = true;
        }
        catch (error) {
            console.error('Error loading passengers:', error);
            this.isLoaded = true; // Set to true to avoid infinite retry
        }
    }
    async loadPassengersFromCsv() {
        const csvPath = path_1.default.join(__dirname, '../../data/data.csv');
        try {
            const csvContent = await promises_1.default.readFile(csvPath, 'utf-8');
            const lines = csvContent.split('\n').slice(1); // Skip header
            return lines
                .filter(line => line.trim() && !line.startsWith(',,')) // Filter empty lines
                .map(line => {
                const [ticketNumber, firstName, lastName] = line.split(',');
                return {
                    id: (0, uuid_1.v4)(),
                    ticketNumber: ticketNumber?.trim() || '',
                    firstName: firstName?.trim() || '',
                    lastName: lastName?.trim() || '',
                    downloadStatus: 'pending',
                    parseStatus: 'pending'
                };
            })
                .filter(passenger => passenger.ticketNumber); // Only include passengers with ticket numbers
        }
        catch (error) {
            console.error('Error reading CSV file:', error);
            return [];
        }
    }
    async savePassengers() {
        try {
            // Ensure data directory exists
            const dataDir = path_1.default.dirname(this.dataFile);
            await promises_1.default.mkdir(dataDir, { recursive: true });
            const passengers = Array.from(this.passengers.values());
            await promises_1.default.writeFile(this.dataFile, JSON.stringify(passengers, null, 2));
        }
        catch (error) {
            console.error('Error saving passengers:', error);
        }
    }
    async getAllPassengers() {
        await this.ensureLoaded();
        return Array.from(this.passengers.values());
    }
    async getPassengerById(id) {
        await this.ensureLoaded();
        return this.passengers.get(id);
    }
    async downloadInvoice(id) {
        await this.ensureLoaded();
        const passenger = this.passengers.get(id);
        if (!passenger) {
            throw new Error('Passenger not found');
        }
        try {
            // Update status to indicate download in progress
            passenger.downloadStatus = 'pending';
            await this.savePassengers();
            // Simulate download from airline portal
            const pdfPath = await this.airlineService.downloadInvoice(passenger);
            if (pdfPath) {
                passenger.downloadStatus = 'success';
                passenger.pdfPath = pdfPath;
                passenger.errorMessage = undefined;
            }
            else {
                passenger.downloadStatus = 'not_found';
                passenger.errorMessage = 'Invoice not found for this passenger';
            }
        }
        catch (error) {
            passenger.downloadStatus = 'error';
            passenger.errorMessage = error instanceof Error ? error.message : 'Download failed';
        }
        this.passengers.set(id, passenger);
        await this.savePassengers();
        return passenger;
    }
    async parseInvoice(id) {
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
            }
            else {
                passenger.parseStatus = 'error';
                passenger.errorMessage = 'Failed to extract invoice data from PDF';
            }
        }
        catch (error) {
            passenger.parseStatus = 'error';
            passenger.errorMessage = error instanceof Error ? error.message : 'Parsing failed';
        }
        this.passengers.set(id, passenger);
        await this.savePassengers();
        return passenger;
    }
}
exports.PassengerService = PassengerService;
