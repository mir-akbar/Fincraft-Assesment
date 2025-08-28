import { PassengerData } from '../src/types';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory already exists
}

// Read and parse CSV data
const csvPath = path.join(__dirname, '../data/data.csv');
let csvContent = readFileSync(csvPath, 'utf-8');

// Fix the CSV header by removing trailing comma
csvContent = csvContent.replace('Ticket Number,First Name,Last Name,', 'Ticket Number,First Name,Last Name');

const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  relax_column_count: true, // Allow inconsistent column counts
});

// Convert to PassengerData format
const passengers: PassengerData[] = records
  .filter((record: any) => record['Ticket Number'] && record['First Name'] && record['Last Name'])
  .map((record: any): PassengerData => ({
    id: uuidv4(),
    ticketNumber: record['Ticket Number'].trim(),
    firstName: record['First Name'].trim(),
    lastName: record['Last Name'].trim(),
    downloadStatus: 'pending',
    parseStatus: 'pending',
  }));

// Write to JSON file
const outputPath = path.join(dataDir, 'passengers.json');
writeFileSync(outputPath, JSON.stringify(passengers, null, 2));

console.log(`Converted ${passengers.length} passenger records to JSON format`);
console.log(`Passenger data saved to ${outputPath}`);
