/**
 * Created by pawan on 3/6/2015.
 */

var DbConn = require('DVP-DBModels');

var stringify=require('stringify');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var log4js=require('log4js');
var config=require('config');
var hpath=config.Host.hostpath;


log4js.configure(config.Host.logfilepath, { cwd: hpath });
var log = log4js.getLogger("pnum");



//MF and TC done

log.info("Phone number management starts........");
function ChangeNumberAvailability(req,reqId,res) {

    //log.info(" Change Number Availability starts.");

    try
    {
        //log.info("Inputs :- "+JSON.stringify(req));
        DbConn.TrunkPhoneNumber.find({where: [{PhoneNumber: req.params.phonenumber}, {CompanyId: req.params.companyid}]}).complete(function (err, PhnObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!PhnObject) {

                logger.error('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - No record found for Phone Number %s  ',reqId,req.params.phonenumber,err);
                console.log("No record found for the Phone Number : " + req.params.phonenumber);

                var jsonString = messageFormatter.FormatMessage("EMPTY", "NO Phone number record found", false, undefined);
                res.end(jsonString);
            }

            else if (!err && PhnObject) {
                //console.log("Updating Availability for  : " + req.params.phonenumber);
                logger.debug('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - Record found for Phone Number %s  ',reqId,req.params.phonenumber);
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

                            //console.log(".......................Successfully Updated. ....................");
                            logger.debug('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - Availability updated of Phone Number %s to %s is succeeded ',reqId,req.params.phonenumber,req.params.enable);
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, result);
                            res.end(jsonString);

                        }).error(function (err) {

                            logger.error('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - Availability updated of Phone Number %s to %s is failed ',reqId,req.params.phonenumber,req.params.enable,err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, result);
                            res.end(jsonString);

                        });
                }
                catch(ex)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - Exception in updating Availability of  %s ',reqId,req.params.phonenumber,ex);
                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }

            }
            else {

                logger.error('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - Error in updating Availability of  %s ',reqId,req.params.phonenumber,err);
                var jsonString = messageFormatter.FormatMessage(err, "ERROR", false, undefined);
                res.end(jsonString);

            }

        });

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AvailabilityUpdate] - [%s] - [PGSQL]  - Exception in Method starting : ChangeNumberAvailability  %s ',reqId,req.params.phonenumber,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
}


//MF and TC done
function UpdatePhoneDetails(Comp,Phone,req,reqId,res) {
    try{

        DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: Comp}, {PhoneNumber: Phone}]}).complete(function (err, PhoneObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!PhoneObject) {
                //console.log("Number entered is not belongs CompanyID : " + req.body.CompanyId);
                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Phone % is not belongs to Company %s ',reqId,Phone,Comp);

                var jsonString = messageFormatter.FormatMessage("EMPTY", "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }

            else if (!err && PhoneObject) {
                logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Phone % is belongs to Company %s ',reqId,Phone,Comp);
                try {

                    DbConn.TrunkPhoneNumber
                        .update(
                        {

                            ObjClass: req.body.ObjClass,
                            ObjType: req.body.ObjType,
                            ObjCategory: req.body.ObjCategory


                        },
                        {
                            where: [{PhoneNumber: Phone},{CompanyId:Comp}]
                        }
                    ).success(function (message) {

                            //console.log(".......................Successfully Updated. ....................");
                            //console.log("Returned : " + message);
                            logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Trunk phone number updated successfully',reqId);
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, message);
                            res.end(jsonString);

                        }).error(function (err) {

                            //console.log(".......................Error found in updating .................... ! " + err);
                            logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Trunk phone number updation failed',reqId,err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION/ERROR", false, undefined);
                            res.end(jsonString);

                        });
                    //res.end();


                }
                catch(ex)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Exception in Trunk phone number updation ',reqId,ex);
                    var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }


            }


            else {
                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Error in searching Phone number %s of Company %s',reqId,Phone,Comp,err);
                var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);


            }

        });
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Exception found in searching TrunkPhoneNumber Phone %s Company %s ',reqId,Phone,Comp,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
}

//MF and TC done
function GetAllPhoneDetails(req,reqId,res)
{
    try {
        DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: req.params.CompanyId}, {PhoneNumber: req.params.PhoneNumber}]}).complete(function (err, ScheduleObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!ScheduleObject && !err) {
                //console.log("Number entered is not belongs CompanyID : " + req.params.CompanyId);
                logger.error('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [PGSQL]  - Phone %s is not belongs to company %s ',reqId,req.params.PhoneNumber,req.params.CompanyId);

                var jsonString = messageFormatter.FormatMessage("EMPTY", "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);
            }

            else if (!err && ScheduleObject.length>0) {

                var Jresults = JSON.stringify(ScheduleObject);
                logger.debug('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [PGSQL]  - Phone %s is belongs to company %s and Records found %s',reqId,req.params.PhoneNumber,req.params.CompanyId,Jresults);


                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, Jresults);
                res.end(jsonString);
            }
            else if (!err && ScheduleObject.length==0) {

                logger.debug('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [PGSQL]  - Phone %s is belongs to company %s and No Records found ',reqId,req.params.PhoneNumber,req.params.CompanyId);


                var jsonString = messageFormatter.FormatMessage("EMPTY", "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);
            }


            else if(err) {
                logger.error('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [PGSQL]  - Error in searching Phone %s of company %s',reqId,req.params.PhoneNumber,req.params.CompanyId,err);
                var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);

            }


        });
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AllPhoneDetails] - [%s] - [PGSQL]  - Exception in starting method :GetAllPhoneDetails Data Phone %s Company %s ',reqId,req.params.PhoneNumber,req.params.CompanyId,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
}

//MF and TC done
function GetCompanyPhones(req,reqId,res)
{
    try {
        DbConn.TrunkPhoneNumber.findAll({where: {CompanyId: req.params.CompanyId}}).complete(function (err, ScheduleObject) {

            if (ScheduleObject.length>0 && !err) {
                //console.log("Records found for CompanyID : " + req.params.CompanyId);
                logger.debug('[DVP-PhoneNumberTrunkService.PhonesOfCompany] - [%s] - [PGSQL]  - Phones found for company %s   ',reqId,req.params.CompanyId);

                var Jresults = JSON.stringify(ScheduleObject);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, Jresults);
                res.end(jsonString);
            }


            else if (!err && ScheduleObject.length==0) {

                logger.error('[DVP-PhoneNumberTrunkService.PhonesOfCompany] - [%s] - [PGSQL]  - No Phones found for company %s   ',reqId,req.params.CompanyId);


                var jsonString = messageFormatter.FormatMessage("EMPTY", "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }



            else  {
                logger.error('[DVP-PhoneNumberTrunkService.PhonesOfCompany] - [%s] - [PGSQL]  - Error in searching Phones of company %s   ',reqId,req.params.CompanyId,err);
                var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                res.end(jsonString);

            }

        });
    }catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.PhonesOfCompany] - [%s] - [PGSQL]  - Exception in starting method : GetCompanyPhones  - Data  %s   ',reqId,req.params.CompanyId,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception", false, undefineds);
        res.end(jsonString);
    }
}

function UpdatePhoneNumberObjCategory(Phone,req,reqId,res)
{
    try{

        DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: req.body.CompanyId}, {PhoneNumber: Phone}]}).complete(function (err, TrunkObject) {
            //logger.info( 'Requested RefID: '+reqz.params.ref);
            // console.log(ExtObject);
            if (!TrunkObject) {
                //console.log("Number entered is not belongs CompanyID : " + req.body.CompanyId);
                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Phone %s is not belongs to Company %s ',reqId,Phone,req.body.CompanyId);

                var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);
            }

            else if (!err && TrunkObject) {

                try {
                    logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Phone %s is belongs to Company %s ',reqId,req.params.PhoneNumber,req.body.CompanyId);
                    DbConn.TrunkPhoneNumber
                        .update(
                        {


                            ObjCategory: req.body.ObjCategory


                        },
                        {
                            where: [{PhoneNumber: req.body.phonenumber},{CompanyId:req.body.companyid}]
                        }
                    ).success(function (message) {

                            //console.log(".......................Successfully Updated. ....................");
                            //console.log("Returned : " + message);
                            logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Category is updated to %s of Phone %s  belongs to Company %s is succeeded ',reqId,req.body.ObjCategory,req.body.PhoneNumber,req.body.CompanyId);
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, message);
                            res.end(jsonString);

                        }).error(function (err) {

                            //console.log(".......................Error found in updating .................... ! " + err);
                            logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Category is updated to %s of Phone %s  belongs to Company %s is failed ',reqId,req.body.ObjCategory,req.body.PhoneNumber,req.body.CompanyId,err);
                            //handle error here
                            var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                            res.end(jsonString);

                        });
                    //res.end();


                }
                catch(ex)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Exception happens in updating Phone number %s of Company %s',reqId,req.body.PhoneNumber,req.body.CompanyId,ex);
                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }


            }


            else {
                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Error in searching Phone number %s of Company %s',reqId,Phone,req.body.CompanyId,err);
                var jsonString = messageFormatter.FormatMessage(err, "EXCEPTION", false, undefined);
                res.end(jsonString);


            }

        });
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Exception in starting method: UpdatePhoneNumberObjCategory - Data  Phone number %s of Company %s',reqId,Phone,req.body.CompanyId,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
}



module.exports.ChangeNumberAvailability = ChangeNumberAvailability;
module.exports.UpdatePhoneDetails = UpdatePhoneDetails;
module.exports.GetAllPhoneDetails = GetAllPhoneDetails;
module.exports.GetCompanyPhones = GetCompanyPhones;
module.exports.UpdatePhoneNumberObjCategory = UpdatePhoneNumberObjCategory;
