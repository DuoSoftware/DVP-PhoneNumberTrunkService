var restify = require('restify');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var gwBackendHandler = require('./TrunkBackendHandler.js');
var number = require('./PhoneNumberManagement.js');
var redisHandler = require('./RedisHandler.js');
var config = require('config');
var nodeUuid = require('node-uuid');
//var xmlGen = require('./XmlResponseGenerator.js');
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
var buyNumberHandler = require('./BuyNumberHandler.js');
var buyNumberOp = require('./BuyNumberOperations.js');

var hostIp = config.Host.Ip;
var hostPort = config.Host.Port;
var hostVersion = config.Host.Version;

var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

restify.CORS.ALLOW_HEADERS.push('authorization');
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(jwt({secret: secret.Secret}));

server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});


//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var phnInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumber] - [%s] - HTTP Request Received - Req Body : ', reqId, phnInfo);

        if (phnInfo) {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId) {
                throw new Error("Invalid company or tenant");
            }

            gwBackendHandler.AddPhoneNumbersToTrunkDB(reqId, phnInfo, companyId, tenantId, function (err, recordId, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Number Added Successfully", result, recordId);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, -1);
            logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:operatorCode/TrunkNumber', authorization({resource: "number", action: "write"}), function (req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var phnInfo = req.body;
        var operatorCode = req.params.operatorCode;

        logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumberForOperator] - [%s] - HTTP Request Received - Req Body : ', reqId, phnInfo);

        if (phnInfo)
        {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            buyNumberOp.buyNumberOperation(reqId, operatorCode, phnInfo, companyId, tenantId)
                .then(function(result)
                {
                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, result);
                    logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumberForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                })
                .catch(function(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                    logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumberForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, null);
            logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumberForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
        logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumberForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:operatorCode/AssignNumberLimit', authorization({resource: "number", action: "write"}), function (req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var phnInfo = req.body;
        var operatorCode = req.params.operatorCode;

        logger.debug('[DVP-PhoneNumberTrunkService.AssignLimitsForOperator] - [%s] - HTTP Request Received - Req Body : ', reqId, phnInfo);

        if (phnInfo)
        {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            buyNumberOp.assignNumberLimit(reqId, operatorCode, phnInfo, companyId, tenantId)
                .then(function(result)
                {
                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, result);
                    logger.debug('[DVP-PhoneNumberTrunkService.AssignLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                })
                .catch(function(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                    logger.debug('[DVP-PhoneNumberTrunkService.AssignLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, null);
            logger.debug('[DVP-PhoneNumberTrunkService.AssignLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
        logger.debug('[DVP-PhoneNumberTrunkService.AssignLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:operatorCode/TrunkLimit/:limit', authorization({resource: "number", action: "write"}), function (req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var limit = req.params.limit;
        var operatorCode = req.params.operatorCode;

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkLimitsForOperator] - [%s] - HTTP Request Received', reqId);

        if (limit && operatorCode)
        {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId)
            {
                throw new Error("Invalid company or tenant");
            }

            buyNumberOp.trunkLimitIncrementByOperator(reqId, operatorCode, limit, companyId, tenantId)
                .then(function(result)
                {
                    var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, result);
                    logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                })
                .catch(function(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                    logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Params"), "ERROR", false, null);
            logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkLimitsForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.del('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:PhoneNumber', authorization({
    resource: "number",
    action: "delete"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();

    try {
        var phoneNum = req.params.PhoneNumber;

        logger.debug('[DVP-PhoneNumberTrunkService.DeleteNumber] - [%s] - HTTP Request Received - Params - PhoneNumber : %s', reqId, phoneNum);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (phoneNum) {
            gwBackendHandler.RemovePhoneNumberDB(reqId, phoneNum, companyId, tenantId, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Phone number removed successfully", result, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid url"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/BuyNumber', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var phnInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.BuyNumber] - [%s] - HTTP Request Received - Req Body : %s', reqId, phnInfo);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (phnInfo) {
            gwBackendHandler.SwitchPhoneNumberCompanyDB(reqId, phnInfo.PhoneNumber, companyId, tenantId, phnInfo.CompanyToChange, phnInfo.TenantToChange, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Number Buy Successful", result, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }


    return next();

});

/*
 {"TrunkCode":"TestTrunk","TrunkName":"Test1","ObjClass":"DVP","ObjType":"Trunk","ObjCategory":"SIP","IpUrl":"192.168.1.198","Enable":"True","CompanyId":"1","TenantId":"3"}
 */

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {

        var gwInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.CreateTrunk] - [%s] - HTTP Request Received - Req Body : ', reqId, gwInfo);

        if (gwInfo) {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId) {
                throw new Error("Invalid company or tenant");
            }

            gwBackendHandler.AddTrunkConfigurationDB(reqId, gwInfo, companyId, tenantId, function (err, recordId, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Added Successfully", result, recordId);
                    logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, -1);
            logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/IpAddress', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var ipInfo = req.body;
        var trunkId = req.params.id;

        logger.debug('[DVP-PhoneNumberTrunkService.AddIpAddress] - [%s] - HTTP Request Received - Req Body : ', reqId, ipInfo);

        if (ipInfo) {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId) {
                throw new Error("Invalid company or tenant");
            }

            gwBackendHandler.AddTrunkIpAddress(reqId, trunkId, ipInfo, companyId, tenantId, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                    logger.debug('[DVP-PhoneNumberTrunkService.AddIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Ip Added Successfully", true, result);
                    logger.debug('[DVP-PhoneNumberTrunkService.AddIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, undefined);
            logger.debug('[DVP-PhoneNumberTrunkService.AddIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PhoneNumberTrunkService.AddIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/IpAddresses', authorization({
    resource: "trunk",
    action: "read"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();

    try {
        var trunkId = req.params.id;

        logger.debug('[DVP-PhoneNumberTrunkService.GetIpAddresses] - [%s] - HTTP Request Received - Req Params Trunk Id : ', reqId, trunkId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        gwBackendHandler.GetTrunkIpAddressList(reqId, trunkId, companyId, tenantId, function (err, result) {

            if (err) {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                logger.debug('[DVP-PhoneNumberTrunkService.GetIpAddresses] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else {
                var jsonString = messageFormatter.FormatMessage(err, "Get trunk ip addresses success", true, result);
                logger.debug('[DVP-PhoneNumberTrunkService.GetIpAddresses] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
        })
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PhoneNumberTrunkService.GetIpAddresses] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.del('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:trId/IpAddress/:id', authorization({
    resource: "trunk",
    action: "delete"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();

    try {
        var ipAddrId = req.params.id;

        logger.debug('[DVP-PhoneNumberTrunkService.DeleteIpAddress] - [%s] - HTTP Request Received - Req Params Id : ', reqId, ipAddrId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;
        var trId = req.params.trId;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        gwBackendHandler.RemoveIpAddress(reqId, ipAddrId, companyId, tenantId, trId, function (err, result) {

            if (err) {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                logger.debug('[DVP-PhoneNumberTrunkService.DeleteIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else {
                var jsonString = messageFormatter.FormatMessage(err, "Trunk Ip Added Successfully", true, result);
                logger.debug('[DVP-PhoneNumberTrunkService.DeleteIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
        })
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PhoneNumberTrunkService.DeleteIpAddress] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
//{"OperatorName": "TestOperator", "OperatorCode":"1234e", "ObjClass": "GGG", "ObjType": "FFF", "ObjCategory":"fff"}
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var opInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.NewOperator] - [%s] - HTTP Request Received - Req Body : %s', reqId, opInfo);

        if (opInfo) {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId) {
                throw new Error("Invalid company or tenant");
            }

            gwBackendHandler.AddTrunkOperator(reqId, opInfo, companyId, tenantId, function (err, recordId, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Operator Added Successfully", result, recordId);
                    logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error('Empty Body'), "ERROR", false, -1);
            logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
//{"Enable":false, "IpUrl":"192.123.32.112", "ObjCategory":"TTT", "ObjClass":"TTT", "ObjType":"TTT", "TrunkName":"TestTrunk"}
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var id = req.params.id;
        var gwInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.UpdateTrunk] - [%s] - HTTP Request Received Req Params - Id : %s, - Req Body : ', reqId, id, gwInfo);

        if (id && gwInfo) {
            var companyId = req.user.company;
            var tenantId = req.user.tenant;

            if (!companyId || !tenantId) {
                throw new Error("Invalid company or tenant");
            }

            gwBackendHandler.UpdateTrunkConfigurationDB(reqId, id, gwInfo, companyId, tenantId, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", result, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(null, "Trunk Updated Successfully", true, result);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty body or id not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/SetCloud/:cloudId', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var trunkId = parseInt(req.params.id);
        var cloudId = parseInt(req.params.cloudId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToCloud] - [%s] - HTTP Request Received Req Params - Id : %s, cloudId : %s', reqId, trunkId, cloudId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (trunkId && cloudId) {
            gwBackendHandler.GetLoadbalancerForCloud(reqId, cloudId, companyId, tenantId, function (err, result) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AssignTrunkToCloud] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);

                }
                else {
                    if (result && result.LoadBalancer) {
                        gwBackendHandler.AssignTrunkToLoadBalancer(reqId, trunkId, result.LoadBalancer.id, companyId, tenantId, function (err, result2) {

                            try {
                                if (err) {
                                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                                    logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                    res.end(jsonString);
                                }
                                else {
                                    gwBackendHandler.GetCallServersRelatedToLoadBalancerDB(reqId, result.LoadBalancer.id, function (err, csRes) {
                                        if (err) {
                                            var jsonString = messageFormatter.FormatMessage(err, "Load Balancer added but error occurred while notifying call servers", false, undefined);
                                            logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                            res.end(jsonString);
                                        }
                                        else {
                                            //Publish to Redis
                                            csRes.forEach(function (cs) {
                                                var pattern = "CSCOMMAND:" + cs.id + "rescangateway";
                                                var message = '{"profile": "external"}';

                                                redisHandler.PublishToRedis(pattern, message, function (err, redisResult) {

                                                })

                                            });
                                            var jsonString = messageFormatter.FormatMessage(undefined, "Load Balancer added successfully", true, undefined);
                                            logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                            res.end(jsonString);
                                        }
                                    })

                                }
                            }
                            catch (ex) {
                                var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
                                logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                        })
                    }
                    else {
                        var jsonString = messageFormatter.FormatMessage(new Error('Cloud has no load balancers configured'), "ERROR", false, undefined);
                        logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                }

            });
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or cloud id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);

        }


    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/SetSipProfile/:profId', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var trunkId = parseInt(req.params.id);
        var profId = parseInt(req.params.profId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToSipProfile] - [%s] - HTTP Request Received Req Params - Id : %s, profId : %s', reqId, trunkId, profId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (trunkId && profId) {
            gwBackendHandler.AssignTrunkToProfile(reqId, trunkId, profId, companyId, tenantId, function (err, result) {

                try {
                    if (err) {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else {
                        gwBackendHandler.GetCallServerByProfileIdDB(reqId, profId, function (err, csRes) {
                            if (err) {
                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added to trunk but error occurred while notifying call servers", false, undefined);
                                logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                            else if (csRes) {
                                if (csRes.CallServer) {
                                    var pattern = "CSCOMMAND:" + csRes.CallServer.id + "rescangateway";
                                    var message = '{"profile":"' + csRes.ProfileName + '"}';

                                    redisHandler.PublishToRedis(pattern, message, function (err, redisResult) {

                                    })
                                }

                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully", true, undefined);
                                logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                            else {
                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully - call servers not notfied", true, undefined);
                                logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                        });
                    }
                }
                catch (ex) {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or profile id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/SetTranslation/:transId', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();

    try {
        var trunkId = parseInt(req.params.id);
        var transId = parseInt(req.params.transId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - HTTP Request Received Req Params - trunkId : %s, transId : %s', reqId, trunkId, transId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (trunkId && transId) {
            gwBackendHandler.AssignTrunkTranslation(reqId, trunkId, transId, companyId, tenantId, function (err, result) {


                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Translation assigned to trunk successfully", result, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }

            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or profile id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/SetOperator/:opId', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var trunkId = parseInt(req.params.id);
        var opId = parseInt(req.params.opId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - HTTP Request Received Req Params - trunkId : %s, opId : %s', reqId, trunkId, opId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (trunkId && opId) {
            gwBackendHandler.AssignOperatorToTrunk(reqId, trunkId, opId, companyId, tenantId, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Operator assigned to trunk successfully", result, undefined);
                    logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or operator id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/Availability/:status', authorization({
    resource: "trunk",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var gwId = parseInt(req.params.id);
        var enable = (req.params.status === 'true');

        logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkAvailability] - [%s] - HTTP Request Received Req Params - id : %s, enable : %s', reqId, gwId, enable);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (gwId) {
            gwBackendHandler.SetTrunkEnabledStatusDB(reqId, gwId, enable, companyId, tenantId, function (err, result) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Updated Successfully", result, undefined);
                    logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Trunk id not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:trNum/SetInboundLimit/:limId', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var phnNum = req.params.trNum;
        var inboundLim = req.params.limId;

        logger.debug('[DVP-PhoneNumberTrunkService.TrunkPhoneNumberInboundLimit] - [%s] - HTTP Request Received Req Body - ', reqId, req.body);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (phnNum && inboundLim) {
            gwBackendHandler.AssignInboundLimitToTrunkNumberDB(reqId, phnNum, inboundLim, companyId, tenantId, function (err, result) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.TrunkPhoneNumberInboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Limit Added Successfully", result, undefined);
                    logger.debug('[DVP-PBXService.TrunkPhoneNumberInboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Phone number or limit not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.TrunkPhoneNumberInboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.TrunkPhoneNumberInboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:trNum/SetOutboundLimit/:limId', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var phnNum = req.params.trNum;
        var outboundLim = req.params.limId;

        logger.debug('[DVP-PhoneNumberTrunkService.TrunkPhoneNumberOutboundLimit] - [%s] - HTTP Request Received Req Body - ', reqId, req.body);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (phnNum && outboundLim) {
            gwBackendHandler.AssignOutboundLimitToTrunkNumberDB(reqId, phnNum, outboundLim, companyId, tenantId, function (err, result) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.TrunkPhoneNumberOutboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Limit Added Successfully", result, undefined);
                    logger.debug('[DVP-PBXService.TrunkPhoneNumberOutboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Phone number or limit not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.TrunkPhoneNumberOutboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.TrunkPhoneNumberOutboundLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:trNum/SetBothLimit/:limId', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var phnNum = req.params.trNum;
        var bothLim = req.params.limId;

        logger.debug('[DVP-PhoneNumberTrunkService.TrunkPhoneNumberBothLimit] - [%s] - HTTP Request Received Req Body - ', reqId, req.body);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (phnNum && bothLim) {
            gwBackendHandler.AssignBothLimitToTrunkNumberDB(reqId, phnNum, bothLim, companyId, tenantId, function (err, result) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.TrunkPhoneNumberBothLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Limit Added Successfully", result, undefined);
                    logger.debug('[DVP-PBXService.TrunkPhoneNumberBothLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Phone number or limit not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.TrunkPhoneNumberBothLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.TrunkPhoneNumberBothLimit] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});


//DONE
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id', authorization({
    resource: "trunk",
    action: "read"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {
        var trunkId = parseInt(req.params.id);

        logger.debug('[DVP-PhoneNumberTrunkService.GetTrunk] - [%s] - HTTP Request Received Req Params - id : %s', reqId, trunkId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (trunkId) {
            gwBackendHandler.GetTrunkByIdDB(reqId, trunkId, companyId, tenantId, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Found", true, result);
                    logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunks', authorization({
    resource: "trunk",
    action: "read"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    var emptyArr = [];
    try {
        logger.debug('[DVP-PhoneNumberTrunkService.GetTrunks] - [%s] - HTTP Request Received', reqId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        gwBackendHandler.GetTrunkListDB(reqId, companyId, tenantId, function (err, result) {

            if (err) {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, emptyArr);
                logger.debug('[DVP-PBXService.GetTrunks] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else {
                var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Found", true, result);
                logger.debug('[DVP-PBXService.GetTrunks] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
        })
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, emptyArr);
        logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:operatorId/UnAllocatedNumbers', authorization({
    resource: "trunk",
    action: "read"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    var numberDetails = [];
    try {
        var operatorId = parseInt(req.params.operatorId);

        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - HTTP Request Received Req Params - operatorId : %s', reqId, operatorId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (operatorId) {
            gwBackendHandler.GetUnallocatedPhoneNumbersForOperator(reqId, operatorId, companyId, tenantId, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, numberDetails);
                    logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {

                    if (result && result.Trunk && result.Trunk.length > 0) {
                        result.Trunk.forEach(function (tr) {
                            if (tr.TrunkPhoneNumber && tr.TrunkPhoneNumber.length > 0) {
                                tr.TrunkPhoneNumber.forEach(function (trNum) {
                                    numberDetails.push(trNum);
                                })
                            }

                        });

                        var jsonString = messageFormatter.FormatMessage(err, "Success", true, numberDetails);
                        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else {
                        var jsonString = messageFormatter.FormatMessage(new Error('No trunks found'), "ERROR", false, numberDetails);
                        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }

                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error('Empty Params'), "ERROR", false, numberDetails);
            logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, numberDetails);
        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:operatorId/AllocatedNumbers', authorization({
    resource: "number",
    action: "read"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    var numberDetails = [];
    try {
        var operatorId = parseInt(req.params.operatorId);

        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - HTTP Request Received Req Params - operatorId : %s', reqId, operatorId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId) {
            throw new Error("Invalid company or tenant");
        }

        if (operatorId) {
            gwBackendHandler.GetAllocatedPhoneNumbersForOperator(reqId, operatorId, companyId, tenantId, function (err, result) {
                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, numberDetails);
                    logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {

                    if (result && result.Trunk && result.Trunk.length > 0) {
                        result.Trunk.forEach(function (tr) {
                            if (tr.TrunkPhoneNumber && tr.TrunkPhoneNumber.length > 0) {
                                tr.TrunkPhoneNumber.forEach(function (trNum) {
                                    numberDetails.push(trNum);
                                })
                            }

                        });

                        var jsonString = messageFormatter.FormatMessage(err, "Success", true, numberDetails);
                        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else {
                        var jsonString = messageFormatter.FormatMessage(new Error('No trunks found'), "ERROR", false, numberDetails);
                        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }

                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Params"), "ERROR", false, numberDetails);
            logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, numberDetails);
        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});


//PAWAN :- Messageformatter and try catch Done

//.......................................post............................................................................

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:phonenumber/Availability/:enable', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = '';

    try {
        reqId = uuid.v1();
    }
    catch (ex) {

    }

    try {

        logger.debug('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [HTTP]  - Request received -  Data - Phone %s Company %s Status %s', reqId, req.params.phonenumber, Company, req.params.enable);

        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        number.ChangeNumberAvailability(req, Company, Tenant, reqId, res);

    }
    catch (ex) {
        logger.debug('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [HTTP]  - Exception on Request  -  Data - Phone %s Company %s Status %s', reqId, req.params.phonenumber, Company, req.params.enable, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

//.......................................post............................................................................

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:PhoneNumber', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = '';

    try {
        reqId = uuid.v1();
    }
    catch (ex) {

    }

    try {

        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [HTTP]  - Request received -  Data - Phone %s Company ', reqId, req.params.PhoneNumber, Company);

        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        number.UpdatePhoneDetails(Company, req.params.PhoneNumber, req, reqId, res);


    }
    catch (ex) {
        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [HTTP]  - Exception on Request -  Data - Phone %s Company ', reqId, req.params.PhoneNumber, Company, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

//.......................................post............................................................................

//check params

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/Category/:phone', authorization({
    resource: "number",
    action: "write"
}), function (req, res, next) {
    var reqId = '';

    try {
        reqId = uuid.v1();
    }
    catch (ex) {

    }


    try {

        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [HTTP]  - Request received -  Data - %s', reqId, JSON.stringify(req.body));
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        number.UpdatePhoneNumberObjCategory(Company, req.params.phone, req, reqId, res);

    }
    catch (ex) {
        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [HTTP]  - Exception in Request  -  Data - %s', reqId, JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});
//.......................................get............................................................................

//server.get('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/get_all/:CompanyId/:PhoneNumber',function(req,res,next)
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber/:PhoneNumber', authorization({
    resource: "number",
    action: "read"
}), function (req, res, next) {
    var reqId = '';

    try {
        reqId = uuid.v1();
    }
    catch (ex) {

    }


    try {

        logger.debug('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - [HTTP]  - Request received -  Data - Company %s Phone %s ', reqId, Company, req.params.PhoneNumber);
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        number.GetAllPhoneDetails(Company, req, reqId, res);


    }
    catch (ex) {
        logger.error('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - [HTTP]  - Exception in Request -  Data - Company %s Phone %s ', reqId, Company, req.params.PhoneNumber, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});
//.......................................get............................................................................

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumbers', authorization({
    resource: "number",
    action: "read"
}), function (req, res, next) {

    var reqId = '';

    try {
        reqId = uuid.v1();
    }
    catch (ex) {

    }

    try {

        logger.debug('[DVP-PhoneNumberTrunkService.GetCompanyPhones] - [%s] - [HTTP]  - Request received -  Data - Company %s  ', reqId, Company);

        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        number.GetCompanyPhones(Company, reqId, res);


    }
    catch (ex) {
        logger.error('[DVP-PhoneNumberTrunkService.GetCompanyPhones] - [%s] - [HTTP]  - Exception in Request received -  Data - Company %s  ', reqId, Company, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

    return next();
});

// application development phase

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/PhoneNumbers', authorization({
    resource: "number",
    action: "read"
}), function (req, res, next) {
    var reqId = nodeUuid.v1();
    try {

        logger.debug('[DVP-PhoneNumberTrunkService.GetPhoneNumbersOfTrunk] - [%s] - HTTP Request Received Req Params - id : %s', reqId, trunkId);

        var trunkId = parseInt(req.params.id);

        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        if (trunkId) {
            gwBackendHandler.GetPhoneNumbersOfTrunk(reqId, trunkId, Company, Tenant, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.GetPhoneNumbersOfTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Found", true, result);
                    logger.debug('[DVP-PBXService.GetPhoneNumbersOfTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.GetPhoneNumbersOfTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.GetPhoneNumbersOfTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

function Crossdomain(req,res,next){


    var xml='<?xml version=""1.0""?><!DOCTYPE cross-domain-policy SYSTEM ""http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd""> <cross-domain-policy>    <allow-access-from domain=""*"" />        </cross-domain-policy>';

    /*var xml='<?xml version="1.0"?>\n';

     xml+= '<!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd">\n';
     xml+='';
     xml+=' \n';
     xml+='\n';
     xml+='';*/
    req.setEncoding('utf8');
    res.end(xml);

}

function Clientaccesspolicy(req,res,next){


    var xml='<?xml version="1.0" encoding="utf-8" ?>       <access-policy>        <cross-domain-access>        <policy>        <allow-from http-request-headers="*">        <domain uri="*"/>        </allow-from>        <grant-to>        <resource include-subpaths="true" path="/"/>        </grant-to>        </policy>        </cross-domain-access>        </access-policy>';
    req.setEncoding('utf8');
    res.end(xml);

}

server.get("/crossdomain.xml",Crossdomain);
server.get("/clientaccesspolicy.xml",Clientaccesspolicy);

// ----------------------------------- || Buy Number || --------------------------------------- \\

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:OperatorId/Trunk/:TrunkId/Numbers', authorization({
    resource: "BuyNumbers",
    action: "write"
}), function (req, res, next) {
    try {

    //    logger.info('[AddPhoneNumberToSale] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.body));
        var company = req.user.company;
        var tenant = req.user.tenant;
        if (!company || !tenant) {
            throw new Error("Invalid company or tenant Ids");
        }
        buyNumberHandler.AddPhoneNumberToSale(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[AddPhoneNumberToSale] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:OperatorId/Number/:PhoneNumber/Order', authorization({
    resource: "BuyNumbers",
    action: "write"
}), function (req, res, next) {
    try {

    //    logger.info('[OrderNumber] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.body));
        var company = req.user.company;
        var tenant = req.user.tenant;
        if (!company || !tenant) {
            throw new Error("Invalid company or tenant Ids");
        }

        buyNumberHandler.OrderNumber(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[OrderNumber] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:OperatorId/Number/:PhoneNumber/Assign', authorization({
    resource: "BuyNumbers",
    action: "write"
}), function (req, res, next) {
    try {

    //    logger.info('[AssignNumber] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.body));
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant Ids");
        }
        var company = req.user.company;
        var tenant = req.user.tenant;

        buyNumberHandler.AssignNumber(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[AssignNumber] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.body), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operators/Numbers', authorization({
    resource: "BuyNumbers",
    action: "read"
}), function (req, res, next) {
    try {

    //    logger.info('[GetAllNumbers] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.params));
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant Ids");
        }
        var company = req.user.company;
        var tenant = req.user.tenant;

        buyNumberHandler.GetAllNumbers(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[GetAllNumbers] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:OperatorId/Numbers', authorization({
    resource: "BuyNumbers",
    action: "read"
}), function (req, res, next) {
    try {

    //    logger.info('[GetAllNumbersByOperator] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.params));
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant Ids");
        }
        var company = req.user.company;
        var tenant = req.user.tenant;

        buyNumberHandler.GetAllNumbersByOperator(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[GetAllNumbersByOperator] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:OperatorId/Numbers/Processing', authorization({
    resource: "BuyNumbers",
    action: "read"
}), function (req, res, next) {
    try {

    //    logger.info('[GetProcessingNumber] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.params));
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant Ids");
        }
        var company = req.user.company;
        var tenant = req.user.tenant;

        buyNumberHandler.GetProcessingNumber(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[GetProcessingNumber] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Operator/:OperatorId/Numbers/Sale', authorization({
    resource: "BuyNumbers",
    action: "read"
}), function (req, res, next) {
    try {

    //    logger.info('[GetSaleNumber] - [HTTP]  - Request received -  Data - %s', JSON.stringify(req.params));
        if (!req.user.company || !req.user.tenant) {
            throw new Error("Invalid company or tenant Ids");
        }
        var company = req.user.company;
        var tenant = req.user.tenant;

        buyNumberHandler.GetSaleNumber(tenant, company, req, res);

    }
    catch (ex) {
        logger.error('[GetSaleNumber] - [HTTP]  - Exception in Request  -  Data - %s', JSON.stringify(req.params), ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

// ----------------------------------- || End Buy Number || --------------------------------------- \\

