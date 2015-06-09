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

var SwitchPhoneNumberCompanyDB = function(reqId, phoneNumber, companyId, tenantId, companyToChange, tenantToChange, callback)
{
    try
    {

        dbModel.TrunkPhoneNumber.find({ where: [{PhoneNumber: phoneNumber }, { CompanyId: companyId}]}).complete(function(err, phnNumInfo)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Get trunk phone number PGSQL query failed', reqId, err);

                callback(err, false);
            }
            else if(phnNumInfo)
            {
                //update
                logger.debug('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Get trunk phone number PGSQL query success', reqId);
                phnNumInfo.updateAttributes({CompanyId: companyToChange, TenantId: tenantToChange}).complete(function (err)
                {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - update phone number company PGSQL query failed', reqId, err);

                        callback(err, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - update phone number company PGSQL query success', reqId);

                        callback(undefined, true);
                    }
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Get trunk phone number PGSQL query success', reqId);
                callback(new Error("Unable to find a phone number registered to given company"), false);
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.SwitchPhoneNumberCompanyDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var GetTrunkByIdDB = function(reqId, trunkId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: trunkId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function(err, trunkObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - PGSQL get trunk query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - PGSQL get trunk query success', reqId);
            }

            callback(err, trunkObj);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetTrunkByIdDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var GetCallServerByProfileIdDB = function(reqId, profileId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where :[{id: profileId}], include: [{model: dbModel.CallServer, as: "CallServer"}]}).complete(function(err, csObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetCallServerByProfileIdDB] - [%s] - PGSQL query failed', reqId, err);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServerByProfileIdDB] - [%s] - PGSQL query success', reqId);
            }

            callback(err, csObj);
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.GetCallServerByProfileIdDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

var GetCallServersRelatedToLoadBalancerDB = function(reqId, lbId, callback)
{
    var CallServerList = [];
    try
    {
        dbModel.LoadBalancer.find({where :[{id: lbId}], include: [{model: dbModel.Cloud, as: "Cloud", include: [{model: dbModel.CallServer, as: "CallServer"}]}]}).complete(function(err, resultInfo)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - Get callservers related to load balancer PGSQL query failed', reqId, err);

                callback(err, CallServerList);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - Get callservers related to load balancer PGSQL query success', reqId);
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
                                logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - PGSQL query failed', reqId, err);
                                //give other call servers only
                                callback(err, CallServerList);
                            }
                            else if(childCloudInfo)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - PGSQL query success', reqId);
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
                                logger.debug('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - PGSQL query success', reqId);
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
        logger.error('[DVP-PhoneNumberTrunkService.GetCallServersRelatedToLoadBalancerDB] - [%s] - Exception occurred', reqId, ex);
        callback(err, CallServerList);
    }

};

var SetTrunkEnabledStatusDB = function(reqId, gwId, status, companyId, tenantId, callback)
{
    try
    {
        dbModel.Trunk.find({where :[{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function(err, gwObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL get trunk query failed', reqId, err);

                callback(err, false);
            }
            else if(gwObj)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL get trunk query success', reqId);
                //update


                gwObj.updateAttributes({Enable: status}).complete(function (err)
                {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL update trunk availability query failed', reqId, err);

                        callback(err, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL update trunk availability query success', reqId);
                        callback(undefined, true);
                    }
                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - PGSQL get trunk query success', reqId);
                callback(new Error("Trunk Not Found for Given Id"), false);
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.SetTrunkEnabledStatusDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var AssignTrunkToProfile = function(reqId, gwId, profileId, companyId, tenantId, callback)
{
    try
    {
        dbModel.SipNetworkProfile.find({where: [{id: profileId},{CompanyId: companyId},{TenantId: tenantId},{ObjType: "EXTERNAL"}]}).complete(function (err, profRec)
        {

            if (err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get sip profile PGSQL query failed', reqId, err);
                callback(err, false);
            }
            else if (profRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get sip profile PGSQL query success', reqId);
                dbModel.Trunk.find({where: [{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get trunk PGSQL query failed', reqId, err);
                        callback(err, false);
                    }
                    else if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get trunk PGSQL query success', reqId);
                        profRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if (err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - update trunk with profile PGSQL query failed', reqId, err);
                                callback(err, false);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - update trunk with profile PGSQL query success', reqId);
                                callback(err, true);
                            }

                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get trunk PGSQL query success', reqId);
                        callback(new Error('Trunk not found'), false);
                    }

                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - get sip profile PGSQL query success', reqId);
                callback(new Error('Sip network profile not found'), false);
            }
         });
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToProfile] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignTrunkToLoadBalancer = function(reqId, gwId, lbId, companyId, tenantId, callback)
{
    try
    {
        dbModel.LoadBalancer.find({where: [{id: lbId}]}).complete(function (err, lbRec)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get load balancer query failed', reqId, err);
                callback(err, false);
            }
            else if(lbRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get load balancer query success', reqId);
                dbModel.Trunk.find({where: [{id: gwId},{CompanyId : companyId},{TenantId : tenantId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get trunk query failed', reqId, err);
                        callback(err, false);
                    }
                    else if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get trunk query success', reqId);

                        lbRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if(!err)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL update trunk with loadbalancer id query success', reqId);
                                callback(undefined, true);
                            }
                            else
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL update trunk with loadbalancer id query failed', reqId, err);
                                callback(err, false);
                            }

                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get trunk query success', reqId);
                        callback(new Error('Trunk Not Found'), false);
                    }

                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - PGSQL get load balancer query success', reqId);
                callback(new Error('Load balancer not found'), false);
            }
        })
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkToLoadBalancer] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignTrunkTranslation = function(reqId, gwId, transId, companyId, tenantId, callback)
{
    try
    {
        dbModel.Translation.find({where: [{id: transId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function (err, transRec)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get translation PGSQL query failed', reqId, err);
            }
            else if(transRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get translation PGSQL query success', reqId);

                dbModel.Trunk.find({where: [{id: gwId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get trunk PGSQL query failed', reqId, err);
                    }
                    else if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get trunk PGSQL query success', reqId);

                        transRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if(!err)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - Update trunk with translation id PGSQL query success', reqId);
                                callback(undefined, true);
                            }
                            else
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - Update trunk with translation id PGSQL query failed', reqId, err);
                                callback(err, false);
                            }

                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get trunk PGSQL query success', reqId);
                        callback(new Error('No trunk found'), false);
                    }

                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - get translation PGSQL query success', reqId);
                callback(new Error('Translation not found'), false);
            }})
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignTrunkTranslation] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AssignOperatorToTrunk = function(reqId, gwId, opId, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkOperator.find({where: [{id: opId}]}).complete(function (err, opRec)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get operator PGSQL query failed', reqId, err);
            }
            else if(opRec)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get operator PGSQL query success', reqId);

                dbModel.Trunk.find({where: [{id: gwId},{CompanyId: companyId},{TenantId: tenantId}]}).complete(function (err, gwRec)
                {
                    if(err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get trunk PGSQL query failed', reqId, err);
                    }
                    else if(gwRec)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get trunk PGSQL query success', reqId);

                        opRec.addTrunk(gwRec).complete(function (err, result)
                        {
                            if(err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Update trunk with operator Id PGSQL query failed', reqId, err);
                                callback(err, false);
                            }
                            else
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Update trunk with operator Id PGSQL query success', reqId);
                                callback(undefined, true);
                            }

                        })
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get trunk PGSQL query success', reqId);
                        callback(new Error('Trunk Not found'), false);
                    }

                })
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Get operator PGSQL query success', reqId);
                callback(new Error('Operator Not found'), false);
            }})
    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AssignOperatorToTrunk] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }

};

var AddTrunkConfigurationDB = function(reqId, gwInfo, callback)
{
    try
    {

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

                if (err)
                {
                    logger.error('[DVP-PhoneNumberTrunkService.AddTrunkConfigurationDB] - [%s] - Insert Trunk PGSQL query failed', reqId, err);
                    callback(err, -1, false);
                }
                else {
                    logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkConfigurationDB] - [%s] - Insert Trunk PGSQL query success', reqId);
                    var gwId = gw.id;
                    callback(undefined, gwId, true);
                }


            })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkConfigurationDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, -1, false);
    }
};

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

        op
            .save()
            .complete(function (err) {

                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - insert trunk operator PGSQL query failed', reqId, err);
                        callback(err, -1, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - insert trunk operator PGSQL query success', reqId);
                        var opId = op.id;
                        callback(undefined, opId, true);
                    }


            })

    }
    catch(ex)
    {
        logger.error('[DVP-PhoneNumberTrunkService.AddTrunkOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, -1, false);
    }
};

var UpdateTrunkConfigurationDB = function(reqId, trunkId, trunkInfo, callback)
{
    try
    {
        dbModel.Trunk.find({where:[{ id: trunkId },{ CompanyId: trunkInfo.CompanyId },{ TenantId: trunkInfo.TenantId }]}).complete(function(err, gwObj)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL get trunk query failed', reqId, err);
                callback(err, false);
            }
            else if(gwObj)
            {
                logger.debug('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL get trunk query success', reqId);
                //update
                gwObj.updateAttributes({TrunkName: trunkInfo.TrunkName, Enable: trunkInfo.Enable, ObjClass: trunkInfo.ObjClass, IpUrl: trunkInfo.IpUrl, ObjType: trunkInfo.ObjType, ObjCategory: trunkInfo.ObjCategory}).complete(function (err)
                {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL update trunk query failed', reqId, err);
                        callback(err, false);
                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - PGSQL update trunk query success', reqId);
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
        logger.error('[DVP-PhoneNumberTrunkService.UpdateTrunkConfigurationDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var RemovePhoneNumberDB = function(reqId, phoneNumber, companyId, tenantId, callback)
{
    try
    {
        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumber}, {CompanyId: companyId}, {TenantId: tenantId}]}).complete(function (err, phnNum)
        {
            if(err)
            {
                logger.error('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - get phone number PGSQL query failed', reqId, err);
                callback(err, false);
            }
            else
            {
                logger.debug('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - get phone number PGSQL query success', reqId);
                if(phnNum)
                {
                    phnNum.destroy().complete(function (err1, rslt)
                    {
                        if(!err1)
                        {
                            logger.debug('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - delete phone number PGSQL query success', reqId);
                            callback(undefined, true);
                        }
                        else
                        {
                            logger.error('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - delete phone number PGSQL query failed', reqId, err);
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
        logger.error('[DVP-PhoneNumberTrunkService.RemovePhoneNumberDB] - [%s] - Exception occurred', reqId, ex);
        callback(ex, false);
    }
};

var AddPhoneNumbersToTrunkDB = function(reqId, phoneNumberInfo, callback)
{
    try
    {
        if(phoneNumberInfo)
        {
            dbModel.Trunk.find({where: [{id: phoneNumberInfo.TrunkId}, {TenantId: phoneNumberInfo.TenantId}]}).complete(function (err, gwObj)
            {
                try
                {
                    if (err)
                    {
                        logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk PGSQL query failed', reqId, err);
                        callback(err, -1, false);
                    }
                    else if (gwObj)
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk PGSQL query success', reqId);

                        dbModel.TrunkPhoneNumber.find({where: [{PhoneNumber: phoneNumberInfo.PhoneNumber}]}).complete(function (error, phnNum)
                        {
                            if(err)
                            {
                                logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk number PGSQL query failed', reqId, err);
                                callback(err, -1, false);
                            }
                            else if(phnNum)
                            {
                                logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk number PGSQL query success', reqId);

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

                                            if (err)
                                            {
                                                logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Insert phone number PGSQL query failed', reqId, err);
                                                callback(err, -1, false);
                                            }
                                            else
                                            {
                                                logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Insert phone number PGSQL query success', reqId);
                                                try
                                                {
                                                    gwObj.addTrunkPhoneNumber(phoneNum).complete(function (err, rslt)
                                                    {
                                                        if (err)
                                                        {
                                                            logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Update phone number with trunk id PGSQL query failed', reqId, err);
                                                            callback(err, phoneNum.id, false);
                                                        }
                                                        else
                                                        {
                                                            logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Update phone number with trunk id PGSQL query success', reqId);
                                                            callback(undefined, phoneNum.id, true);
                                                        }

                                                    });
                                                }
                                                catch(ex)
                                                {
                                                    callback(err, phoneNum.id, false);
                                                }

                                            }

                                    })

                            }

                        });


                    }
                    else
                    {
                        logger.debug('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Get Trunk PGSQL query success', reqId);
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
        logger.error('[DVP-PhoneNumberTrunkService.AddPhoneNumbersToTrunkDB] - [%s] - Exception occurred', reqId, ex);
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
        logger.error('[DVP-PhoneNumberTrunkService.GetUnallocatedPhoneNumbersForOperator] - [%s] - Exception occurred', reqId, ex);
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
        logger.error('[DVP-PhoneNumberTrunkService.GetAllocatedPhoneNumbersForOperator] - [%s] - Exception occurred', reqId, ex);
        callback(ex, undefined);
    }
};

module.exports.AddTrunkConfigurationDB = AddTrunkConfigurationDB;
module.exports.AssignTrunkToLoadBalancer = AssignTrunkToLoadBalancer;
module.exports.SetTrunkEnabledStatusDB = SetTrunkEnabledStatusDB;
module.exports.GetTrunkByIdDB = GetTrunkByIdDB;
module.exports.UpdateTrunkConfigurationDB = UpdateTrunkConfigurationDB;
module.exports.SwitchPhoneNumberCompanyDB = SwitchPhoneNumberCompanyDB;
module.exports.RemovePhoneNumberDB = RemovePhoneNumberDB;
module.exports.AddPhoneNumbersToTrunkDB = AddPhoneNumbersToTrunkDB;
module.exports.AssignTrunkToProfile = AssignTrunkToProfile;
module.exports.AssignTrunkTranslation = AssignTrunkTranslation;
module.exports.AddTrunkOperator = AddTrunkOperator;
module.exports.AssignOperatorToTrunk = AssignOperatorToTrunk;
module.exports.GetCallServerByProfileIdDB = GetCallServerByProfileIdDB;
module.exports.GetCallServersRelatedToLoadBalancerDB = GetCallServersRelatedToLoadBalancerDB;
module.exports.GetUnallocatedPhoneNumbersForOperator = GetUnallocatedPhoneNumbersForOperator;
module.exports.GetAllocatedPhoneNumbersForOperator = GetAllocatedPhoneNumbersForOperator;
