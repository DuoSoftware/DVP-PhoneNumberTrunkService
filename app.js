var restify = require('restify');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logHandler = require('DVP-Common/LogHandler/CommonLogHandler.js');
var gwBackendHandler = require('./TrunkBackendHandler.js');
var number=require('./PhoneNumberManagement.js');
var redisHandler = require('./RedisHandler.js');
var config = require('config');
var nodeUuid = require('node-uuid');
//var xmlGen = require('./XmlResponseGenerator.js');

var hostIp = config.Host.Ip;
var hostPort = config.Host.Port;
var hostVersion = config.Host.Version;

var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


//{"PhoneNumber":"12000", "ObjClass":"CallServer", "ObjType":"TrunkNumber", "ObjCategory":"Inbound", "Enable":true, "CompanyId":1, "TenantId":3}
server.post('/DVP/API/' + hostVersion + '/TrunkApi/AddNumber/:id', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var id = req.params.id;
        var phnInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.AddNumber] - [%s] - HTTP Request Received - Params - Id : %s - Req Body : %s', reqId, id, phnInfo);

        if(phnInfo)
        {
            gwBackendHandler.addPhoneNumbersToTrunk(reqId, id, phnInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Number Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/TrunkApi/DeleteNumber/:PhoneNumber/:CompanyId/',function(req, res, next)
server.del('/DVP/API/' + hostVersion + '/TrunkApi/DeleteNumber/:PhoneNumber/:CompanyId/',function(req, res, next)
{
    var reqId = nodeUuid.v1();

    try
    {
        var phoneNum = req.params.PhoneNumber;
        var companyId = req.params.CompanyId;

        logger.debug('[DVP-PhoneNumberTrunkService.DeleteNumber] - [%s] - HTTP Request Received - Params - PhoneNumber : %s, CompanyId : %s', reqId, phoneNum, companyId);

        if (phoneNum && companyId)
        {
            gwBackendHandler.removePhoneNumber(reqId, phoneNum, companyId, 0, function (err, result) {

                if (err) {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    res.end(jsonString);
                }
                else {
                    var jsonString = messageFormatter.FormatMessage(err, "Phone number removed successfully", result, -1);
                    res.end(jsonString);
                }
            })
        }
        else {
            throw new Error("Invalid url");
        }
        return next();
    }
    catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();
});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/BuyNumber/',function(req, res, next)
{
    var reqId = nodeUuid.v1();

    var phnInfo = req.body;

    logger.debug('[DVP-PhoneNumberTrunkService.BuyNumber] - [%s] - HTTP Request Received - Req Body : %s', reqId, phnInfo);

    if(phnInfo)
    {
        gwBackendHandler.switchPhoneNumberCompany(reqId, phnInfo.PhoneNumber, phnInfo.CompanyId, phnInfo.TenantId, phnInfo.companyToChange, phnInfo.tenantToChange, function(err, result){

            if(err)
            {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                res.end(jsonString);
            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(err, "Number Buy Successful", result, -1);
                res.end(jsonString);
            }
        })
    }
    else
    {
        throw new Error("Empty Body");
    }
    return next();

});

/*
 {"TrunkCode":"TestTrunk","TrunkName":"Test1","ObjClass":"DVP","ObjType":"Trunk","ObjCategory":"SIP","IpUrl":"192.168.1.198","Enable":"True","CompanyId":"1","TenantId":"3"}
 */
server.post('/DVP/API/' + hostVersion + '/TrunkApi/CreateTrunk', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var gwInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.CreateTrunk] - [%s] - HTTP Request Received - Req Body : %s', reqId, gwInfo);

        if(gwInfo)
        {
            gwBackendHandler.addTrunkConfiguration(reqId, gwInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/AddOperator', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var opInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.AddOperator] - [%s] - HTTP Request Received - Req Body : %s', reqId, opInfo);

        if(opInfo)
        {
            gwBackendHandler.AddTrunkOperator(reqId, opInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Operator Added Successfully", result, recordId);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/UpdateTrunk/:id', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var id = req.params.id;
        var gwInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.AddOperator] - [%s] - HTTP Request Received Req Params - Id : %s, - Req Body : %s', reqId, id, gwInfo);

        if(id && gwInfo)
        {
            gwBackendHandler.updateTrunkConfiguration(reqId, id, gwInfo, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", result, undefined);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Updated Successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty body or id not provided");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/AssignTrunkToLoadBalancer/:id/:lbId', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var trunkId = parseInt(req.params.id);
        var lbId = parseInt(req.params.lbId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - HTTP Request Received Req Params - Id : %s, LbId : %s', reqId, trunkId, lbId);

        if(trunkId && lbId)
        {
            gwBackendHandler.AssignTrunkToLoadBalancer(reqId, trunkId, lbId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        gwBackendHandler.GetCallServersRelatedToLoadBalancer(reqId, lbId, function(err, csRes)
                        {
                            if(err)
                            {
                                var jsonString = messageFormatter.FormatMessage(err, "Load Balancer added successfully", true, null);
                                res.end(jsonString);
                            }
                            else
                            {
                                //Publish to Redis
                                csRes.forEach(function(cs)
                                {
                                    var pattern = "CSCOMMAND:" + cs.id + "rescangateway";
                                    var message = '{"profile": "external"}';

                                    redisHandler.PublishToRedis(pattern, message, function(err, redisResult)
                                    {

                                    })

                                });
                                var jsonString = messageFormatter.FormatMessage(err, "Load Balancer added successfully", true, null);
                                res.end(jsonString);
                            }
                        })

                    }
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Invalid trunk id or load balancer id provided");
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();
});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/AssignTrunkToSipProfile/:id/:profId', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var trunkId = parseInt(req.params.id);
        var profId = parseInt(req.params.profId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToSipProfile] - [%s] - HTTP Request Received Req Params - Id : %s, profId : %s', reqId, trunkId, profId);

        if(trunkId && profId)
        {
            gwBackendHandler.AssignTrunkToProfile(reqId, trunkId, profId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        gwBackendHandler.GetCallServerByProfileId(reqId, profId, function(err, csRes)
                        {
                            if(err)
                            {
                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully", true, null);
                                res.end(jsonString);
                            }
                            else if(csRes)
                            {
                                if(csRes.CallServer)
                                {
                                    var pattern = "CSCOMMAND:" + csRes.CallServer.id + "rescangateway";
                                    var message = '{"profile":"' + csRes.ProfileName + '"}';

                                    redisHandler.PublishToRedis(pattern, message, function(err, redisResult)
                                    {

                                    })
                                }

                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully", true, null);
                                res.end(jsonString);
                            }
                            else
                            {
                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully", true, null);
                                res.end(jsonString);
                            }
                        });
                    }
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Invalid trunk id or profile id provided");
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();
});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/AssignTrunkTranslation/:id/:transId', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var trunkId = parseInt(req.params.id);
        var transId = parseInt(req.params.transId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - HTTP Request Received Req Params - trunkId : %s, transId : %s', reqId, trunkId, transId);

        if(trunkId && transId)
        {
            gwBackendHandler.AssignTrunkTranslation(reqId, trunkId, transId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "Translation assigned to trunk successfully", result, null);
                        res.end(jsonString);
                    }
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Invalid trunk id or profile id provided");
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();
});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/AssignOperatorToTrunk/:id/:opId', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();
        var trunkId = parseInt(req.params.id);
        var opId = parseInt(req.params.opId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - HTTP Request Received Req Params - trunkId : %s, opId : %s', reqId, trunkId, opId);

        if(trunkId && opId)
        {
            gwBackendHandler.AssignOperatorToTrunk(reqId, trunkId, opId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "Operator assigned to trunk successfully", result, null);
                        res.end(jsonString);
                    }
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, null);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Invalid trunk id or operator id provided");
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();
});

server.post('/DVP/API/' + hostVersion + '/TrunkApi/SetTrunkAvailability/:id/Enable/:status', function(req, res, next)
{
    try
    {
        var reqId = nodeUuid.v1();

        var gwId = parseInt(req.params.id);
        var enable = Boolean(req.params.status);

        logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkAvailability] - [%s] - HTTP Request Received Req Params - id : %s, enable : %s', reqId, gwId, enable);

        if(gwId)
        {
            gwBackendHandler.setTrunkEnabledStatus(reqId, gwId, enable, function(err, result)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", result, undefined);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Updated Successfully", result, undefined);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Trunk id not provided");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

//server.post('/DVP/API/' + hostVersion + '/TrunkApi/GetTrunk/:id', function(req, res, next)
server.get('/DVP/API/' + hostVersion + '/TrunkApi/GetTrunk/:id', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var trunkId = parseInt(req.params.id);

        logger.debug('[DVP-PhoneNumberTrunkService.GetTrunk] - [%s] - HTTP Request Received Req Params - id : %s', reqId, trunkId);

        if(trunkId)
        {
            gwBackendHandler.getTrunkById(reqId, trunkId, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Found", true, result);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/TrunkApi/GetUnAllocatedNumbers/:operatorId/:companyId/:tenantId', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    var numberDetails = [];
    try
    {
        var operatorId = parseInt(req.params.operatorId);
        var companyId = parseInt(req.params.companyId);
        var tenantId = parseInt(req.params.tenantId);

        logger.debug('[DVP-PhoneNumberTrunkService.GetUnAllocatedNumbers] - [%s] - HTTP Request Received Req Params - operatorId : %s, companyId : %s, tenantId : %s', reqId, operatorId, companyId, tenantId);

        if(operatorId && companyId && tenantId)
        {
            gwBackendHandler.GetUnallocatedPhoneNumbersForOperator(reqId, operatorId, companyId, tenantId, function(err, result)
            {

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                    res.end(jsonString);
                }
                else
                {

                    if(result && result.Trunk && result.Trunk.length > 0)
                    {
                        result.Trunk.forEach(function(tr)
                        {
                            if(tr.TrunkPhoneNumber && tr.TrunkPhoneNumber.length > 0)
                            {
                                tr.TrunkPhoneNumber.forEach(function(trNum)
                                {
                                    numberDetails.push(trNum);
                                })
                            }

                        });

                        var jsonString = messageFormatter.FormatMessage(err, "Success", true, numberDetails);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(new Error('No trunks found'), "ERROR", false, numberDetails);
                        res.end(jsonString);
                    }

                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, numberDetails);
        res.end(jsonString);
    }

    return next();

});

server.get('/DVP/API/' + hostVersion + '/TrunkApi/GetAllocatedNumbers/:operatorId/:companyId/:tenantId', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    var numberDetails = [];
    try
    {
        var operatorId = parseInt(req.params.operatorId);
        var companyId = parseInt(req.params.companyId);
        var tenantId = parseInt(req.params.tenantId);

        logger.debug('[DVP-PhoneNumberTrunkService.GetAllocatedNumbers] - [%s] - HTTP Request Received Req Params - operatorId : %s, companyId : %s, tenantId : %s', reqId, operatorId, companyId, tenantId);

        if(operatorId && companyId && tenantId)
        {
            gwBackendHandler.GetAllocatedPhoneNumbersForOperator(reqId, operatorId, companyId, tenantId, function(err, result)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                    res.end(jsonString);
                }
                else
                {

                    if(result && result.Trunk && result.Trunk.length > 0)
                    {
                        result.Trunk.forEach(function(tr)
                        {
                            if(tr.TrunkPhoneNumber && tr.TrunkPhoneNumber.length > 0)
                            {
                                tr.TrunkPhoneNumber.forEach(function(trNum)
                                {
                                    numberDetails.push(trNum);
                                })
                            }

                        });

                        var jsonString = messageFormatter.FormatMessage(err, "Success", true, numberDetails);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(new Error('No trunks found'), "ERROR", false, numberDetails);
                        res.end(jsonString);
                    }

                }
            })
        }
        else
        {
            throw new Error("Empty Body");
        }
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, numberDetails);
        res.end(jsonString);
    }

    return next();

});




//PAWAN :- Messageformatter and try catch Done

//.......................................post............................................................................

server.post('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/chng_availability/:phonenumber/:companyid/:enable',function(req,res,next)
{
    try {

        number.ChangeNumberAvailability(req, res);

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ChangeNumberAvailability failed", false, null);
        res.end(jsonString);
    }
    return next();
});

//.......................................post............................................................................

server.post('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/update_phone_schedule/:companyid/:phonenumber',function(req,res,next)
{
    try {
        number.UpdatePhoneDetails(req, res);
        //var jsonString = messageFormatter.FormatMessage(null, "UpdatePhoneDetails Done", true, res);
        //res.end(jsonString);

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "UpdatePhoneDetails failed", false, res);
        res.end(jsonString);
    }
    return next();
});

//.......................................post............................................................................


server.post('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/Update_category',function(req,res,next)
{
    try {

        number.UpdatePhoneNumberObjCategory(req, res);

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "UpdatePhoneNumberObjCategory failed", false, null);
        res.end(jsonString);
    }
    return next();
});
//.......................................get............................................................................

server.get('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/get_all/:CompanyId/:PhoneNumber',function(req,res,next)
{


    try {
        number.GetAllPhoneDetails(req,res);


    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "GetAllPhoneDetails failed", false, res);
        res.end(jsonString);
    }
return next();
});
//.......................................get............................................................................

server.get('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/get_phone/:CompanyId',function(req,res,next)
{

    try {
        number.GetCompanyPhones(req,res);


    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "GetCompanyPhones failed", false, res);
        res.end(jsonString);
    }

return next();
});




server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});