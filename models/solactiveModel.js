const {response} = require('express');
const mongoose = require('mongoose')

//DB Schema

const solactiveSchema = new mongoose.Schema({
    ticker: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 5
    },

    ICEPrice: {
        type: mongoose.Schema.Types.Double,
        required: false
    },
    
    ICECurrency: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 9
    },

    ICERecTimestamp: {
        type: Date,
        required: false
    },

    FactSetPrice: {
        type: mongoose.Schema.Types.Double,
        required: false
    },
    
    FactSetCurrency: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 9
    },

    FactSetLateClose: {
        type: mongoose.Schema.Types.Double,
        required: false
    },

    FactSetLateCurrency: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 9
    },

    EDIPrice: {
        type: mongoose.Schema.Types.Double,
        required: false
    },
    
    EDICurrency: {
        type: String,
        required: false,
        trim: true,
        minlength: 1,
        maxlength: 9
    },

    negDate: {
        type: Date,
        required: true,
    },

    region:{
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    assetClass: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    status: {
        type: String,
        required: false,
        trim: true,
        maxlength: 25
    },

    user: {
        type: String,
        required: false,
        trim: true,
        maxlength: 50
    },

    division: {
        type: String,
        required: false,
        trim: true,
        maxlength: 50
    },

    validationDate: {
        type: Date,
        required: false
    },

    error:{
        errorType: {
            type: String,
            required: false
        },
        errorDate: {
            type: Date,
            required: false
        },
        relatedAsset: {
            type: String,
            required: false
        }
    }


})
//RQF ?
solactiveSchema.statics.NewSec = async function ({ticker, ICEPrice, ICECurrency, ICERecTimestamp, FactSetPrice, FactSetCurrency, FactSetLateClose, FactSetLateCurrency, EDIPrice, EDICurrency, negDate, region, assetClass}) {
    const newSecurity = new this({
        ticker,
        ICEPrice, 
        ICECurrency, 
        ICERecTimestamp, 
        FactSetPrice, 
        FactSetCurrency, 
        FactSetLateClose, 
        FactSetLateCurrency, 
        EDIPrice, 
        EDICurrency, 
        negDate, 
        region, 
        assetClass}
    );
    
    return await newSecurity.save(); 
};

//RQF ?

solactiveSchema.statics.UpdateSec = async function (ticker,
    ICEPrice,
    ICECurrency,
    ICERecTimestamp,
    FactSetPrice,
    FactSetCurrency,
    FactSetLateClose,
    FactSetLateCurrency,
    EDIPrice,
    EDICurrency,
    negDate,
    startDate,
    endDate,
    region,
    assetClass) {
        let updateFields = {};

        if (ICEPrice !== undefined) updateFields.ICEPrice = ICEPrice;
        if (ICECurrency !== undefined) updateFields.ICECurrency = ICECurrency;
        if (ICERecTimestamp !== undefined) updateFields.ICERecTimestamp = ICERecTimestamp;
        if (FactSetPrice !== undefined) updateFields.FactSetPrice = FactSetPrice;
        if (FactSetCurrency !== undefined) updateFields.FactSetCurrency = FactSetCurrency;
        if (FactSetLateClose !== undefined) updateFields.FactSetLateClose = FactSetLateClose;
        if (FactSetLateCurrency !== undefined) updateFields.FactSetLateCurrency = FactSetLateCurrency;
        if (EDIPrice !== undefined) updateFields.EDIPrice = EDIPrice;
        if (EDICurrency !== undefined) updateFields.EDICurrency = EDICurrency;
        if (region !== undefined) updateFields.region = region;
        if (assetClass !== undefined) updateFields.assetClass = assetClass;
        return await this.findOneAndUpdate(
            { ticker: ticker, negDate: negDate },
            {$set: updateFields},
            {new: true});
    };
    
solactiveSchema.statics.DeleteFields = async function (
    ticker,
    ICEPrice,
    ICECurrency,
    ICERecTimestamp,
    FactSetPrice,
    FactSetCurrency,
    FactSetLateClose,
    FactSetLateCurrency,
    EDIPrice,
    EDICurrency,
    negDate,
    startDate,
    endDate,
    region,
    assetClass) {
        let updateFields = {};

        if (ICEPrice !== undefined) updateFields.ICEPrice = "";
        if (ICECurrency !== undefined) updateFields.ICECurrency = "";
        if (ICERecTimestamp !== undefined) updateFields.ICERecTimestamp = "";
        if (FactSetPrice !== undefined) updateFields.FactSetPrice = "";
        if (FactSetCurrency !== undefined) updateFields.FactSetCurrency = "";
        if (FactSetLateClose !== undefined) updateFields.FactSetLateClose = "";
        if (FactSetLateCurrency !== undefined) updateFields.FactSetLateCurrency = "";
        if (EDIPrice !== undefined) updateFields.EDIPrice = "";
        if (EDICurrency !== undefined) updateFields.EDICurrency = "";
        if (region !== undefined) updateFields.region = "";
        if (assetClass !== undefined) updateFields.assetClass = "";
        return await this.findOneAndUpdate(
            { ticker: ticker, negDate: negDate },
            {$unset: updateFields},
            {new: true});
    };



//RQF 14, 17, 18
solactiveSchema.statics.Validation = async function ({ ticker, negDate }) {
    
    let consult = await this.findOne({ ticker: ticker, negDate: negDate });

    if (!consult) {
        return { response: "Security not found" };
    }

    let ICE, EDI, FS;

    // CASE 1: With FactSetLateClose 
    if (consult.FactSetLateClose !== null) {

        consult = await this.findOne(
            { ticker: ticker, negDate: negDate },
            { ICEPrice: 1, FactSetLateClose: 1, EDIPrice: 1, _id: 0 }
        );

        ICE = consult.ICEPrice;
        EDI = consult.EDIPrice;
        FS  = consult.FactSetLateClose;

        // 1. VALIDATED
        if (ICE === EDI && ICE === FS) {

            const status = "VALIDATED";

            await this.findOneAndUpdate(
                { ticker: ticker, negDate: negDate },
                { $set: { status: status, user: "Validation System", division: "System", validationDate: Date.now() } },
                {new: true}
            );

            return {
                response: "Validation Executed",
                data: consult,
                status: status
            };
        }

        // 2. SEMI-VALIDATED
        if (
            (ICE === EDI && ICE !== FS) ||
            (FS === EDI && FS !== ICE) ||
            (ICE === FS && ICE !== EDI)
        ) {

            const status = "SEMI-VALIDATED";

            await this.findOneAndUpdate(
                { ticker: ticker, negDate: negDate },
                { $set: { status: status, user: "Validation System", division: "System", validationDate: Date.now() } },
                {new: true}
            );

            return {
                response: "Validation Executed",
                data: consult,
                status: status
            };
        }

        // 3. UNVALIDATED
        const status = "UNVALIDATED";

        await this.findOneAndUpdate(
            {ticker: ticker, negDate: negDate },
            {$set: {status: status, user: "Validation System", division: "System", validationDate: Date.now(), error: {errorType: "No equal prices", errorDate: negDate, relatedAsset: ticker} } },
            {new: true}
        );

        return {
            response: "There's no equal prices",
            data: consult,
            status: status
        };
    }

    //  CASE 2: Without FactSetLateClose 

    consult = await this.findOne(
        { ticker: ticker, negDate: negDate },
        { ICEPrice: 1, FactSetPrice: 1, EDIPrice: 1, _id: 0 }
    );

    ICE = consult.ICEPrice;
    EDI = consult.EDIPrice;
    FS  = consult.FactSetPrice;

    // 1. VALIDATED
    if (ICE === EDI && ICE === FS) {

        const status = "VALIDATED";

        await this.findOneAndUpdate(
            {ticker: ticker, negDate: negDate },
            {$set: { status: status, validationDate: Date.now() } },
            {new: true}
        );

        return {
            response: "Validation Executed",
            data: consult,
            status: status
        };
    }

    // 2. SEMI-VALIDATED
    if (
        (ICE === EDI && ICE !== FS) ||
        (FS === EDI && FS !== ICE) ||
        (ICE === FS && ICE !== EDI)
    ) {

        const status = "SEMI-VALIDATED";

        await this.findOneAndUpdate(
            { ticker: ticker, negDate: negDate },
            { $set: { status: status, user: "Validation System", division: "System", validationDate: Date.now() } },
            {new: true}
        );

        return {
            response: "Validation Executed",
            data: consult,
            status: status
        };
    }

    // 3. UNVALIDATED
    const status = "UNVALIDATED";

    await this.findOneAndUpdate(
        { ticker: ticker, negDate: negDate },
        { $set: { status: status, user: "Validation System", division: "System", validationDate: Date.now(), error: {errorType: "No equal prices", errorDate: negDate, relatedAsset: ticker}} },
        {new: true}
    );

    return {
        response: "There's no equal prices",
        data: consult,
        status: status
    };
};

//RQF 15
solactiveSchema.statics.UserValidation = async function ({ticker, negDate, user}) {
    // Update the status based on user input
    await this.findOneAndUpdate(
        { ticker: ticker, negDate: negDate },
        { $set: { status: "USER-VALIDATION" , user: user, validationDate: Date.now()} },
        {new: true}
    );
    return { response: "User Validation executed succesfully", ticker: ticker, negDate: negDate, status: "USER-VALIDATION"};
};

//RQF 16
solactiveSchema.statics.ValidationCount = async function () {
    const counts = await this.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
    return {response: "Validation counts by status", data: counts};
};

//RQF 19
solactiveSchema.statics.ErrorConsulting = async function (errorType, startDate, endDate, errorDate) {
    let query = {};

    if(!errorType && !startDate && !endDate && !errorDate){
        return {response: "No parameters provided for error consulting."};
    }

    if (errorType) {
        query["error.errorType"] = errorType;
    }
    if (startDate && endDate) {
        query["error.errorDate"] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (errorDate) {
        query["error.errorDate"] = new Date(errorDate);
    }

    const results = await this.find(query);
    return { response: "Error consulting executed", data: results };

};

//RQF 20
solactiveSchema.statics.ConsultingBy = async function ({
    ticker,
    ICEPrice,
    ICECurrency,
    ICERecTimestamp,
    FactSetPrice,
    FactSetCurrency,
    FactSetLateClose,
    FactSetLateCurrency,
    EDIPrice,
    EDICurrency,
    negDate,
    startDate,
    endDate,
    region,
    assetClass,
    status
}) {
    let updateFields = {};

    if (ticker !== undefined) updateFields.ticker = ticker;
    if (ICEPrice !== undefined) updateFields.ICEPrice = ICEPrice;
    if (ICECurrency !== undefined) updateFields.ICECurrency = ICECurrency;
    if (ICERecTimestamp !== undefined) updateFields.ICERecTimestamp = ICERecTimestamp;
    if (FactSetPrice !== undefined) updateFields.FactSetPrice = FactSetPrice;
    if (FactSetCurrency !== undefined) updateFields.FactSetCurrency = FactSetCurrency;
    if (FactSetLateClose !== undefined) updateFields.FactSetLateClose = FactSetLateClose;
    if (FactSetLateCurrency !== undefined) updateFields.FactSetLateCurrency = FactSetLateCurrency;
    if (EDIPrice !== undefined) updateFields.EDIPrice = EDIPrice;
    if (EDICurrency !== undefined) updateFields.EDICurrency = EDICurrency;

    if (startDate && endDate) {
        updateFields.negDate = { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
        };
    } else if (negDate !== undefined) {
        updateFields.negDate = negDate;
    }

    if (region !== undefined) updateFields.region = region;
    if (assetClass !== undefined) updateFields.assetClass = assetClass;
    if (status !== undefined) updateFields.status = status;

    const results = await this.find(updateFields);

    return { response: "Consulting by parameters executed", data: results };
};    

//RQF 21
solactiveSchema.statics.UserValidationReversal = async function ({ticker, negDate, user, reason}) {
    // Update the status based on user input
    const old = await this.findOne({ ticker: ticker, negDate: negDate }, {validationDate: 1, status: 1, _id: 0});

    if (old.status === "USER-VALIDATION") {
    await this.findOneAndUpdate(
        { ticker: ticker, negDate: negDate },
        { $set: { status: "UNVALIDATED" , user: user, validationDate: Date.now(), error: {errorType: `User Validation Reversal by ${reason}`, errorDate: old.validationDate, relatedAsset: ticker}} },
        {new: true}
    );
    return { response: "User Validation Reversal executed succesfully", ticker: ticker, negDate: negDate, status: "UNVALIDATED"};
}    

    else {
    return { response: "The status is not USER-VALIDATION, reversal not executed", ticker: ticker, negDate: negDate, status: old.status};
};
};


//RQF 25
solactiveSchema.statics.ViewAllSecurities = async function () {    
    
    
    const viewName = "ViewAllSecurities";
    const pipeline = [
        {
            $addFields: {
                lastRun: new Date()
            }
        },
        {$project: {
            ticker: 1,
            ICEPrice: 1,
            ICECurrency: 1,
            ICERecTimestamp: 1,
            FactSetPrice: 1, 
            FactSetCurrency: 1,
            FactSetLateClose: 1,
            FactSetLateCurrency: 1,
            EDIPrice: 1,
            EDICurrency: 1,
            negDate: 1,
            region: 1,
            assetClass: 1,
            status: 1,
            user: 1,
            validationDate: 1,
            error: 1
        }}
    ];

    const mongo = mongoose.connection.db;
    const tempView = await mongo.listCollections({name: viewName}).toArray();
    if (tempView.length > 0) {
        await mongo.collection(viewName).drop();
    };

    await mongo.createView(viewName, "solactive", pipeline);
    return mongo.collection(viewName).find({}).toArray();
    };

//RQF 26
solactiveSchema.statics.ViewValidationCount = async function () {
    const mongo = mongoose.connection.db;
    const viewName = "ViewValidationCount";
    const pipeline = [
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ];
    const tempView = await mongo.listCollections({name: viewName}).toArray();
    if (tempView.length > 0) {
        await mongo.collection(viewName).drop();
    }
    await mongo.createView(viewName, "solactive", pipeline);
    return mongo.collection(viewName).find({}).toArray();
};

//RQF 27
solactiveSchema.statics.FilteredSecuritiesView = async function ({assetClass, region, status}) {
    const mongo = mongoose.connection.db;
    const viewName = "FilteredSecuritiesView";

    // Construcción dinámica del match
    const match = {};

    if (assetClass) match.assetClass = assetClass;
    if (region) match.region = region;
    if (status) match.status = status;

    const pipeline = [
        { $match: match }
    ];

    // Borrar la vista si existe
    const tempView = await mongo.listCollections({ name: viewName }).toArray();

    if (tempView.length > 0) {
        await mongo.collection(viewName).drop();
    }

    // Crear vista nueva
    await mongo.createView(viewName, "solactive", pipeline);
    return mongo.collection(viewName).find({}).toArray();
};


//RQF 28
solactiveSchema.statics.ErrorTypeCount = async function () {
    
    const pipeline = [
        {
            $group: {_id: "$error.errorType",
                count: { $sum: 1 }
            } 
        }
    ];
    
    const results = await this.aggregate(pipeline);
    return { response: "Error type counts executed", data: results };
};

//RQF 31
solactiveSchema.statics.VersionComp = async function (startDate, endDate1, endDate2) {
    const version1ByStatus = await this.aggregate([
        {$match: {negDate: { $gte: new Date(startDate), $lte: new Date(endDate1) }}},
        {
            $group: {
                "_id": "$status", 
                count: { $sum: 1 }
        }
    }
    ]
);
    const version2ByStatus = await this.aggregate([ 
        {$match: {negDate: { $gte: new Date(startDate), $lte: new Date(endDate2) }}},
        {
            $group: {
                "_id": "$status",
                count: { $sum: 1 }
            
        }
    }
    ]
);
    const version1ByError = await this.aggregate([
        {$match: {negDate: { $gte: new Date(startDate), $lte: new Date(endDate1) }}},
        {
            $group: {
                "_id": "$error.errorType", 
                count: { $sum: 1 }
            }
        }
    ]);
    const version2ByError = await this.aggregate([ 
        {$match: {negDate: { $gte: new Date(startDate), $lte: new Date(endDate2) }}},
        {  
            $group: {
                "_id": "$error.errorType",
                count: { $sum: 1 }
            }
        }
    ]);
    const version1 = {
        statusCounts: version1ByStatus,
        errorCounts: version1ByError
    };
    const version2 = {
        statusCounts: version2ByStatus,
        errorCounts: version2ByError
    }
    
    
    return { response: "Version comparison executed", data:{version1: version1, version2: version2} };
}

solactiveSchema.statics.DeleteDocument = async function (ticker, negDate, confirmation = false) {
    if (confirmation !== true) {
        return { response: "Deletion not confirmed. Set confirmation to true to delete the document." };
    }
    const result = await this.deleteOne({ ticker: ticker, negDate: negDate });
    if (result.deletedCount === 0) {
        return { response: "No document found to delete." };
    }
    return { response: "Document deleted successfully.", ticker: ticker, negDate: negDate };
};

module.exports = mongoose.model('solactive', solactiveSchema);