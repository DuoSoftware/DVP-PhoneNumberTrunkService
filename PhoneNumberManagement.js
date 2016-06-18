/**
 * Created by pawan on 3/6/2015.
 */

var DbConn = require('dvp-dbmodels');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var log4js=require('log4js');
var config=require('config');
var hpath=config.Host.hostpath;
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;


log4js.configure(config.Host.logfilepath, { cwd: hpath });
var log = log4js.getLogger("pnum");



//MF and TC done

log.info("Phone number management starts........");
function ChangeNumberAvailability(req,Company,Tenant,reqId,res) {



    try
    {

        DbConn.TrunkPhoneNumber.find({where: [{PhoneNumber: req.params.phonenumber}, {CompanyId:Company },{TenantId:Tenant}]}).then(function (resTPhone) {

            if(resTPhone)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - Record found for Phone Number %s  ',reqId,req.params.phonenumber);
                try {
                    DbConn.TrunkPhoneNumber
                        .update(
                        {
                            Enable: req.params.enable


                        },
                        {
                            where: [{PhoneNumber: req.params.phonenumber}]
                        }
                    ).then(function (resUpdate) {

                            logger.debug('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - Availability updated of Phone Number %s to %s is succeeded ',reqId,req.params.phonenumber,req.params.enable);
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resUpdate);
                            res.end(jsonString);

                        }).error(function (errUpdate) {

                            logger.error('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - Availability updated of Phone Number %s to %s is failed ',reqId,req.params.phonenumber,req.params.enable,errUpdate);
                            var jsonString = messageFormatter.FormatMessage(errUpdate, "ERROR/EXCEPTION", false, undefined);
                            res.end(jsonString);

                        });
                }
                catch(ex)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - Exception in updating Availability of  %s ',reqId,req.params.phonenumber,ex);
                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
            }
            else
            {
                logger.error('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - No record found for Phone Number %s  ',reqId,req.params.phonenumber,errTPhone);

                var jsonString = messageFormatter.FormatMessage(new Error("No TrunkPhoneNumber Record found"), "ERROR", false, undefined);
                res.end(jsonString);
            }
        }).catch(function (errTPhone) {
            logger.error('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - Error in updating Availability of  %s ',reqId,req.params.phonenumber,errTPhone);
            var jsonString = messageFormatter.FormatMessage(errTPhone, "ERROR", false, undefined);
            res.end(jsonString);
        });




    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.ChangeNumberAvailability] - [%s] - [PGSQL]  - Exception in Method starting : ChangeNumberAvailability  %s ',reqId,req.params.phonenumber,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }
}


//MF and TC done
function UpdatePhoneDetails(Company,Phone,req,reqId,res) {

    if(Phone)
    {
        try{

            DbConn.TrunkPhoneNumber.findAll({where: [{CompanyId: Company}, {PhoneNumber: Phone}]}).then(function (resTPhone) {

                if(resTPhone)
                {
                    logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Phone % is belongs to Company %s ',reqId,Phone,Company);
                    try {

                        DbConn.TrunkPhoneNumber
                            .update(
                            {

                                ObjClass: req.body.ObjClass,
                                ObjType: req.body.ObjType,
                                ObjCategory: req.body.ObjCategory


                            },
                            {
                                where: [{PhoneNumber: Phone},{CompanyId:Company}]
                            }
                        ).then(function (resUpdate) {
                                logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Trunk phone number updated successfully',reqId);
                                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resUpdate);
                                res.end(jsonString);
                            }).catch(function (errUpdate) {
                                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Trunk phone number updation failed',reqId,errUpdate);

                                var jsonString = messageFormatter.FormatMessage(errUpdate, "EXCEPTION/ERROR", false, undefined);
                                res.end(jsonString);
                            });


                    }
                    catch(ex)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Exception in Trunk phone number updation ',reqId,ex);
                        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                }
                else
                {
                    logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Phone % is not belongs to Company %s ',reqId,Phone,Company);

                    var jsonString = messageFormatter.FormatMessage(new Error("EMPTY"), "ERROR/EXCEPTION", false, undefined);
                    res.end(jsonString);
                }

            }).catch(function (errTPhone) {
                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Error in searching Phone number %s of Company %s',reqId,Phone,Company,errTPhone);
                var jsonString = messageFormatter.FormatMessage(errTPhone, "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);
            });





        }
        catch(ex)
        {
            logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - [PGSQL]  - Exception found in searching TrunkPhoneNumber Phone %s Company %s ',reqId,Phone,Company,ex);
            var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }
    else
    {
        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneDetails] - [%s] - Invalid Number %s ',reqId,Phone);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

}

//MF and TC done
function GetAllPhoneDetails(Company,req,reqId,res)
{
    if(req.params.PhoneNumber)
    {
        try {
            DbConn.TrunkPhoneNumber.find({where: [{CompanyId: Company}, {PhoneNumber: req.params.PhoneNumber}]}).then(function (resTPhone) {

                if(resTPhone)
                {

                    logger.debug('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - [PGSQL]  - Phone %s is belongs to company %s and Records found ',reqId,req.params.PhoneNumber,Company,resTPhone);


                    var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resTPhone);
                    res.end(jsonString);
                }
                else
                {
                    logger.error('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - [PGSQL]  - Phone %s is not belongs to company %s ',reqId,req.params.PhoneNumber,Company);

                    var jsonString = messageFormatter.FormatMessage(new Error("No phonenumber found"), "EXCEPTION/ERROR", false, undefined);
                    res.end(jsonString);
                }

            }).catch(function (errTPhone) {

                logger.error('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - [PGSQL]  - Error in searching Phone %s of company %s',reqId,req.params.PhoneNumber,Company,errTPhone);
                var jsonString = messageFormatter.FormatMessage(errTPhone, "EXCEPTION/ERROR", false, undefined);
                res.end(jsonString);

            });


        }
        catch(ex)
        {
            logger.error('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - [PGSQL]  - Exception in starting method :GetAllPhoneDetails Data Phone %s Company %s ',reqId,req.params.PhoneNumber,Company,ex);
            var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }
    else
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetAllPhoneDetails] - [%s] - Invalid Phone ',reqId,req.params.PhoneNumber);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

}

//MF and TC done
function GetCompanyPhones(Company,reqId,res)
{
    var emptyArr = [];


    try {
        DbConn.TrunkPhoneNumber.findAll({where: {CompanyId: Company}}).then(function (resTPhone) {

            if(resTPhone.length>0)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetCompanyPhones] - [%s] - [PGSQL]  - Phones found for company %s   ',reqId,Company);

                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resTPhone);
                res.end(jsonString);
            }
            else
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetCompanyPhones] - [%s] - [PGSQL]  - No Phones found for company %s   ',reqId,Company);
                var jsonString = messageFormatter.FormatMessage(null, "SUCCESS", true, emptyArr);
                res.end(jsonString);
            }

        }).catch(function (errTPhone) {

            logger.error('[DVP-PhoneNumberTrunkService.GetCompanyPhones] - [%s] - [PGSQL]  - Error in searchnig trunk numbers   ',reqId,errTPhone);

            var jsonString = messageFormatter.FormatMessage(errTPhone, "ERROR", false, undefined);
            res.end(jsonString);

        });


    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetCompanyPhones] - [%s] - [PGSQL]  - Exception in starting method : GetCompanyPhones  - Data  %s   ',reqId,Company,ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception", false, undefineds);
        res.end(jsonString);
    }
}

function UpdatePhoneNumberObjCategory(Company,Phone,req,reqId,res)
{

    if(Phone)
    {
        try{

            DbConn.TrunkPhoneNumber.find({where: [{CompanyId: Company}, {PhoneNumber: Phone}]}).then(function (resTPhone) {

                if(resTPhone)
                {
                    try {
                        logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Phone %s is belongs to Company %s ',reqId,Phone,Company);
                        DbConn.TrunkPhoneNumber
                            .update(
                            {


                                ObjCategory: req.body.ObjCategory


                            },
                            {
                                where: [{PhoneNumber: Phone},{CompanyId:Company}]
                            }
                        ).then(function (message) {
                                logger.debug('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Category is updated to %s of Phone %s  belongs to Company %s is succeeded ',reqId,req.body.ObjCategory,Phone,Company);
                                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, message);
                                res.end(jsonString);
                            }).catch(function (err) {
                                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Category is updated to %s of Phone %s  belongs to Company %s is failed ',reqId,req.body.ObjCategory,Phone,Company,err);
                                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                                res.end(jsonString);
                            });


                    }
                    catch(ex)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Exception happens in updating Phone number %s of Company %s',reqId,Phone,Company,ex);
                        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                }
                else
                {
                    logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Phone %s is not belongs to Company %s ',reqId,Phone,Company);

                    var jsonString = messageFormatter.FormatMessage(new Error("No Phone number found"), "EXCEPTION/ERROR", false, undefined);
                    res.end(jsonString);
                }

            }).catch(function (errTPhone) {
                logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Error in searching Phone number %s of Company %s',reqId,Phone,Company,errTPhone);
                var jsonString = messageFormatter.FormatMessage(errTPhone, "EXCEPTION", false, undefined);
                res.end(jsonString);
            });




        }
        catch(ex)
        {
            logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - [PGSQL]  - Exception in starting method: UpdatePhoneNumberObjCategory - Data  Phone number %s of Company %s',reqId,Phone,Company,ex);
            var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
            res.end(jsonString);
        }
    }
    else
    {
        logger.error('[DVP-PhoneNumberTrunkService.UpdatePhoneNumberCategory] - [%s] - Invalid Phone %s',reqId,Phone);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

}



module.exports.ChangeNumberAvailability = ChangeNumberAvailability;
module.exports.UpdatePhoneDetails = UpdatePhoneDetails;
module.exports.GetAllPhoneDetails = GetAllPhoneDetails;
module.exports.GetCompanyPhones = GetCompanyPhones;
module.exports.UpdatePhoneNumberObjCategory = UpdatePhoneNumberObjCategory;
