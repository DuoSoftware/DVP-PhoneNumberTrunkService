/**
 * Created by pawan on 3/6/2015.
 */

var DbConn = require('./DVP-DBModels');

var stringify=require('stringify');



function ChangeNumberAvailability(req,res,err)
{

    DbConn.TrunkPhoneNumbers.find({ where: [{ PhoneNumber: req.params.phonenumber  },{CompanyId:req.params.CompanyId}]}).complete(function(err, PhnObject) {
        //logger.info( 'Requested RefID: '+reqz.params.ref);
        // console.log(ExtObject);
        if(!PhnObject)
        {
            console.log("No record found for the Phone Number : "+req.params.phonenumber);

            res.end();
        }

        else if(!err ) {
            console.log("Updating Availability for  : "+req.params.phonenumber);
            DbConn.TrunkPhoneNumbers
                .update(
                {
                    Enable: req.body.enable


                },
                {
                    where: [{ PhoneNumber: req.body.phonenumber }]
                }
            ).success(function() {

                    console.log(".......................Successfully Updated. ....................");
                    res.end();

                }).error(function(err) {

                    console.log(".......................Error found in updating .................... ! "+ err);
                    //handle error here
                    res.end();

                });
            res.end();
        }
        else
        {

            res.end();

        }

    });


}


//
function UpdatePhoneDetails(req,res,err)
{


    DbConn.TrunkPhoneNumbers.findAll({ where: [{ CompanyId: req.body.CompanyId  },{PhoneNumber: req.params.PhoneNumber }]}).complete(function(err, ScheduleObject) {
        //logger.info( 'Requested RefID: '+reqz.params.ref);
        // console.log(ExtObject);
        if(!ScheduleObject)
        {
            console.log("Number entered is not belongs CompanyID : "+req.body.CompanyId);

            res.end();
        }

        else if(!err ) {

                    DbConn.TrunkPhoneNumbers
                        .update(
                        {

                            ObjClass:  obj.ObjClass,
                            ObjType:  obj.ObjType,
                            ObjCategory:  obj.ObjCategory



                        },
                        {
                            where: [{ PhoneNumber: req.body.PhoneNumber }]
                        }
                    ).success(function(message) {

                            console.log(".......................Successfully Updated. ....................");
                            console.log("Returned : "+message);
                            res.end();

                        }).error(function(err) {

                            console.log(".......................Error found in updating .................... ! "+ err);
                            //handle error here
                            res.end();

                        });
                    res.end();







            /*
             if(ScheduleObject.ScheduleName.indexOf(req.params.schedulename)>-1)
             {


             DbConn.TrunkPhoneNumbers
             .update(
             {
             ScheduleName: req.params.schedulename


             },
             {
             where: [{ PhoneNumber: req.params.phonenumber }]
             }
             ).success(function() {

             console.log(".......................Successfully Updated. ....................");
             res.end();

             }).error(function(err) {

             console.log(".......................Error found in updating .................... ! "+ err);
             //handle error here
             res.end();

             });
             res.end();

             }
             else
             {
             console.log("Cannot change,This number is not available to your company....");
             }
             */


        }



        else
        {

            res.end();

        }

    });
}

function GetAllPhoneDetails(req,res,err)
{
    DbConn.TrunkPhoneNumbers.findAll({ where: [{ CompanyId: req.params.CompanyId  },{PhoneNumber: req.params.PhoneNumber }]}).complete(function(err, ScheduleObject) {
        //logger.info( 'Requested RefID: '+reqz.params.ref);
        // console.log(ExtObject);
        if(!ScheduleObject)
        {
            console.log("Number entered is not belongs CompanyID : "+req.params.CompanyId);

            res.end();
        }

        else if(!err) {

            console.log("Records Found : ");


            var result=JSON.stringify(ScheduleObject);
            console.log(result);

            res.end();

        }

        else
        {
            res.end();

        }

    });
}

function GetCompanyPhones(req,res,err)
{
    ///DbConn.TrunkPhoneNumbers.findAll({ where: { CompanyId: req.params.CompanyId  },attributes: ['"CSDB_PhoneNumbers"."PhoneNumber"']}).complete(function(err, ScheduleObject) {
    DbConn.TrunkPhoneNumbers.findAll({ where: { CompanyId: req.params.CompanyId  }}).complete(function(err, ScheduleObject) {
        //logger.info( 'Requested RefID: '+reqz.params.ref);
        // console.log(ExtObject);
        if(!ScheduleObject)
        {
            console.log("Number entered is not belongs CompanyID : "+req.params.CompanyId);

            res.end();
        }

        else if(!err) {

            console.log("Records Found : "+req.params.CompanyId);


            var result=JSON.stringify(ScheduleObject);
            console.log(result);

            res.end();


        }

        else
        {
            res.end();

        }

    });
}




module.exports.ChangeNumberAvailability = ChangeNumberAvailability;
module.exports.UpdatePhoneDetails = UpdatePhoneDetails;
module.exports.GetAllPhoneDetails = GetAllPhoneDetails;
module.exports.GetCompanyPhones = GetCompanyPhones;
