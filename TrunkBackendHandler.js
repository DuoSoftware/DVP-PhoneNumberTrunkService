var dbModel = require('DVP-DBModels');
var underscore = require('underscore');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
//var getGrpUsersById = function(grpId, callback)
//{
//    try
//    {
//        dbModel.UserGroup.find({ where: {id:grpId}, attributes: ['id'], include: [{model : dbModel.SipUACEndpoint, attributes:['id'], joinTableAttributes : ['createdAt']}]}).complete(function(err, trunkObj)
//        {
//            try
//            {
//                callback(err, trunkObj);
//            }
//            catch(ex)
//            {
//                callback(ex, undefined);
//            }
//        })
//    }
//    catch(ex)
//    {
//        callback(ex, false);
//    }
//};

var switchPhoneNumberCompany = function(reqId, phoneNumber, companyId, tenantId, companyToChange, tenantToChange, callback)
{
    try
    {

        dbModel.TrunkPhoneNumber.find({ where: [{PhoneNumber: phoneNumber }, { CompanyId: companyId}]}).complete(function(err, phnNumInfo)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.switchPhoneNumberCompany] - [%s] - PGSQL query failed', reqId, err);

                callback(err, false);
            }
            else if(phnNumInfo)
            {
                //update
                logger.debug('[DVP-PhoneNumberTrunkService.switchPhoneNumberCompany] - [%s] - PGSQL query success', reqId);
                phnNumInfo.updateAttributes({CompanyId: companyToChange, TenantId: tenantToChange}).complete(function (err) {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.switchPhoneNumberCompany] - [%s] - PGSQL query failed', reqId, err);

                        callback(err, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.switchPhoneNumberCompany] - [%s] - PGSQL query success', reqId);

                        callback(undefined, true);
                    }
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.switchPhoneNumberCompany] - [%s] - PGSQL query success', reqId);
                callback(new Error("Unable to find a phone number registered to given company"), false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
}

var getTrunkById = function(reqId, trunkId, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: trunkId }]}).complete(function(err, trunkObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.getTrunkById] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.getTrunkById] - [%s] - PGSQL query success', reqId);
            }

            callback(err, trunkObj);
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var GetCallServerByProfileId = function(reqId, profileId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where :[{id: profileId}], include: [{model: dbModel.CallServer, as: "CallServer"}]}).complete(function(err, csObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetCallServerByProfileId] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServerByProfileId] - [%s] - PGSQL query success', reqId);
            }

            callback(err, csObj);
        })
    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var GetCallServersRelatedToLoadBalancer = function(reqId, lbId, callback)
{
    try
    {
        var CallServerList = [];
        dbModel.LoadBalancer.find({where :[{id: lbId}], include: [{model: dbModel.Cloud, as: "Cloud", include: [{model: dbModel.CallServer, as: "CallServer"}]}]}).complete(function(err, resultInfo)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancer] - [%s] - PGSQL query failed', reqId, err);

                callback(err, CallServerList);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancer] - [%s] - PGSQL query success', reqId);
                if(resultInfo.Cloud)
                {
                    if(resultInfo.Cloud.CallServer && resultInfo.Cloud.CallServer.length > 0)
                    {
                        CallServerList.push.apply(CallServerList, resultInfo.Cloud.CallServer);
                        //get all clouds where parentcloudId equals cloud id

                        var clusterId = resultInfo.Cloud.id;

                        dbModel.Cloud.findAll({where :[{ParentCloudId: clusterId}], include: [{model: dbModel.CallServer, as: "CallServer"}]}).complete(function(err, childCloudInfo)
                        {
                            if(err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancer] - [%s] - PGSQL query failed', reqId, err);
                                //give other call servers only
                                callback(err, CallServerList);
                            }
                            else if(childCloudInfo)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancer] - [%s] - PGSQL query success', reqId);
                                childCloudInfo.forEach(function(cld)
                                {
                                    if(cld.CallServer)
                                    {
                                        //add callserver details to array
                                        CallServerList.push(cld.CallServer);
                                    }
                                })

                                callback(err, CallServerList);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancer] - [%s] - PGSQL query success', reqId);
                                callback(err, CallServerList);
                            }

                        });
                    }
                    else
                    {
                        callback(err, CallServerList);
                    }
                }
                else
                {
                    callback(err, CallServerList);
                }
            }

        })
    }
    catch(ex)
    {
        callback(err, undefined);
    }

}


var setTrunkEnabledStatus = function(reqId, gwId, status, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: gwId}]}).complete(function(err, gwObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.setTrunkEnabledStatus] - [%s] - PGSQL query failed', reqId, err);

                callback(err, false);
            }
            else if(gwObj)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.setTrunkEnabledStatus] - [%s] - PGSQL query success', reqId);
                //update
                gwObj.updateAttributes({Enable: status}).complete(function (err) {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.setTrunkEnabledStatus] - [%s] - PGSQL query failed', reqId, err);

                        callback(err, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.setTrunkEnabledStatus] - [%s] - PGSQL query success', reqId);
                        callback(undefined, true);
                    }
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.setTrunkEnabledStatus] - [%s] - PGSQL query success', reqId);
                callback(new Error("Trunk Not Found for Given Id"), false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var AssignTrunkToProfile = function(reqId, gwId, profileId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where: [{id: profileId}, {ObjType: "EXTERNAL"}]}).complete(function (err, profRec)
        {

            if (err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query failed', reqId, err);
                callback(err, false);
            }
            else if (profRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query success', reqId);
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query failed', reqId, err);
                        callback(err, false);
                    }
                    else if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query success', reqId);
                        profRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if (err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query failed', reqId, err);
                                callback(err, false);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query success', reqId);
                                callback(err, true);
                            }

                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query success', reqId);
                        callback(new Error('Trunk not found'), false);
                    }

                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - PGSQL query success', reqId);
                callback(new Error('Sip network profile not found'), false);
            }
         });
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var AssignTrunkToLoadBalancer = function(reqId, gwId, lbId, callback)
{
    try
    {
        dbModel.LoadBalancer.find({where: [{id: lbId}]}).complete(function (err, lbRec)
        {
            if(err)
            {
                callback(err, false);
            }
            else if(lbRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        callback(err, false);
                    }
                    else if(gwRec)
                    {
                        lbRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if(!err)
                            {
                                callback(undefined, true);
                            }
                            else
                            {
                                callback(err, false);
                            }

                        })
                    }
                    else
                    {
                        callback(undefined, false);
                    }

                })
            }
            else
            {
                callback(undefined, false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var AssignTrunkTranslation = function(reqId, gwId, transId, callback)
{
    try
    {
        dbModel.Translation.find({where: [{id: transId}]}).complete(function (err, transRec)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - PGSQL query success', reqId);
            }
            if (!err && transRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - PGSQL query failed', reqId, err);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - PGSQL query success', reqId);
                    }
                    if (!err && gwRec)
                    {
                        transRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if(err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - PGSQL query failed', reqId, err);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - PGSQL query success', reqId);
                            }
                            if(!err)
                            {
                                callback(undefined, true);
                            }
                            else
                            {
                                callback(err, true);
                            }

                        })
                    }
                    else
                    {
                        callback(undefined, false);
                    }

                })

            }
            else
            {
                callback(undefined, false);
            }})
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var AssignOperatorToTrunk = function(reqId, gwId, opId, callback)
{
    try
    {
        dbModel.TrunkOperator.find({where: [{id: opId}]}).complete(function (err, opRec)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - PGSQL query success', reqId);
            }
            if (!err && opRec)
            {
                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - PGSQL query failed', reqId, err);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - PGSQL query success', reqId);
                    }
                    if (!err && gwRec)
                    {
                        opRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if(err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - PGSQL query failed', reqId, err);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - PGSQL query success', reqId);
                            }
                            if(!err)
                            {
                                callback(undefined, true);
                            }
                            else
                            {
                                callback(err, true);
                            }

                        })
                    }
                    else
                    {
                        callback(undefined, false);
                    }

                })

            }
            else
            {
                callback(undefined, false);
            }})
    }
    catch(ex)
    {
        callback(ex, false);
    }

};

var addTrunkConfiguration = function(reqId, gwInfo, callback)
{
    try {

        var gw = dbModel.Trunk.build({
            TrunkCode: gwInfo.TrunkCode,
            TrunkName: gwInfo.TrunkName,
            ObjClass: gwInfo.ObjClass,
            ObjType: gwInfo.ObjType,
            ObjCategory: gwInfo.ObjCategory,
            IpUrl: gwInfo.IpUrl,
            Enable: gwInfo.Enable,
            CompanyId: gwInfo.CompanyId,
            TenantId: gwInfo.TenantId
        });

        gw
            .save()
            .complete(function (err) {

                if (err) {
                    logger.error('[DVP-PhoneNumberTrunkService.addTrunkConfiguration] - [%s] - PGSQL query failed', reqId, err);
                    callback(err, -1, false);
                }
                else {
                    logger.debug('[DVP-PhoneNumberTrunkService.addTrunkConfiguration] - [%s] - PGSQL query success', reqId);
                    var gwId = gw.id;
                    callback(undefined, gwId, true);
                }


            })

    }
    catch(ex)
    {
        callback(ex, -1, false);
    }
}

var AddTrunkOperator = function(reqId, opInfo, callback)
{
    try {

        var op = dbModel.TrunkOperator.build({
            OperatorName: opInfo.OperatorName,
            OperatorCode: opInfo.OperatorCode,
            ObjClass: opInfo.ObjClass,
            ObjType: opInfo.ObjType,
            ObjCategory: opInfo.ObjCategory,
            CompanyId: opInfo.CompanyId,
            TenantId: opInfo.TenantId
        });

        gw
            .save()
            .complete(function (err) {

                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - PGSQL query failed', reqId, err);
                        callback(err, -1, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - PGSQL query success', reqId);
                        var opId = op.id;
                        callback(undefined, opId, true);
                    }


            })

    }
    catch(ex)
    {
        callback(ex, -1, false);
    }
}

var updateTrunkConfiguration = function(reqId, trunkId, trunkInfo, callback)
{
    try
    {
        dbModel.Trunk.find({where:[{ id: trunkId }]}).complete(function(err, gwObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.updateTrunkConfiguration] - [%s] - PGSQL query failed', reqId, err);
                callback(err, false);
            }
            else if(gwObj)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.updateTrunkConfiguration] - [%s] - PGSQL query success', reqId);
                //update
                gwObj.updateAttributes({TrunkName: trunkInfo.TrunkName, Enable: trunkInfo.Enable, ObjClass: trunkInfo.ObjClass, IpUrl: trunkInfo.IpUrl, ObjType: trunkInfo.ObjType, ObjCategory: trunkInfo.ObjCategory}).complete(function (err) {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.updateTrunkConfiguration] - [%s] - PGSQL query failed', reqId, err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.updateTrunkConfiguration] - [%s] - PGSQL query success', reqId);
                        callback(undefined, true);
                    }
                })
            }
            else
            {
                callback(new Error("Trunk Not Found for Given Id"), false);
            }
        })
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var removePhoneNumber = function(reqId, phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumber}, {CompanyId: companyId}]}).complete(function (err, phnNum)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.removePhoneNumber] - [%s] - PGSQL query failed', reqId, err);
                callback(err, false);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.removePhoneNumber] - [%s] - PGSQL query success', reqId);
                if(phnNum)
                {
                    phnNum.destroy().complete(function (err1, rslt)
                    {
                        if(!err1)
                        {
                            logger.debug('[DVP-PhoneNumberTrunkService.removePhoneNumber] - [%s] - PGSQL query success', reqId);
                            callback(undefined, true);
                        }
                        else
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.removePhoneNumber] - [%s] - PGSQL query failed', reqId, err);
                            callback(err1, false);
                        }
                    });
                }
                else
                {
                    callback(new Error('Cannot find a phone number for the company'), false);
                }

            }
        });

    }
    catch(ex)
    {
        callback(ex, false);
    }
}

var addPhoneNumbersToTrunk = function(reqId, trunkId, phoneNumberInfo, callback)
{
    try
    {
        if(phoneNumberInfo)
        {
            dbModel.Trunk.find({where: [{id: trunkId}, {CompanyId: phoneNumberInfo.CompanyId}]}).complete(function (err, gwObj) {

                try
                {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query failed', reqId, err);
                        callback(err, -1, false);
                    }
                    else if (gwObj)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query success', reqId);

                        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumberInfo.PhoneNumber}]}).complete(function (error, phnNum)
                        {
                            if(err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query failed', reqId, err);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query success', reqId);
                            }
                            try
                            {
                                if(phnNum)
                                {
                                    if(phnNum.CompanyId == phoneNumberInfo.CompanyId)
                                    {
                                        callback(new Error("Number already in use", -1, false));
                                    }
                                    else
                                    {
                                        callback(new Error("Another company using same phone number", -1, false));
                                    }
                                }
                                else
                                {
                                    //add phone number
                                    var phoneNum = dbModel.TrunkPhoneNumber.build({
                                        PhoneNumber: phoneNumberInfo.PhoneNumber,
                                        ObjClass: phoneNumberInfo.ObjClass,
                                        ObjType: phoneNumberInfo.ObjType,
                                        ObjCategory: phoneNumberInfo.ObjCategory,
                                        Enable: phoneNumberInfo.Enable,
                                        CompanyId: phoneNumberInfo.CompanyId,
                                        TenantId: phoneNumberInfo.TenantId
                                    });

                                    phoneNum
                                        .save()
                                        .complete(function (err)
                                        {
                                            try
                                            {
                                                if (err)
                                                {
                                                    logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query failed', reqId, err);
                                                    callback(err, -1, false);
                                                }
                                                else
                                                {
                                                    logger.debug('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query success', reqId);
                                                    try
                                                    {
                                                        gwObj.addTrunkPhoneNumber(phoneNum).complete(function (err, rslt)
                                                        {
                                                            try
                                                            {
                                                                if(err)
                                                                {
                                                                    logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query failed', reqId, err);
                                                                    phoneNum.delete().complete(function (err1, rslt)
                                                                    {
                                                                        if(!err1)
                                                                        {
                                                                            callback(err, -1, false);
                                                                        }
                                                                        else
                                                                        {
                                                                            callback(err1, -1, false);
                                                                        }
                                                                    });

                                                                }
                                                                else
                                                                {
                                                                    logger.debug('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query success', reqId);
                                                                    callback(err, phoneNum.id, true);
                                                                }
                                                            }
                                                            catch(ex)
                                                            {
                                                                callback(ex,-1, false);
                                                            }


                                                        });
                                                    }
                                                    catch(ex)
                                                    {
                                                        phoneNum.destroy().complete(function (err1, rslt)
                                                        {
                                                            if(!err1)
                                                            {
                                                                logger.debug('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query success', reqId);
                                                                callback(ex, -1, false);
                                                            }
                                                            else
                                                            {
                                                                logger.error('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query failed', reqId, err);
                                                                callback(err1, -1, false);
                                                            }
                                                        });
                                                    }

                                                }
                                            }
                                            catch (ex)
                                            {
                                                callback(ex,-1, false);
                                            }

                                        })

                                }
                            }
                            catch(ex)
                            {
                                callback(ex, -1, false);
                            }

                        });


                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.addPhoneNumbersToTrunk] - [%s] - PGSQL query success', reqId);
                        callback(new Error("Trunk Not Found for Given Id and Company"), -1, false);
                    }
                }
                catch(ex)
                {
                    callback(ex, -1, false);
                }

            })
        }
        else
        {
            callback(new Error("Empty phone number info"), -1, false);
        }
    }
    catch(ex)
    {
        callback(ex, -1, false);
    }
};

var GetUnallocatedPhoneNumbersForOperator = function(reqId, operatorId, companyId, tenantId, callback)
{
    try
    {

        dbModel.TrunkOperator.find({where: [{id: operatorId}, {CompanyId: companyId}, {TenantId: tenantId}], include : [{model: dbModel.Trunk, as : "Trunk", include : [{model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber", where : [{CompanyId : companyId}, {TenantId: tenantId}]}]}]}).complete(function (err, result)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - PGSQL query success', reqId);
            }
            callback(err, result);
        })

    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

var GetAllocatedPhoneNumbersForOperator = function(reqId, operatorId, companyId, tenantId, callback)
{
    try
    {

        dbModel.TrunkOperator.find({where: [{id: operatorId}, {CompanyId: companyId}, {TenantId: tenantId}], include : [{model: dbModel.Trunk, as : "Trunk", include : [{model: dbModel.TrunkPhoneNumber, as: "TrunkPhoneNumber", where : [dbModel.SequelizeConn.or({CompanyId : {not: companyId }}, {TenantId: {not: tenantId }})]}]}]}).complete(function (err, result)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetAllocatedPhoneNumbersForOperator] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetAllocatedPhoneNumbersForOperator] - [%s] - PGSQL query success', reqId);
            }
            callback(err, result);
        })

    }
    catch(ex)
    {
        callback(ex, undefined);
    }
};

module.exports.addTrunkConfiguration = addTrunkConfiguration;
module.exports.AssignTrunkToLoadBalancer = AssignTrunkToLoadBalancer;
module.exports.setTrunkEnabledStatus = setTrunkEnabledStatus;
module.exports.getTrunkById = getTrunkById;
module.exports.updateTrunkConfiguration = updateTrunkConfiguration;
module.exports.switchPhoneNumberCompany = switchPhoneNumberCompany;
module.exports.removePhoneNumber = removePhoneNumber;
module.exports.addPhoneNumbersToTrunk = addPhoneNumbersToTrunk;
module.exports.AssignTrunkToProfile = AssignTrunkToProfile;
module.exports.AssignTrunkTranslation = AssignTrunkTranslation;
module.exports.AddTrunkOperator = AddTrunkOperator;
module.exports.AssignOperatorToTrunk = AssignOperatorToTrunk;
module.exports.GetCallServerByProfileId = GetCallServerByProfileId;
module.exports.GetCallServersRelatedToLoadBalancer = GetCallServersRelatedToLoadBalancer;
module.exports.GetUnallocatedPhoneNumbersForOperator = GetUnallocatedPhoneNumbersForOperator;
module.exports.GetAllocatedPhoneNumbersForOperator = GetAllocatedPhoneNumbersForOperator;
