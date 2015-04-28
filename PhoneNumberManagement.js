/**
 * Created by pawan on 3/6/2015.
 */

var DbConn = require('DVP-DBModels');

var stringify=require('stringify');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var log4js=require('log4js');
var config=require('config');


log4js.configure(config.Host.logfilepath, { cwd: hpath });
var log = log4js.getLogger("pnum");



//MF and TC done

log.info("Phone number management starts........");
function ChangeNumberAvailability(req,res) {

    log.info(" Change Number Availability starts.");

    try
    {
        log.info("Inputs :- "+JSON.stringify(req));
        DbConn.TrunkPhoneNumber.find({where: [{PhoneNumber: req.params.phonenumber}, {CompanyId: req.params.companyid}]}).complete(function (err, PhnObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!PhnObject) {

                log.error("No record found.......");
                console.log("No record found for the Phone Number : " + req.params.phonenumber);

                var jsonString = messageFormatter.FormatMessage(err, "null object found searching : "+req.params.CompanyId, false, PhnObject);
                res.end(jsonString);
            }

            else if (!err && PhnObject) {
                console.log("Updating Availability for  : " + req.params.phonenumber);
                try {
                    DbConn.TrunkPhoneNumber
                        .update(
                        {
                            Enable: req.params.enable


                        },
                        {
                            where: [{PhoneNumber: req.params.phonenumber}]
                        }
                    ).success(function (err,result) {

                            console.log(".......................Successfully Updated. ....................");
                            var jsonString = messageFormatter.FormatMessage(err, "Updation succeeded", true, result);
                            res.end(jsonString);

                        }).error(function (err) {

                            console.log(".......................Error found in updating .................... ! " + err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "Error found in updation", false, result);
                            res.end(jsonString);

                        });
                }
                catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(ex, "Exception found in Updation ", false, result);
                    res.end(jsonString);
                }

            }
            else {

                var jsonString = messageFormatter.FormatMessage(err, "Error occures in updation", false, result);
                res.end(jsonString);

            }

        });

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception found in searching TrunkPhoneNumber ", false, req);
        res.end(jsonString);
    }
}


//MF and TC done
function UpdatePhoneDetails(req,res) {
    try{

        DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: req.body.CompanyId}, {PhoneNumber: req.params.PhoneNumber}]}).complete(function (err, ScheduleObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!ScheduleObject) {
                console.log("Number entered is not belongs CompanyID : " + req.body.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "Null object returns while searching phonenumber and company", false, null);
                res.end(jsonString);
            }

            else if (!err && ScheduleObject) {

                try {

                    DbConn.TrunkPhoneNumber
                        .update(
                        {

                            ObjClass: req.body.ObjClass,
                            ObjType: req.body.ObjType,
                            ObjCategory: req.body.ObjCategory


                        },
                        {
                            where: [{PhoneNumber: req.params.phonenumber},{CompanyId:req.params.companyid}]
                        }
                    ).success(function (message) {

                            console.log(".......................Successfully Updated. ....................");
                            console.log("Returned : " + message);
                            var jsonString = messageFormatter.FormatMessage(err, "Successfully updated", true, null);
                            res.end(jsonString);

                        }).error(function (err) {

                            console.log(".......................Error found in updating .................... ! " + err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "Error found in updating TrunkPhoneNumber details", false, null);
                            res.end(jsonString);

                        });
                    //res.end();


                }catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Exception found in updating TrunkPhoneNumber ", false, result);
                    res.end(jsonString);
                }


            }


            else {
                var jsonString = messageFormatter.FormatMessage(err, "Error Occured in searching phone number : "+req.params.PhoneNumber, false, null);
                res.end(jsonString);


            }

        });
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception found in searching TrunkPhoneNumber", false, req);
        res.end(jsonString);
    }
}

//MF and TC done
function GetAllPhoneDetails(req,res)
{
    try {
        DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: req.params.CompanyId}, {PhoneNumber: req.params.PhoneNumber}]}).complete(function (err, ScheduleObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!ScheduleObject && !err) {
                console.log("Number entered is not belongs CompanyID : " + req.params.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "null object returned as result in serching : "+req.params.PhoneNumber, false, ScheduleObject);
                res.end(jsonString);
            }

            else if (!err && ScheduleObject.length>0) {

                var Jresults = JSON.stringify(ScheduleObject);
                console.log("Records Found : "+ScheduleObject);


                var jsonString = messageFormatter.FormatMessage(err, "Record Found : "+req.params.PhoneNumber + "and "+req.params.CompanyId, true, Jresults);
                res.end(jsonString);
            }
            else if (!err && ScheduleObject.length==0) {

                console.log("Empty Found : ");


                var jsonString = messageFormatter.FormatMessage(err, "Empty object returned : No record : No Error", false, ScheduleObject);
                res.end(jsonString);
            }


            else if(err) {
                var jsonString = messageFormatter.FormatMessage(err, "Error found in searching", false, ScheduleObject);
                res.end(jsonString);

            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(err, "Error found", false, ScheduleObject);
                res.end(jsonString);
            }

        });
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception found in searching", false, req);
        res.end(jsonString);
    }
}

//MF and TC done
function GetCompanyPhones(req,res)
{
    try {
        DbConn.TrunkPhoneNumber.findAll({where: {CompanyId: req.params.CompanyId}}).complete(function (err, ScheduleObject) {

            if (ScheduleObject.length>0 && !err) {
                console.log("Records found for CompanyID : " + req.params.CompanyId);

                var Jresults = JSON.stringify(ScheduleObject);
                var jsonString = messageFormatter.FormatMessage(err, ScheduleObject.length +"Records found", true, Jresults);
                res.end(jsonString);
            }


            else if (!err && ScheduleObject.length==0) {

                console.log("Empty Found : ");


                var jsonString = messageFormatter.FormatMessage(err, "Empty object returned : No errors", false, ScheduleObject);
                res.end(jsonString);
            }



            else  {
                var jsonString = messageFormatter.FormatMessage(err, "Some error occured", false, ScheduleObject);
                res.end(jsonString);

            }

        });
    }catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception found in searching ", false, req);
        res.end(jsonString);
    }
}

function UpdatePhoneNumberObjCategory(req,res)
{
    try{

        DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: req.body.CompanyId}, {PhoneNumber: req.params.PhoneNumber}]}).complete(function (err, TrunkObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!TrunkObject) {
                console.log("Number entered is not belongs CompanyID : " + req.body.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "Null object returns while searching phonenumber and company", false, null);
                res.end(jsonString);
            }

            else if (!err && TrunkObject) {

                try {

                    DbConn.TrunkPhoneNumber
                        .update(
                        {


                            ObjCategory: req.body.ObjCategory


                        },
                        {
                            where: [{PhoneNumber: req.params.phonenumber},{CompanyId:req.params.companyid}]
                        }
                    ).success(function (message) {

                            console.log(".......................Successfully Updated. ....................");
                            console.log("Returned : " + message);
                            var jsonString = messageFormatter.FormatMessage(err, "Successfully updated", true, null);
                            res.end(jsonString);

                        }).error(function (err) {

                            console.log(".......................Error found in updating .................... ! " + err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "Error found in updating TrunkPhoneNumber details", false, null);
                            res.end(jsonString);

                        });
                    //res.end();


                }catch(ex)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Exception found in updating TrunkPhoneNumber ", false, result);
                    res.end(jsonString);
                }


            }


            else {
                var jsonString = messageFormatter.FormatMessage(err, "Error Occured in searching phone number : "+req.params.PhoneNumber, false, null);
                res.end(jsonString);


            }

        });
    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception found in searching TrunkPhoneNumber", false, req);
        res.end(jsonString);
    }
}



module.exports.ChangeNumberAvailability = ChangeNumberAvailability;
module.exports.UpdatePhoneDetails = UpdatePhoneDetails;
module.exports.GetAllPhoneDetails = GetAllPhoneDetails;
module.exports.GetCompanyPhones = GetCompanyPhones;
module.exports.UpdatePhoneNumberObjCategory = UpdatePhoneNumberObjCategory;
