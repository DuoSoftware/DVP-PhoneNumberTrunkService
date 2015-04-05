var restify = require('restify');
var messageFormatter = require('./DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logHandler = require('./DVP-Common/LogHandler/CommonLogHandler.js');
var gwBackendHandler = require('./TrunkBackendHandler.js');
var number=require('./PhoneNumberManagement.js');
//var xmlGen = require('./XmlResponseGenerator.js');

var server = restify.createServer({
    name: 'localhost',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


//{"PhoneNumber":"12000", "ObjClass":"CallServer", "ObjType":"TrunkNumber", "ObjCategory":"Inbound", "Enable":true, "CompanyId":1, "TenantId":3}
server.post('/DVP/API/:version/TrunkApi/AddNumber/:id', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var phnInfo = req.body;

        if(phnInfo)
        {
            gwBackendHandler.addPhoneNumbersToTrunk(id, phnInfo, function(err, recordId, result){

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
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});

server.post('/DVP/API/:version/TrunkApi/DeleteNumber/:PhoneNumber/:CompanyId/',function(req, res, next)
{

    try
    {
        var phoneNum = req.params.PhoneNumber;
        var companyId = req.params.CompanyId;

        if (phoneNum && companyId)
        {
            gwBackendHandler.removePhoneNumber(phoneNum, companyId, 0, function (err, result) {

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

server.post('/DVP/API/:version/TrunkApi/BuyNumber/',function(req, res, next)
{

    logHandler.WriteLog('dsddd');
    var phnInfo = req.body;

    if(phnInfo)
    {
        gwBackendHandler.switchPhoneNumberCompany(phnInfo.PhoneNumber, phnInfo.CompanyId, phnInfo.TenantId, phnInfo.companyToChange, phnInfo.tenantToChange, function(err, result){

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
 {"TrunkCode":"TestTrunk","TrunkName":"Test1","ObjClass":"DVP","ObjType":"Trunk","ObjCategory":"SIP","IpUrl":"192.168.1.198","Enable":"True","CompanyId":"1","TenantId":"3","Operator":"Dialog"}
 */
server.post('/DVP/API/:version/TrunkApi/CreateTrunk', function(req, res, next)
{
    try
    {
        var gwInfo = req.body;

        if(gwInfo)
        {
            gwBackendHandler.addTrunkConfiguration(gwInfo, function(err, recordId, result){

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

server.post('/DVP/API/:version/TrunkApi/AddOperator', function(req, res, next)
{
    try
    {
        var opInfo = req.body;

        if(opInfo)
        {
            gwBackendHandler.AddTrunkOperator(opInfo, function(err, recordId, result){

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

server.post('/DVP/API/:version/TrunkApi/UpdateTrunk/:id', function(req, res, next)
{
    try
    {
        var id = req.params.id;
        var gwInfo = req.body;

        if(id && gwInfo)
        {
            gwBackendHandler.updateTrunkConfiguration(id, gwInfo, function(err, result){

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

server.post('/DVP/API/:version/TrunkApi/AssignTrunkToLoadBalancer/:id/:lbId', function(req, res, next)
{
    try
    {
        var trunkId = parseInt(req.params.id);
        var lbId = parseInt(req.params.lbId);

        if(trunkId && lbId)
        {
            gwBackendHandler.AssignTrunkToLoadBalancer(trunkId, lbId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "Load Balancer added successfully", result, null);
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

server.post('/DVP/API/:version/TrunkApi/AssignTrunkToSipProfile/:id/:profId', function(req, res, next)
{
    try
    {
        var trunkId = parseInt(req.params.id);
        var profId = parseInt(req.params.profId);

        if(trunkId && profId)
        {
            gwBackendHandler.AssignTrunkToProfile(trunkId, profId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "Sip Network Profile added successfully", result, null);
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

server.post('/DVP/API/:version/TrunkApi/AssignTrunkTranslation/:id/:transId', function(req, res, next)
{
    try
    {
        var trunkId = parseInt(req.params.id);
        var transId = parseInt(req.params.transId);

        if(trunkId && transId)
        {
            gwBackendHandler.AssignTrunkTranslation(trunkId, transId, function(err, result){

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

server.post('/DVP/API/:version/TrunkApi/AssignOperatorToTrunk/:id/:opId', function(req, res, next)
{
    try
    {
        var trunkId = parseInt(req.params.id);
        var opId = parseInt(req.params.opId);

        if(trunkId && opId)
        {
            gwBackendHandler.AssignOperatorToTrunk(trunkId, opId, function(err, result){

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

server.post('/DVP/API/:version/TrunkApi/SetTrunkAvailability/:id/Enable/:status', function(req, res, next)
{
    try
    {

        var gwId = parseInt(req.params.id);
        var enable = Boolean(req.params.status);

        if(gwId)
        {
            gwBackendHandler.setTrunkEnabledStatus(gwId, enable, function(err, result)
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

server.post('/DVP/API/:version/TrunkApi/GetTrunk/:id', function(req, res, next)
{

    try
    {
        var trunkId = parseInt(req.params.id);

        if(trunkId)
        {
            gwBackendHandler.getTrunkById(trunkId, function(err, result){

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
        return next();
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, -1);
        res.end(jsonString);
    }

    return next();

});




//PAWAN :- Messageformatter and try catch Done

//.......................................post............................................................................

server.post('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/chng_availability/:phonenumber/:companyid/:enable',function(req,res,next)
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

server.post('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/update_phone_schedule/:companyid/:phonenumber',function(req,res,next)
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

server.post('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/Update_category',function(req,res,next)
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

server.get('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/get_all/:CompanyId/:PhoneNumber',function(req,res,next)
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

server.get('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/get_phone/:CompanyId',function(req,res,next)
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




server.listen(9093, 'localhost', function () {
    console.log('%s listening at %s', server.name, server.url);
});