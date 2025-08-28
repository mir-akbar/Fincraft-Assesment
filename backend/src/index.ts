import express from 'express';
import cors from 'cors';
import { invoiceRoutes } from './routes/invoices';
import { passengerRoutes } from './routes/passengers';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/passengers', passengerRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
