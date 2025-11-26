const express = require('express');
const router = express.Router();
const solactiveController = require('../controllers/solactiveController');

const {
    NewSec,
    UpdateSec,
    DeleteFields,
    Validation,
    UserValidation,
    ValidationCount,
    ErrorConsulting,
    ConsultingBy,
    UserValidationReversal,
    ViewAllSecurities,
    ViewValidationCount,
    FilteredSecuritiesView,
    VersionComp,
    DeleteDocument,
    ErrorTypeCount  
} = solactiveController;

//  Security Management Routes
router.post('/securities', NewSec);                          // Create Security
router.put('/securities', UpdateSec);                        // Update Security by ticker and negotiation date
router.put('/securities/fields', DeleteFields);              // Delete fields of a security by ticker and negotiaton date
router.delete('/securities', DeleteDocument);                // Delete document by ticker and negotiation date

// Validation Routes 
router.put('/validation/auto', Validation);                  // Auto Validation system by ticker and negotiation date 
router.put('/validation/user', UserValidation);              // User Validation execution by ticker and negotiation date
router.put('/validation/reversal', UserValidationReversal);  // User Validation Reversal by ticker and negotiation date

// Query Routes
router.get('/securities/consult', ConsultingBy);               // General consulting by ticker and negotiation date
router.get('/securities/consult/errors', ErrorConsulting);     // Error consulting by ticker and negotiation date

// View Routes
router.get('/views/securities', ViewAllSecurities);          // Complete securities information
router.get('/views/securities/filtered', FilteredSecuritiesView); // Filtered securities information

// Report Routes
router.get('/reports/validationCount', ValidationCount);    // Validation count report by status
router.get('/views/validationCount', ViewValidationCount);  // Specific view of validation counts
router.get('/reports/errorTypes', ErrorTypeCount);          // Error type count report
router.get('/reports/versionComparison', VersionComp);      // Version comparison with stats of error types accounting and status accounting

module.exports = router;
