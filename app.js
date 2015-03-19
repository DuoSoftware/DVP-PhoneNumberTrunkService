var restify = require('restify');
var messageFormatter = require('./DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
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

server.post('/DVP/API/:version/TrunkApi/AssignCloudToTrunk/:id/Cloud/:cloudId', function(req, res, next)
{
    try
    {
        var trunkId = parseInt(req.params.id);
        var cloudId = parseInt(req.params.cloudId);

        if(trunkId && cloudId)
        {
            gwBackendHandler.assignTrunkToCloud(trunkId, cloudId, function(err, result){

                try
                {
                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, null);
                        res.end(jsonString);
                    }
                    else
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "Cloud added successfully", result, null);
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
            throw new Error("Invalid trunk id or cloud id provided");
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

server.post('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/chng_availability/:phonenumber/:companyid/:enable',function(req,res,err)
{
    try {

        number.ChangeNumberAvailability(req, res, err);

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ChangeNumberAvailability failed", false, null);
        res.end(jsonString);
    }

});

//.......................................post............................................................................

server.post('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/update_phone_schedule/:companyid/:phonenumber',function(req,res,err)
{
    try {
        number.UpdatePhoneDetails(req, res, err);
        //var jsonString = messageFormatter.FormatMessage(null, "UpdatePhoneDetails Done", true, res);
        //res.end(jsonString);

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "UpdatePhoneDetails failed", false, res);
        res.end(jsonString);
    }

});
//.......................................get............................................................................

server.get('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/get_all/:CompanyId/:PhoneNumber',function(req,res,err)
{


    try {
        number.GetAllPhoneDetails(req,res,err);


    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "GetAllPhoneDetails failed", false, res);
        res.end(jsonString);
    }

});
//.......................................get............................................................................

server.get('/dvp/:version/phone_number_trunk_service/phone_number_mgmt/get_phone/:CompanyId',function(req,res,err)
{

    try {
        number.GetCompanyPhones(req,res,err);


    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "GetCompanyPhones failed", false, res);
        res.end(jsonString);
    }


});




server.listen(9093, 'localhost', function () {
    console.log('%s listening at %s', server.name, server.url);
});