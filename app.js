var restify = require('restify');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
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



//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/TrunkNumber', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var phnInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkNumber] - [%s] - HTTP Request Received - Req Body : ', reqId, phnInfo);

        if(phnInfo)
        {
            phnInfo.CompanyId = 1;
            phnInfo.TenantId = 3;

            gwBackendHandler.AddPhoneNumbersToTrunkDB(reqId, phnInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Number Added Successfully", result, recordId);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, -1);
            logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});


//DONE
server.del('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/RemoveNumber/:PhoneNumber',function(req, res, next)
{
    var reqId = nodeUuid.v1();

    try
    {
        var phoneNum = req.params.PhoneNumber;

        logger.debug('[DVP-PhoneNumberTrunkService.DeleteNumber] - [%s] - HTTP Request Received - Params - PhoneNumber : %s', reqId, phoneNum);

        if (phoneNum)
        {
            gwBackendHandler.RemovePhoneNumberDB(reqId, phoneNum, 1, 3, function (err, result)
            {

                if (err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Phone number removed successfully", result, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid url"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch (ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/BuyNumber/',function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var phnInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.BuyNumber] - [%s] - HTTP Request Received - Req Body : %s', reqId, phnInfo);

        if(phnInfo)
        {
            gwBackendHandler.SwitchPhoneNumberCompanyDB(reqId, phnInfo.PhoneNumber, 1, 3, phnInfo.CompanyToChange, phnInfo.TenantToChange, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Number Buy Successful", result, undefined);
                    logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AddTrunkNumber] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
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
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/CreateTrunk', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {

        var gwInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.CreateTrunk] - [%s] - HTTP Request Received - Req Body : ', reqId, gwInfo);

        if(gwInfo)
        {
            gwInfo.CompanyId = 1;
            gwInfo.TenantId = 3;
            gwBackendHandler.AddTrunkConfigurationDB(reqId, gwInfo, function(err, recordId, result)
            {

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, recordId);
                    logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Added Successfully", result, recordId);
                    logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, -1);
            logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        logger.debug('[DVP-PBXService.CreateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
//{"OperatorName": "TestOperator", "OperatorCode":"1234e", "ObjClass": "GGG", "ObjType": "FFF", "ObjCategory":"fff"}
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/NewOperator', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var opInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.NewOperator] - [%s] - HTTP Request Received - Req Body : %s', reqId, opInfo);

        if(opInfo)
        {
            opInfo.CompanyId = 1;
            opInfo.TenantId = 3;
            gwBackendHandler.AddTrunkOperator(reqId, opInfo, function(err, recordId, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, -1);
                    logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Operator Added Successfully", result, recordId);
                    logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error('Empty Body'), "ERROR", false, -1);
            logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        logger.debug('[DVP-PBXService.NewOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
//{"Enable":false, "IpUrl":"192.123.32.112", "ObjCategory":"TTT", "ObjClass":"TTT", "ObjType":"TTT", "TrunkName":"TestTrunk"}
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/UpdateTrunk/:id', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var id = req.params.id;
        var gwInfo = req.body;

        logger.debug('[DVP-PhoneNumberTrunkService.UpdateTrunk] - [%s] - HTTP Request Received Req Params - Id : %s, - Req Body : ', reqId, id, gwInfo);

        if(id && gwInfo)
        {
            gwInfo.CompanyId = 1;
            gwInfo.TenantId = 3;

            gwBackendHandler.UpdateTrunkConfigurationDB(reqId, id, gwInfo, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", result, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Trunk Updated Successfully", result, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty body or id not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/AssignTrunk/:id/ToLoadBalancer/:lbId', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var trunkId = parseInt(req.params.id);
        var lbId = parseInt(req.params.lbId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - HTTP Request Received Req Params - Id : %s, LbId : %s', reqId, trunkId, lbId);

        if(trunkId && lbId)
        {
            gwBackendHandler.AssignTrunkToLoadBalancer(reqId, trunkId, lbId, 1, 3, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                        logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else
                    {
                        gwBackendHandler.GetCallServersRelatedToLoadBalancerDB(reqId, lbId, function(err, csRes)
                        {
                            if(err)
                            {
                                var jsonString = messageFormatter.FormatMessage(err, "Load Balancer added but error occurred while notifying call servers", false, undefined);
                                logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
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
                                var jsonString = messageFormatter.FormatMessage(undefined, "Load Balancer added successfully", true, undefined);
                                logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                        })

                    }
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or load balancer id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AssignTrunkToLoadBalancer] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/AssignTrunk/:id/ToSipProfile/:profId', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var trunkId = parseInt(req.params.id);
        var profId = parseInt(req.params.profId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToSipProfile] - [%s] - HTTP Request Received Req Params - Id : %s, profId : %s', reqId, trunkId, profId);

        if(trunkId && profId)
        {
            gwBackendHandler.AssignTrunkToProfile(reqId, trunkId, profId, 1, 3, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else
                    {
                        gwBackendHandler.GetCallServerByProfileIdDB(reqId, profId, function(err, csRes)
                        {
                            if(err)
                            {
                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added to trunk but error occurred while notifying call servers", false, undefined);
                                logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
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

                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully", true, undefined);
                                logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                            else
                            {
                                var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully - call servers not notfied", true, undefined);
                                logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                                res.end(jsonString);
                            }
                        });
                    }
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or profile id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/AssignTranslation/:transId/ToTrunk/:id', function(req, res, next)
{
    var reqId = nodeUuid.v1();

    try
    {
        var trunkId = parseInt(req.params.id);
        var transId = parseInt(req.params.transId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - HTTP Request Received Req Params - trunkId : %s, transId : %s', reqId, trunkId, transId);

        if(trunkId && transId)
        {
            gwBackendHandler.AssignTrunkTranslation(reqId, trunkId, transId, 1, 3, function(err, result){


                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "Translation assigned to trunk successfully", result, undefined);
                        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }

            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or profile id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.UpdateTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/AssignOperator/:opId/ToTrunk/:id', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var trunkId = parseInt(req.params.id);
        var opId = parseInt(req.params.opId);

        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - HTTP Request Received Req Params - trunkId : %s, opId : %s', reqId, trunkId, opId);

        if(trunkId && opId)
        {
            gwBackendHandler.AssignOperatorToTrunk(reqId, trunkId, opId, 1, 3, function(err, result) {

                if (err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Operator assigned to trunk successfully", result, undefined);
                    logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid trunk id or operator id provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.AssignOperatorToTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();
});

//DONE
server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id/Availability/:status', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var gwId = parseInt(req.params.id);
        var enable = (req.params.status === 'true');

        logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkAvailability] - [%s] - HTTP Request Received Req Params - id : %s, enable : %s', reqId, gwId, enable);

        if(gwId)
        {
            gwBackendHandler.SetTrunkEnabledStatusDB(reqId, gwId, enable, 1, 3, function(err, result)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Updated Successfully", result, undefined);
                    logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Trunk id not provided"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.SetTrunkAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/Trunk/:id', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    try
    {
        var trunkId = parseInt(req.params.id);

        logger.debug('[DVP-PhoneNumberTrunkService.GetTrunk] - [%s] - HTTP Request Received Req Params - id : %s', reqId, trunkId);

        if(trunkId)
        {
            gwBackendHandler.GetTrunkByIdDB(reqId, trunkId, 1, 3, function(err, result){

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                    logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(undefined, "Trunk Found", true, result);
                    logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Body"), "ERROR", false, undefined);
            logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, undefined);
        logger.debug('[DVP-PBXService.GetTrunk] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/UnAllocatedNumbersForOperator/:operatorId', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    var numberDetails = [];
    try
    {
        var operatorId = parseInt(req.params.operatorId);

        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - HTTP Request Received Req Params - operatorId : %s', reqId, operatorId);

        if(operatorId)
        {
            gwBackendHandler.GetUnallocatedPhoneNumbersForOperator(reqId, operatorId, 1, 3, function(err, result)
            {

                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, numberDetails);
                    logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
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
                        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(new Error('No trunks found'), "ERROR", false, numberDetails);
                        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }

                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error('Empty Params'), "ERROR", false, numberDetails);
            logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, numberDetails);
        logger.debug('[DVP-PhoneNumberTrunkService.UnAllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});

//DONE
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/AllocatedNumbersForOperator/:operatorId', function(req, res, next)
{
    var reqId = nodeUuid.v1();
    var numberDetails = [];
    try
    {
        var operatorId = parseInt(req.params.operatorId);

        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - HTTP Request Received Req Params - operatorId : %s', reqId, operatorId);

        if(operatorId)
        {
            gwBackendHandler.GetAllocatedPhoneNumbersForOperator(reqId, operatorId, 1, 3, function(err, result)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, numberDetails);
                    logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
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
                        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(new Error('No trunks found'), "ERROR", false, numberDetails);
                        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
                        res.end(jsonString);
                    }

                }
            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Empty Params"), "ERROR", false, numberDetails);
            logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, numberDetails);
        logger.debug('[DVP-PhoneNumberTrunkService.AllocatedNumbersForOperator] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);
    }

    return next();

});




//PAWAN :- Messageformatter and try catch Done

//.......................................post............................................................................

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/PhoneNumberManagement/ChangeAvailabilityOf/:phonenumber/:companyid/:enable',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        logger.debug('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [HTTP]  - Request received -  Data - Phone %s Company %s Status %s',reqId,req.params.phonenumber,req.params.companyid,req.params.enable);


        number.ChangeNumberAvailability(req,reqId,res);

    }
    catch(ex)
    {
        logger.debug('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [HTTP]  - Exception on Request  -  Data - Phone %s Company %s Status %s',reqId,req.params.phonenumber,req.params.companyid,req.params.enable,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

//.......................................post............................................................................

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/PhoneNumberManagement/Phone/:phonenumber/:companyid',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [HTTP]  - Request received -  Data - Phone %s Company ',reqId,req.params.phonenumber,req.params.companyid);

        number.UpdatePhoneDetails(req.params.phonenumber,req.params.companyid,req,reqId,res);
        //var jsonString = messageFormatter.FormatMessage(null, "UpdatePhoneDetails Done", true, res);
        //res.end(jsonString);

    }
    catch(ex)
    {
        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [HTTP]  - Exception on Request -  Data - Phone %s Company ',reqId,req.params.phonenumber,req.params.companyid,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});

//.......................................post............................................................................

//check params

server.post('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/PhoneNumberManagement/Category/:phone',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [HTTP]  - Request received -  Data - %s',reqId,JSON.stringify(req));


        number.UpdatePhoneNumberObjCategory(req.params.phone,req,reqId,res);

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [HTTP]  - Exception in Request  -  Data - %s',reqId,JSON.stringify(req),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    return next();
});
//.......................................get............................................................................

//server.get('/DVP/API/' + hostVersion + '/phone_number_trunk_service/phone_number_mgmt/get_all/:CompanyId/:PhoneNumber',function(req,res,next)
server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/PhoneNumberManagement/Details/:PhoneNumber/:CompanyId',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        logger.debug('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [HTTP]  - Request received -  Data - Company %s Phone %s ',reqId,req.params.CompanyId,req.params.PhoneNumber);

        number.GetAllPhoneDetails(req,reqId,res);


    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [HTTP]  - Exception in Request -  Data - Company %s Phone %s ',reqId,req.params.CompanyId,req.params.PhoneNumber,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
return next();
});
//.......................................get............................................................................

server.get('/DVP/API/' + hostVersion + '/PhoneNumberTrunkApi/PhoneNumberManagement/PhonesOfCompany/:CompanyId',function(req,res,next)
{

    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        logger.debug('[DVP-PhoneNumberTrunkService.PhonesOfCompany] - [%s] - [HTTP]  - Request received -  Data - Company %s  ',reqId,req.params.CompanyId);

        number.GetCompanyPhones(req,reqId,res);


    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.PhonesOfCompany] - [%s] - [HTTP]  - Exception in Request received -  Data - Company %s  ',reqId,req.params.CompanyId,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

return next();
});




server.listen(hostPort, hostIp, function () {
    console.log('%s listening at %s', server.name, server.url);
});