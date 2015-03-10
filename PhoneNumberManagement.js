/**
 * Created by pawan on 3/6/2015.
 */

var DbConn = require('./DVP-DBModels');

var stringify=require('stringify');
var messageFormatter = require('./DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');



function ChangeNumberAvailability(req,res,err) {

    try
    {
        DbConn.TrunkPhoneNumbers.find({where: [{PhoneNumber: req.params.phonenumber}, {CompanyId: req.params.CompanyId}]}).complete(function (err, PhnObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!PhnObject) {
                console.log("No record found for the Phone Number : " + req.params.phonenumber);

                var jsonString = messageFormatter.FormatMessage(err, "EMPTY", false, PhnObject);
                res.end(jsonString);
            }

            else if (!err) {
                console.log("Updating Availability for  : " + req.params.phonenumber);
                try {
                    DbConn.TrunkPhoneNumbers
                        .update(
                        {
                            Enable: req.body.enable


                        },
                        {
                            where: [{PhoneNumber: req.body.phonenumber}]
                        }
                    ).success(function (err,result) {

                            console.log(".......................Successfully Updated. ....................");
                            var jsonString = messageFormatter.FormatMessage(err, "SUCCESS", true, result);
                            res.end(jsonString);

                        }).error(function (err) {

                            console.log(".......................Error found in updating .................... ! " + err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                            res.end(jsonString);

                        });
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, result);
                    res.end(jsonString);
                }

            }
            else {

                var jsonString = messageFormatter.FormatMessage(err, "EMPTY", false, result);
                res.end(jsonString);

            }

        });

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, req);
        res.end(jsonString);
    }
}


//
function UpdatePhoneDetails(req,res,err) {
    try{

        DbConn.TrunkPhoneNumbers.findAll({where: [{CompanyId: req.body.CompanyId}, {PhoneNumber: req.params.PhoneNumber}]}).complete(function (err, ScheduleObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!ScheduleObject) {
                console.log("Number entered is not belongs CompanyID : " + req.body.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "EMPTY", true, null);
                res.end(jsonString);
            }

            else if (!err) {

                try {

                    DbConn.TrunkPhoneNumbers
                        .update(
                        {

                            ObjClass: obj.ObjClass,
                            ObjType: obj.ObjType,
                            ObjCategory: obj.ObjCategory


                        },
                        {
                            where: [{PhoneNumber: req.body.PhoneNumber}]
                        }
                    ).success(function (message) {

                            console.log(".......................Successfully Updated. ....................");
                            console.log("Returned : " + message);
                            var jsonString = messageFormatter.FormatMessage(err, "SUCCESS", true, message);
                            res.end(jsonString);

                        }).error(function (err) {

                            console.log(".......................Error found in updating .................... ! " + err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "ERROR", true, message);
                            res.end(jsonString);

                        });
                    res.end();


                }catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, result);
                    res.end(jsonString);
                }


            }


            else {

                res.end();

            }

        });
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, req);
        res.end(jsonString);
    }
}

function GetAllPhoneDetails(req,res,err)
{
    try {
        DbConn.TrunkPhoneNumbers.findAll({where: [{CompanyId: req.params.CompanyId}, {PhoneNumber: req.params.PhoneNumber}]}).complete(function (err, ScheduleObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!ScheduleObject && !err) {
                console.log("Number entered is not belongs CompanyID : " + req.params.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "EMPTY", false, ScheduleObject);
                res.end(jsonString);
            }

            else if (!err && ScheduleObject.length>0) {

                console.log("Records Found : ");


                var jsonString = messageFormatter.FormatMessage(err, "SUCCESS", true, ScheduleObject);
                res.end(jsonString);
            }
            else if (!err && ScheduleObject.length==0) {

                console.log("Empty Found : ");


                var jsonString = messageFormatter.FormatMessage(err, "EMPTY", true, ScheduleObject);
                res.end(jsonString);
            }


            else if(err) {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, ScheduleObject);
                res.end(jsonString);

            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, ScheduleObject);
                res.end(jsonString);
            }

        });
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, req);
        res.end(jsonString);
    }
}

function GetCompanyPhones(req,res,err)
{
    try {
        DbConn.TrunkPhoneNumbers.findAll({where: {CompanyId: req.params.CompanyId}}).complete(function (err, ScheduleObject) {

            if (ScheduleObject>0 && !err) {
                console.log("Number entered is not belongs CompanyID : " + req.params.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "SUCCESS", true, ScheduleObject);
                res.end(jsonString);
            }


            else if (!err && ScheduleObject.length==0) {

                console.log("Empty Found : ");


                var jsonString = messageFormatter.FormatMessage(err, "EMPTY", true, ScheduleObject);
                res.end(jsonString);
            }



            else  {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, ScheduleObject);
                res.end(jsonString);

            }

        });
    }catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "ERROR", false, req);
        res.end(jsonString);
    }
}




module.exports.ChangeNumberAvailability = ChangeNumberAvailability;
module.exports.UpdatePhoneDetails = UpdatePhoneDetails;
module.exports.GetAllPhoneDetails = GetAllPhoneDetails;
module.exports.GetCompanyPhones = GetCompanyPhones;
