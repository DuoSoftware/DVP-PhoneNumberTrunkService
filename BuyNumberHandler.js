/**
 * Created by Rajinda on 3/24/2016.
 */

var messageFormatter = require('dvp-common-lite/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common-lite/LogHandler/CommonLogHandler.js').logger;
var DbConn = require('dvp-dbmodels');
var trunkBackendHandler = require('./TrunkBackendHandler.js');
var config = require('config');
var request = require('request');

/*
 function AddPhoneNumberToSale(tenantId, companyId,req,res) {
 DbConn.BuyPhoneNumbers
 .create(
 {
 PhoneNumber: req.body.PhoneNumber,
 TenantId: tenantId,
 CompanyId: companyId,
 Status: true,
 OperationalStatus:"Free",
 OperatorId: req.body.OperatorId,
 TrunkId: req.body.TrunkId,
 ExtraData: req.body.ExtraData,
 Type:req.body.Type
 }
 ).then(function (cmp) {
 var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, cmp);
 logger.info('[DVP-AddPhoneNumberToSale] - [PGSQL] - inserted successfully. [%s] ', jsonString);
 res.end(jsonString);
 }).error(function (err) {
 logger.error('[DVP-AddPhoneNumberToSale] - [%s] - [PGSQL] - insertion  failed-[%s]', req.body.PhoneNumber, err);
 var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
 res.end(jsonString);
 });
 }
 */

function ValidateString(values) {
    values.forEach(function (value) {
        if (value === null || value === "null") {
            throw new Error("Invalid Data.")
        }
    })
}

module.exports.AddPhoneNumberToSale = function (tenantId, companyId, req, res) {

    var phoneNumbers = req.body.PhoneNumbers;
    var nos = [];
    if (phoneNumbers) {

        var operatorId = req.params.OperatorId;
        var trunkId = req.params.TrunkId;
        for (var i = 0; i < phoneNumbers.length; i++) {
            var no = {
                PhoneNumber: phoneNumbers[i],
                TenantId: tenantId,
                CompanyId: companyId,
                Status: true,
                OperationalStatus: "Free",
                OperatorId: operatorId,
                TrunkId: trunkId,
                ExtraData: req.body.ExtraData,
                Type: req.body.Type
            };
            nos.push(no);
        }

        var jsonString;
        DbConn.BuyPhoneNumbers.bulkCreate(
            nos, {validate: false, individualHooks: true}
        ).then(function (results) {
                jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, results);
                //logger.info('[DVP-AddPhoneNumberToSaleBulk] - [PGSQL] - UploadContacts successfully.[%s] ', jsonString);
                res.end(jsonString);
            }).catch(function (err) {
                jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                logger.error('[DVP-AddPhoneNumberToSaleBulk] - [%s] - [PGSQL] - UploadContacts failed', req.body.OperatorId, err);
                res.end(jsonString);
            }).finally(function () {
                //logger.info('AddPhoneNumberToSaleBulk - %s Done.', nos.length);
            });
    }

};

module.exports.GetAllNumbers = function (tenantId, companyId, req, res) {
    var jsonString;

    DbConn.BuyPhoneNumbers.findAll({where: [{CompanyId: companyId}, {TenantId: tenantId}, {OperationalStatus: "Free"}]}).then(function (CamObject) {
        if (CamObject) {
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);
            //logger.info('[DVP-GetAllNumbers] - [%s] - [PGSQL]  - Data found  - %s', tenantId, companyId, jsonString);
            res.end(jsonString);
        }
        else {
            logger.error('[DVP-GetAllNumbers] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-GetAllNumbers] - [%s] - [%s] - [PGSQL]  - Error in searching.', tenantId, companyId, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });
};

module.exports.GetAllNumbersByOperator = function (tenantId, companyId, req, res) {
    var jsonString;

    DbConn.BuyPhoneNumbers.findAll({where: [{CompanyId: companyId}, {TenantId: tenantId}, {OperatorId: req.params.OperatorId}, {OperationalStatus: "Free"}]}).then(function (CamObject) {
        if (CamObject) {
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);
            //logger.info('[DVP-GetAllNumbersByOperator] - [%s] - [PGSQL]  - Data found  - %s', tenantId, companyId, jsonString);
            res.end(jsonString);
        }
        else {
            logger.error('[DVP-GetAllNumbersByOperator] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-GetAllNumbersByOperator] - [%s] - [%s] - [PGSQL]  - Error in searching.', tenantId, companyId, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });
};

module.exports.GetProcessingNumber = function (tenantId, companyId, req, res) {
    var jsonString;

    DbConn.BuyPhoneNumbers.findAll({where: [{CompanyId: companyId}, {TenantId: tenantId}, {OperatorId: req.params.OperatorId}, {OperationalStatus: "Processing"}]}).then(function (CamObject) {
        if (CamObject) {
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);
            //logger.info('[DVP-GetProcessingNumber] - [%s] - [PGSQL]  - Data found  - %s', tenantId, companyId, jsonString);
            res.end(jsonString);
        }
        else {
            logger.error('[DVP-GetProcessingNumber] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-GetProcessingNumber] - [%s] - [%s] - [PGSQL]  - Error in searching.', tenantId, companyId, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });
};

module.exports.GetSaleNumber = function (tenantId, companyId, req, res) {
    var jsonString;

    DbConn.BuyPhoneNumbers.findAll({where: [{CompanyId: companyId}, {TenantId: tenantId}, {OperatorId: req.params.OperatorId}, {OperationalStatus: "Sale"}]}).then(function (CamObject) {
        if (CamObject) {
            jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, CamObject);
            //logger.info('[DVP-GetSaleNumber] - [%s] - [PGSQL]  - Data found  - %s', tenantId, companyId, jsonString);
            res.end(jsonString);
        }
        else {
            logger.error('[DVP-GetSaleNumber] - [PGSQL]  - No record found for %s - %s  ', tenantId, companyId);
            jsonString = messageFormatter.FormatMessage(new Error('No record'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-GetSaleNumber] - [%s] - [%s] - [PGSQL]  - Error in searching.', tenantId, companyId, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });
};

module.exports.OrderNumber = function (tenantId, companyId, req, res) {
    var jsonString;

    var operatorId = req.params.OperatorId;
    var phoneNo = req.params.PhoneNumber;
    var buyerComId = req.body.BuyerCompanyId;
    var buyerTenID = req.body.BuyerTenantId;
    //ValidateString([operatorId, phoneNo, buyerComId, buyerTenID]);

    DbConn.BuyPhoneNumbers.find({where: [{CompanyId: companyId}, {TenantId: tenantId}, {OperatorId: operatorId}, {PhoneNumber: phoneNo}, {OperationalStatus: "Free"}]}).then(function (CamObject) {
        if (CamObject) {
            DbConn.BuyPhoneNumbers
                .update(
                {
                    OperationalStatus: "Processing",
                    BuyerCompanyId: buyerComId,
                    BuyerTenantId: buyerTenID
                },
                {
                    where: [{CompanyId: companyId}, {PhoneNumber: phoneNo}, {TenantId: tenantId}, {OperatorId: req.params.OperatorId}]
                }
            ).then(function (results) {
                    //logger.info('[DVP-BuyNumber] - [%s] - [PGSQL] - Updated successfully', phoneNo);
                    jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, results);
                    res.end(jsonString);

                }).error(function (err) {
                    logger.error('[DVP-BuyNumber] - [%s] - [PGSQL] - Updation failed- [%s]', phoneNo, err);
                    jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                });
        }
        else {
            logger.error('[DVP-BuyNumber] - [PGSQL]  - No record found for %s - %s ', operatorId, phoneNo);
            jsonString = messageFormatter.FormatMessage(new Error('Not Available.'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-BuyNumber] - [%s] - [%s] - [PGSQL]  - Error in Order Process.', operatorId, phoneNo, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });
};

module.exports.AssignNumber = function (tenantId, companyId, req, res) {
    var jsonString;

    var operatorId = req.params.OperatorId;
    var phoneNo = req.params.PhoneNumber;
    var buyerComId = req.body.BuyerCompanyId;
    var buyerTenID = req.body.BuyerTenantId;
    var inboundLimit = req.body.InboundLimit;
    var outboundLimit = req.body.OutboundLimit;
    var bothLimit = req.body.BothLimit;
    ValidateString([operatorId, phoneNo, buyerComId, buyerTenID]);

    DbConn.BuyPhoneNumbers.find({where: [{CompanyId: companyId}, {TenantId: tenantId}, {BuyerTenantId: buyerTenID}, {BuyerCompanyId: buyerComId}, {OperatorId: operatorId}, {PhoneNumber: phoneNo}, {OperationalStatus: "Processing"}]}).then(function (CamObject) {
        if (CamObject) {
            //Assign Limite

            var apiKey = req.header('authorization');
            var data = '{"LimitDescription":"inboundLimit","MaxCount":' + inboundLimit + ',"Enable":true}';
            var options = {
                method: 'POST',
                uri: config.Services.limitServiceRootPath + '/LimitAPI/Limit',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': apiKey
                },
                body: data
            };
            request(options, function (error, response, body) {
                if (error) {
                    logger.error('[Fail To Set InboundLimit] - [%s] - [%s] - Error.', response, body, error);
                    throw new error("Fail To Set InboundLimit.");
                } else {
                    var jsonResp = JSON.parse(body);
                    if (!jsonResp.IsSuccess) {
                        throw new error("Fail To Set InboundLimit.");
                    }
                    //logger.info('[Set InboundLimit]-[%s]',jsonResp.Result);
                    var inboundLimitId = jsonResp.Result.LimitId;

                    //set outbound limite
                    var data = '{"LimitDescription":"outboundLimit","MaxCount":' + outboundLimit + ',"Enable":true}';
                    var options = {
                        method: 'POST',
                        uri: config.Services.limitServiceRootPath + '/LimitAPI/Limit',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': apiKey
                        },
                        body: data
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            logger.error('[Fail To Set Outbound Limit] - [%s] - [%s] - Error.', response, body, error);
                            throw new error("Fail To Set Limit.");
                        } else {

                            var jsonResp = JSON.parse(body);
                            if (!jsonResp.IsSuccess) {
                                throw new error("Fail To Set Outbound Limit.");
                            }
                            var outboundLimitId = jsonResp.Result.LimitId;
                            //logger.info('[Set outboundLimitId]');

                            // Set both limite
                            var data = '{"LimitDescription":"bothLimit","MaxCount":' + bothLimit + ',"Enable":true}';
                            var options = {
                                method: 'POST',
                                uri: config.Services.limitServiceRootPath + '/LimitAPI/Limit',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': apiKey
                                },
                                body: data
                            };
                            request(options, function (error, response, body) {
                                if (error) {
                                    logger.error('[Set bothLimit] - [%s] - [%s] - Error.', response, body, error);
                                    throw new error("Fail To Set Limit.");
                                } else {

                                    var jsonResp = JSON.parse(body);
                                    if (!jsonResp.IsSuccess) {
                                        throw new error("Fail To Set BothLimit.");
                                    }
                                    var bothLimitId = jsonResp.Result.LimitId;
                                    //logger.info('[Set BothLimit] ');

                                    var info = {
                                        PhoneNumber: phoneNo,
                                        ObjClass: "BuyNumber",
                                        ObjType: "BuyNumber",
                                        ObjCategory: "BuyNumber",
                                        Enable: true,
                                        CompanyId: buyerComId,
                                        TenantId: buyerTenID,
                                        FaxType: "",
                                        TrunkId: CamObject.TrunkId,
                                        InboundLimitId: inboundLimitId,
                                        OutboundLimitId: outboundLimitId,
                                        BothLimitId: bothLimitId
                                    };


                                    trunkBackendHandler.AddPhoneNumbersToTrunk(phoneNo, info, companyId, tenantId, function (response) {
                                        if (response == true) {

                                            DbConn.BuyPhoneNumbers
                                                .update(
                                                {
                                                    OperationalStatus: "Sale",
                                                    CompanyId: buyerComId,
                                                    TenantId: buyerTenID
                                                },
                                                {
                                                    where: [{CompanyId: companyId}, {TenantId: tenantId}, {PhoneNumber: phoneNo}, {OperatorId: req.params.OperatorId}]
                                                }
                                            ).then(function (results) {
                                                    //logger.info('[DVP-BuyNumber] - [%s] - [PGSQL] - Updated successfully', phoneNo);
                                                    jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, results);
                                                    res.end(jsonString);

                                                }).error(function (err) {
                                                    logger.error('[DVP-BuyNumber] - [%s] - [PGSQL] - Updating failed- [%s]', phoneNo, err);
                                                    jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                                                    res.end(jsonString);
                                                });
                                        }
                                        else {
                                            logger.error('[DVP-BuyNumber] - [%s] - [PGSQL] - AddPhoneNumbersToTrunk Fail- [%s]', phoneNo, operatorId);
                                            jsonString = messageFormatter.FormatMessage(new Error("Invalid Information's"), "EXCEPTION", false, undefined);
                                            res.end(jsonString);
                                        }

                                    })


                                }
                            });
                        }
                    });
                }
            });


        }
        else {
            logger.error('[DVP-GetSaleNumber] - [PGSQL]  - No record found for %s - %s ', operatorId, phoneNo);
            jsonString = messageFormatter.FormatMessage(new Error('Not Available.'), "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }).error(function (err) {
        logger.error('[DVP-GetSaleNumber] - [%s] - [%s] - [PGSQL]  - Error in Order Process.', operatorId, phoneNo, err);
        jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
        res.end(jsonString);
    });

};


