const mongoose = require('mongoose');
const Solactive = require('../models/solactiveModel');
//  @desc
// @route POST /api/solactive/securities
// @access Public

exports.NewSec = async (req, res) => {
    try {
        const result = await Solactive.NewSec(req.body);
        res.status(201).json({
            success: true,
            message: 'New security created successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating new security',
            error: error.message
        });
    }
};


// @desc
// @route PUT /api/solactive/securities
// @access Public
exports.UpdateSec = async (req, res) => {
    if (!req.body.ticker || !req.body.negDate) {
        return res.status(400).json({
            success: false,
            message: 'Ticker and negotiation date are required to update a security'
        });
    }
    try {
        const result = await Solactive.UpdateSec(req.body);
        res.status(200).json({
            success: true,
            message: 'Security updated successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating security',
            error: error.message
        });
    }
};

// @desc
// @route DELETE /api/solactive/securities/fields
// @access Public
exports.DeleteFields = async (req, res) => {
    if (!req.body.ticker || !req.body.negDate) {
        return res.status(400).json({
            success: false,
            message: 'Ticker and negotiation date are required to delete fields of a security'
        });
    }
    try {
        const result = await Solactive.DeleteFields(req.body);
        res.status(200).json({
            success: true,
            message: 'Fields deleted successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting fields',
            error: error.message
        });
    }
};

// @desc
// @route DELETE /api/solactive/securities
// @access Public
exports.DeleteDocument = async (req, res) => {
    if (!req.body.ticker || !req.body.negDate) {
        return res.status(400).json({
            success: false,
            message: 'Ticker and negotiation date are required to delete a document'
        });
    }
    try {
        const result = await Solactive.DeleteDocument(
            req.body.ticker,
            req.body.negDate,
            req.body.confirmation
        );

        if (result.response.includes('not confirmed')){
            return res.status(400).json({
                success: false,
                message: result.response
            });
        }
        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting document',
            error: error.message
        });
    }
};

// @desc
// @route PUT /api/solactive/validation/auto
// @access Public
exports.Validation = async (req, res) => {
    const {ticker, negDate} = req.body;

    if (!ticker || !negDate) {
        return res.status(400).json({
            success: false,
            message: 'Ticker and negotiation date are required'
        });
    }
    try {
        const result = await Solactive.Validation({ticker, negDate});
        res.status(200).json({
            success: true,
            message: result.response,
            data: result.data,
            status: result.status
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing auto validation',
            error: error.message
        });
    }
};

// @desc
// @route PUT /api/solactive/validation/user
// @access Public
exports.UserValidation = async (req, res) => {
    const {ticker, negDate, user} = req.body;
    if (!ticker || !negDate || !user) {
        return res.status(400).json({
            success: false,
            message: 'Ticker, negotiation date, and user ID are required'
        });
    }
    try {
        const result = await Solactive.UserValidation({ticker, negDate, user});
        res.status(200).json({
            success: true,
            message: result.response,
            ticker: result.ticker,
            negotiationDate: result.negDate,
            status: result.status
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing user validation',
            error: error.message
        });
    }
};

// @desc
// @route PUT /api/solactive/validation/reversal
// @access Public
exports.UserValidationReversal = async (req, res) => {
    const {ticker, negDate, user, reason} = req.body;
    if (!ticker || !negDate || !user || !reason) {
        return res.status(400).json({
            success: false,
            message: 'Ticker, negotiation date, user and reason are required'
        });
    }
    try {
        const result = await Solactive.UserValidationReversal({ticker, negDate, user, reason});
        res.status(200).json({
            success: true,
            message: result.response,
            ticker: result.ticker,
            negotiationDate: result.negDate,
            status: result.status
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing user validation reversal',
            error: error.message
        });
    }
};
// @desc
// @route GET /api/solactive/securities/consult
// @access Public
exports.ConsultingBy = async (req, res) => {
    const consultParams = {
        ticker: req.query.ticker,
        negDate: req.query.negDate,
        ICEPrice: req.query.ICEPrice,
        ICECurrency: req.query.ICECurrency,
        ICERecTimestamp: req.query.ICERecTimestamp,
        FactSetPrice: req.query.FactSetPrice,
        FactSetCurrency: req.query.FactSetCurrency,
        FactSetLateClose: req.query.FactSetLateClose,
        FactSetRecTimestamp: req.query.FactSetRecTimestamp,
        EDIPrice: req.query.EDIPrice,
        EDICurrency: req.query.EDICurrency,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        region: req.query.region,
        assetClass: req.query.assetClass,
        status: req.query.status
    };
    try {
        const result = await Solactive.ConsultingBy(consultParams);
        res.status(200).json({
            success: true,
            message: result.response,
            data: result.data
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing consultation',
            error: error.message
        });
    }
};

// @desc
// @route GET /api/solactive/securities/consult/errors/query
// @access Public
exports.ErrorConsulting = async (req, res) => {
        
    try {
        const result = await Solactive.ErrorConsulting(
            req.query.errorType,
            req.query.startDate,
            req.query.endDate,
            req.query.errorDate
        );
        res.status(200).json({
            success: true,
            message: result.response,
            data: result.data
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing error consultation',
            error: error.message
        });
    }
};

// @desc
// @route GET /api/solactive/views/securities
// @access Public
exports.ViewAllSecurities = async (req, res) => {
    try {
        const result = await Solactive.ViewAllSecurities(); 
        res.status(200).json({
            success: true,
            message: 'Securities view executed successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing securities view',
            error: error.message
        });
    }
};

// @desc
// @route GET /api/solactive/views/securities/filtered
// @access Public
exports.FilteredSecuritiesView = async (req, res) => {
    const filterParams = {
        region: req.query.region,
        assetClass: req.query.assetClass,
        status: req.query.status
    };
    try {
        const result = await Solactive.FilteredSecuritiesView(filterParams);
        res.status(200).json({
            success: true,
            message: 'Filtered securities view executed successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing filtered securities view',
            error: error.message
        });
    }
};


// @desc
// @route GET /api/solactive/reports/validationCount
// @access Public
exports.ValidationCount = async (req, res) => {
    try {
        const result = await Solactive.ValidationCount();
        res.status(200).json({
            success: true,
            message: result.response,
            data: result.data
        });
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing validation count report',
            error: error.message
        });
    }
};

// @desc
// @route GET /api/solactive/views/validationCount
// @access Public
exports.ViewValidationCount = async (req, res) => {
    try {
        const result = await Solactive.ViewValidationCount();
        res.status(200).json({
            success: true,
            message: 'Validation count view executed successfully',
            data: result
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing validation count view',
            error: error.message
        });
    }
};


// @desc
// @route GET /api/solactive/reports/errorTypes
// @access Public
exports.ErrorTypeCount = async (req, res) => {
    try {
        const result = await Solactive.ErrorTypeCount();
        res.status(200).json({
            success: true,
            message: result.response,
            data: result.data
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing error type count report',
            error: error.message
        });
    }
};

// @desc
// @route GET /api/solactive/reports/versionComparison
// @access Public
exports.VersionComp = async (req, res) => {
        
    try {
        const result = await Solactive.VersionComp(
            req.query.startDate,
            req.query.endDate1,
            req.query.endDate2
        );
        res.status(200).json({
            success: true,
            message: result.response,
            data: result.data
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error executing version comparison report',
            error: error.message
        });
    }
};