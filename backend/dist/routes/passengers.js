"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passengerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const passengerService_1 = require("../services/passengerService");
const router = express_1.default.Router();
exports.passengerRoutes = router;
const passengerService = new passengerService_1.PassengerService();
// Get all passengers
router.get('/', async (req, res) => {
    try {
        const passengers = await passengerService.getAllPassengers();
        const response = {
            success: true,
            data: passengers
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching passengers:', error);
        const response = {
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
            const response = {
                success: false,
                error: 'Passenger not found'
            };
            return res.status(404).json(response);
        }
        const response = {
            success: true,
            data: passenger
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching passenger:', error);
        const response = {
            success: false,
            error: 'Failed to fetch passenger'
        };
        res.status(500).json(response);
    }
});
// Download invoice for passenger
router.post('/:id/download', async (req, res) => {
    try {
        const passenger = await passengerService.downloadInvoice(req.params.id);
        const response = {
            success: true,
            data: passenger,
            message: 'Invoice download initiated'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error downloading invoice:', error);
        const response = {
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
        const response = {
            success: true,
            data: passenger,
            message: 'Invoice parsed successfully'
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error parsing invoice:', error);
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to parse invoice'
        };
        res.status(500).json(response);
    }
});
