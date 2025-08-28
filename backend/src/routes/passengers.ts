import express from 'express';
import { PassengerData, ApiResponse } from '../types';
import { PassengerService } from '../services/passengerService';

const router = express.Router();
const passengerService = new PassengerService();

// Get all passengers
router.get('/', async (req, res) => {
  try {
    const passengers = await passengerService.getAllPassengers();
    const response: ApiResponse<PassengerData[]> = {
      success: true,
      data: passengers
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching passengers:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch passengers'
    };
    res.status(500).json(response);
  }
});

// Get passenger by ID
router.get('/:id', async (req, res) => {
  try {
    const passenger = await passengerService.getPassengerById(req.params.id);
    if (!passenger) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Passenger not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<PassengerData> = {
      success: true,
      data: passenger
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching passenger:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch passenger'
    };
    res.status(500).json(response);
  }
});

// Download invoice for passenger
router.post('/:id/download', async (req, res) => {
  console.log(`Download request for passenger ID: ${req.params.id}`);
  
  try {
    const passenger = await passengerService.downloadInvoice(req.params.id);
    const response: ApiResponse<PassengerData> = {
      success: true,
      data: passenger,
      message: 'Invoice download initiated'
    };
    console.log('Download successful, sending response');
    res.json(response);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download invoice'
    };
    res.status(500).json(response);
  }
});

// Parse invoice for passenger
router.post('/:id/parse', async (req, res) => {
  try {
    const passenger = await passengerService.parseInvoice(req.params.id);
    const response: ApiResponse<PassengerData> = {
      success: true,
      data: passenger,
      message: 'Invoice parsed successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error parsing invoice:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse invoice'
    };
    res.status(500).json(response);
  }
});

export { router as passengerRoutes };
