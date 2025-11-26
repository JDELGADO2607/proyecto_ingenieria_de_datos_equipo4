require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const solactiveRoutes = require('./routes/solactiveRoutes');

// Create Express app
const app = express();

// MongoDB Connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Security Management API',
    version: '1.0.0',
    endpoints: {
      securities: {
        NewSec: 'POST /api/solactive/securities',
        UpdateSec: 'PUT /api/solactive/securities',
        DeleteFields: 'DELETE /api/solactive/securities/fields',
        DeleteDocument: 'DELETE /api/solactive/securities',
        Validation: 'PUT /api/solactive/validation/auto',
        UserValidation: 'PUT /api/solactive/validation/user',
        UserValidationReversal: 'PUT /api/solactive/validation/reversal',
        ConsultingBy: 'GET /api/solactive/securities/consult',
        ErrorConsulting: 'GET /api/solactive/securities/consult/errors',
        ViewAllSecurities: 'GET /api/solactive/views/securities',
        FilteredSecuritiesView: 'GET /api/solactive/views/securities/filtered',
        ValidationCount: 'GET /api/solactive/reports/validationCount',
        ViewValidationCount: 'GET /api/solactive/views/validationCount',
        ErrorTypeCount: 'GET /api/solactive/reports/errorTypes',
        VersionComp: 'GET /api/solactive/reports/versionComparison'
      }
    },
    queryParams: {
      // Basic Filters
      filters: 'ticker, negDate, region, assetClass, status',
      
      // Price Filters
      prices: 'ICEPrice, FactSetPrice, FactSetLateClose, EDIPrice',
      
      // Currency Filters
      currencies: 'ICECurrency, FactSetCurrency, FactSetLateCurrency, EDICurrency',
      
      // Time Filters
      dates: 'startDate, endDate, ICERecTimestamp, errorDate'
    }
  });
});

// Routes mount
app.use('/api/solactive', solactiveRoutes); // ← Más específico

// Error Handling Middleware
app.use(errorHandler);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Server and Port
const PORT = process.env.PORT || 3000; // ← CORREGIDO

const server = app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Security Management API Running');
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('Endpoints: http://localhost:${PORT}');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

// Not captured error handling
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});